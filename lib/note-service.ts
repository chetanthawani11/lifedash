// Note Service - All database operations for notes and folders
// This is like a librarian who knows how to organize and find your notes

import {
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  where,
  orderBy,
  limit,
  now,
} from './db-utils';

import {
  NoteFolder,
  NoteFolderData,
  CreateNoteFolderInput,
  UpdateNoteFolderInput,
  createNoteFolderSchema,
  updateNoteFolderSchema,
} from '@/types';

import { Unsubscribe } from 'firebase/firestore';

// Collection names in Firestore
const FOLDERS_COLLECTION = 'note_folders';
const NOTES_COLLECTION = 'notes';

// ============================================
// FOLDER OPERATIONS
// ============================================

/**
 * Create a new note folder
 *
 * EXPLANATION:
 * This creates a new folder where you can organize notes.
 * Like creating a new folder on your computer!
 *
 * @param userId - The user ID
 * @param input - Folder data (name, color, icon, etc.)
 * @returns The created folder with its ID
 */
export const createNoteFolder = async (
  userId: string,
  input: CreateNoteFolderInput
): Promise<NoteFolder> => {
  // Validate the input data
  const validatedData = createNoteFolderSchema.parse(input);

  const folderData: NoteFolderData = {
    userId,
    name: validatedData.name,
    description: validatedData.description || null,
    color: validatedData.color,
    icon: validatedData.icon,
    parentId: validatedData.parentId || null,
    noteCount: 0,
    createdAt: now(),
    updatedAt: now(),
  };

  const folderId = await createDocument<NoteFolderData>(
    userId,
    FOLDERS_COLLECTION,
    folderData
  );

  return {
    id: folderId,
    ...folderData,
  };
};

/**
 * Get a single folder by ID
 *
 * EXPLANATION:
 * Retrieves one specific folder so you can see its details.
 */
export const getNoteFolder = async (
  userId: string,
  folderId: string
): Promise<NoteFolder | null> => {
  return getDocument<NoteFolder>(userId, FOLDERS_COLLECTION, folderId);
};

/**
 * Get all folders for a user
 *
 * EXPLANATION:
 * Gets ALL your note folders so you can see them in a list.
 */
export const getUserNoteFolders = async (
  userId: string
): Promise<NoteFolder[]> => {
  return getDocuments<NoteFolder>(
    userId,
    FOLDERS_COLLECTION,
    [orderBy('name', 'asc')]
  );
};

/**
 * Get subfolders of a parent folder
 *
 * EXPLANATION:
 * Gets all folders inside another folder (nested folders).
 * Example: Get all folders inside "Web Development"
 */
export const getSubfolders = async (
  userId: string,
  parentId: string
): Promise<NoteFolder[]> => {
  return getDocuments<NoteFolder>(
    userId,
    FOLDERS_COLLECTION,
    [where('parentId', '==', parentId), orderBy('name', 'asc')]
  );
};

/**
 * Get root folders (folders with no parent)
 *
 * EXPLANATION:
 * Gets top-level folders (not inside any other folder).
 * These are like the main folders you see first.
 */
export const getRootNoteFolders = async (
  userId: string
): Promise<NoteFolder[]> => {
  return getDocuments<NoteFolder>(
    userId,
    FOLDERS_COLLECTION,
    [where('parentId', '==', null), orderBy('name', 'asc')]
  );
};

/**
 * Update a folder
 *
 * EXPLANATION:
 * Changes a folder's name, color, icon, description, etc.
 */
export const updateNoteFolder = async (
  userId: string,
  folderId: string,
  updates: UpdateNoteFolderInput
): Promise<void> => {
  const validatedUpdates = updateNoteFolderSchema.parse(updates);
  await updateDocument(userId, FOLDERS_COLLECTION, folderId, {
    ...validatedUpdates,
    updatedAt: now(),
  });
};

/**
 * Delete a folder
 *
 * WARNING: This will also delete all subfolders and notes inside!
 *
 * EXPLANATION:
 * Deletes a folder and everything in it.
 * Be careful - this can't be undone!
 */
