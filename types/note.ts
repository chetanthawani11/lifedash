// Note System Data Models and Validation Schemas
// This file defines the shape of all note-related data in LifeDash

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

/**
 * NoteFolder - Organize notes into folders (can be nested)
 * Example: "Web Development" folder containing "React Notes" subfolder
 */
export interface NoteFolder {
  id: string;                    // Unique identifier
  userId: string;                // Who owns this folder
  name: string;                  // Folder name (e.g., "Web Development")
  description: string | null;    // Optional description
  color: string;                 // Color for visual organization
  icon: string;                  // Emoji or icon (e.g., "📁")
  parentId: string | null;       // Parent folder ID (null = root level)
  noteCount: number;             // Number of notes in this folder
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Note - A learning note with markdown content
 * Example: "React Hooks Guide" with detailed explanations
 */
export interface Note {
  id: string;                    // Unique identifier
  userId: string;                // Who owns this note
  folderId: string | null;       // Which folder (null = root level)
  title: string;                 // Note title (e.g., "React Hooks Explained")
  content: string;               // Markdown content
  tags: string[];                // Tags for organization
  linkedFlashcardDecks: string[]; // IDs of related flashcard decks
  linkedNotes: string[];         // IDs of related notes (cross-references)
  isPinned: boolean;             // Pin important notes to top
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a NEW note folder
 */
export const createNoteFolderSchema = z.object({
  name: z.string()
    .min(1, 'Folder name is required')
    .max(50, 'Folder name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .trim()
    .nullable()
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color')
    .default('#3b82f6'),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(10, 'Icon must be a single emoji or short text')
    .default('📁'),
  parentId: z.string()
    .nullable()
    .optional(),
});

/**
 * Schema for updating a note folder
 */
export const updateNoteFolderSchema = createNoteFolderSchema.partial();

/**
 * Schema for creating a NEW note
 */
export const createNoteSchema = z.object({
  folderId: z.string()
    .nullable()
    .optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  content: z.string()
    .max(50000, 'Content is too long (max 50,000 characters)')
    .default(''),
  tags: z.array(z.string().trim().toLowerCase())
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  linkedFlashcardDecks: z.array(z.string())
    .max(20, 'Maximum 20 linked decks allowed')
    .default([]),
  linkedNotes: z.array(z.string())
    .max(20, 'Maximum 20 linked notes allowed')
    .default([]),
  isPinned: z.boolean()
    .default(false),
});

/**
 * Schema for updating a note
 */
export const updateNoteSchema = createNoteSchema.partial();

// ============================================
// TYPESCRIPT TYPES FROM ZOD SCHEMAS
// ============================================

export type CreateNoteFolderInput = z.infer<typeof createNoteFolderSchema>;
export type UpdateNoteFolderInput = z.infer<typeof updateNoteFolderSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Note with folder information
 */
export interface NoteWithFolder extends Note {
  folder: Pick<NoteFolder, 'name' | 'color' | 'icon'> | null;
}

/**
 * Folder with subfolder and note counts
 */
export interface FolderWithCounts extends NoteFolder {
  subfolderCount: number;
  totalNotesInHierarchy: number; // Including subfolders
}

/**
 * Firestore document data (without id)
 */
export type NoteFolderData = Omit<NoteFolder, 'id'>;
export type NoteData = Omit<Note, 'id'>;

/**
 * Search result with highlighting
 */
export interface NoteSearchResult {
  note: Note;
  matchedIn: ('title' | 'content' | 'tags')[];
  snippet?: string; // Content snippet showing match
}