export const deleteNoteFolder = async (
  userId: string,
  folderId: string
): Promise<void> => {
  // Get all subfolders
  const subfolders = await getSubfolders(userId, folderId);

  // Delete each subfolder (recursive - calls itself)
  for (const subfolder of subfolders) {
    await deleteNoteFolder(userId, subfolder.id);
  }

  // Delete all notes in this folder
  const notes = await getFolderNotes(userId, folderId);
  for (const note of notes) {
    await deleteDocument(userId, NOTES_COLLECTION, note.id);
  }

  // Finally, delete the folder itself
  await deleteDocument(userId, FOLDERS_COLLECTION, folderId);
};

/**
 * Move a folder to a new parent (or to root)
 *
 * EXPLANATION:
 * Moves a folder inside another folder, or moves it to the top level.
 * Example: Move "React" folder from "Web Dev" to "JavaScript"
 */
export const moveNoteFolder = async (
  userId: string,
  folderId: string,
  newParentId: string | null
): Promise<void> => {
  // Safety check: Can't move folder into itself
  if (newParentId === folderId) {
    throw new Error('Cannot move folder into itself');
  }

  // Safety check: Can't move folder into its own subfolder
  if (newParentId) {
    const isDescendant = await checkIfDescendant(userId, folderId, newParentId);
    if (isDescendant) {
      throw new Error('Cannot move folder into its own subfolder');
    }
  }

  await updateNoteFolder(userId, folderId, {
    parentId: newParentId,
  });
};

/**
 * Check if a folder is a descendant of another
 *
 * EXPLANATION:
 * This checks if folder B is inside folder A (at any level).
 * Prevents circular references (folder inside itself).
 *
 * @param userId - User ID
 * @param ancestorId - Potential parent folder
 * @param descendantId - Folder to check
 * @returns True if descendant is inside ancestor
 */
const checkIfDescendant = async (
  userId: string,
  ancestorId: string,
  descendantId: string
): Promise<boolean> => {
  let currentId: string | null = descendantId;

  // Walk up the folder tree
  while (currentId) {
    if (currentId === ancestorId) {
      return true; // Found it! It's a descendant
    }

    // Get the parent folder
    const folder = await getNoteFolder(userId, currentId);
    if (!folder) break;

    currentId = folder.parentId;
  }

  return false; // Not a descendant
};

/**
 * Get folder hierarchy (breadcrumb path)
 *
 * EXPLANATION:
 * Gets the full path to a folder.
 * Example: ["Web Development", "React", "Hooks"]
 *
 * @param userId - User ID
 * @param folderId - Folder to get path for
 * @returns Array of folders from root to this folder
 */
export const getFolderPath = async (
  userId: string,
  folderId: string
): Promise<NoteFolder[]> => {
  const path: NoteFolder[] = [];
  let currentId: string | null = folderId;

  // Walk up the folder tree
  while (currentId) {
    const folder = await getNoteFolder(userId, currentId);
    if (!folder) break;

    path.unshift(folder); // Add to beginning of array
    currentId = folder.parentId;
  }

  return path;
};

/**
 * Update folder's note count
 *
 * EXPLANATION:
 * Counts how many notes are in a folder and updates the count.
 */
export const updateFolderNoteCount = async (
  userId: string,
  folderId: string
): Promise<void> => {
  const notes = await getFolderNotes(userId, folderId);
  await updateDocument(userId, FOLDERS_COLLECTION, folderId, {
    noteCount: notes.length,
    updatedAt: now(),
  });
};

/**
 * Subscribe to real-time folder updates
 *
 * EXPLANATION:
 * This sets up a listener that automatically updates when folders change.
 * Like watching a folder - you get notified of any changes!
 */
export const subscribeToUserNoteFolders = (
  userId: string,
  onUpdate: (folders: NoteFolder[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToCollection<NoteFolder>(
    userId,
    FOLDERS_COLLECTION,
    [orderBy('name', 'asc')],
    onUpdate,
    onError
  );
};

// ============================================
// NOTE OPERATIONS
// ============================================

/**
 * Create a new note
 *
 * EXPLANATION:
 * Creates a new note in a folder (or at root level if no folder specified).
 * Like creating a new document!
 *
 * @param userId - The user ID
 * @param input - Note data (title, content, folderId, etc.)
 * @returns The created note with its ID
 */
export const createNote = async (
  userId: string,
  input: {
    title: string;
    content: string;
    folderId: string | null;
    tags?: string[];
    linkedFlashcardDecks?: string[];
    linkedNotes?: string[];
  }
): Promise<any> => {
  const noteData = {
    userId,
    title: input.title,
    content: input.content,
    folderId: input.folderId || null,
    tags: input.tags || [],
    linkedFlashcardDecks: input.linkedFlashcardDecks || [],
    linkedNotes: input.linkedNotes || [],
    isPinned: false,
    createdAt: now(),
    updatedAt: now(),
  };

  const noteId = await createDocument(
    userId,
    NOTES_COLLECTION,
    noteData
  );

  // Update folder note count if note is in a folder
  if (input.folderId) {
    await updateFolderNoteCount(userId, input.folderId);
  }

  return {
    id: noteId,
    ...noteData,
  };
};

/**
 * Get a single note by ID
 */
export const getNote = async (
  userId: string,
  noteId: string
): Promise<any | null> => {
  return getDocument(userId, NOTES_COLLECTION, noteId);
};

/**
 * Get all notes for a user
 */
export const getUserNotes = async (
  userId: string
): Promise<any[]> => {
  return getDocuments(
    userId,
    NOTES_COLLECTION,
    [orderBy('updatedAt', 'desc')]
  );
};

/**
 * Get notes in a specific folder
 */
export const getFolderNotes = async (
  userId: string,
  folderId: string
): Promise<any[]> => {
  return getDocuments(
    userId,
    NOTES_COLLECTION,
    [where('folderId', '==', folderId), orderBy('updatedAt', 'desc')]
  );
};

/**
 * Get pinned notes
 */
export const getPinnedNotes = async (
  userId: string
): Promise<any[]> => {
  return getDocuments(
    userId,
    NOTES_COLLECTION,
    [where('isPinned', '==', true), orderBy('updatedAt', 'desc')]
  );
};

/**
 * Update a note
 */
export const updateNote = async (
  userId: string,
  noteId: string,
  updates: {
    title?: string;
    content?: string;
    folderId?: string | null;
    tags?: string[];
    isPinned?: boolean;
    linkedFlashcardDecks?: string[];
    linkedNotes?: string[];
  }
): Promise<void> => {
  const note = await getNote(userId, noteId);
  if (!note) throw new Error('Note not found');

  const oldFolderId = note.folderId;
  const newFolderId = updates.folderId !== undefined ? updates.folderId : oldFolderId;

  await updateDocument(userId, NOTES_COLLECTION, noteId, {
    ...updates,
    updatedAt: now(),
  });

  // Update folder note counts if folder changed
  if (oldFolderId !== newFolderId) {
    if (oldFolderId) {
      await updateFolderNoteCount(userId, oldFolderId);
    }
    if (newFolderId) {
      await updateFolderNoteCount(userId, newFolderId);
    }
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (
  userId: string,
  noteId: string
): Promise<void> => {
  const note = await getNote(userId, noteId);
  if (!note) return;

  await deleteDocument(userId, NOTES_COLLECTION, noteId);

  // Update folder note count
  if (note.folderId) {
    await updateFolderNoteCount(userId, note.folderId);
  }
};

/**
 * Search notes by title or content
 */
export const searchNotes = async (
  userId: string,
  query: string
): Promise<any[]> => {
  const allNotes = await getUserNotes(userId);
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(note =>
    note.title.toLowerCase().includes(lowerQuery) ||
    note.content.toLowerCase().includes(lowerQuery) ||
    note.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Toggle note pin status
 */
export const toggleNotePin = async (
  userId: string,
  noteId: string
): Promise<void> => {
  const note = await getNote(userId, noteId);
  if (!note) throw new Error('Note not found');

  await updateNote(userId, noteId, {
    isPinned: !note.isPinned,
  });
};

/**
 * Sort notes with pinned notes first
 */
export const sortNotesWithPinned = (notes: any[]): any[] => {
  return [...notes].sort((a, b) => {
    // Pinned notes come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Within same pin status, sort by updatedAt (most recent first)
    const aTime = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
    const bTime = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
    return bTime - aTime;
  });
};
