// Journal Service - All journal-related database operations
// This file handles creating, reading, updating, and deleting journals and entries

import {
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  where,
  orderBy,
  limit,
  now,
  dateToTimestamp,
} from './db-utils';

import {
  Journal,
  JournalEntry,
  JournalData,
  JournalEntryData,
  CreateJournalInput,
  UpdateJournalInput,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  createJournalSchema,
  updateJournalSchema,
  createJournalEntrySchema,
  updateJournalEntrySchema,
  JournalWithStats,
} from '@/types';

import { Unsubscribe } from 'firebase/firestore';

// Collection names
const JOURNALS_COLLECTION = 'journals';
const JOURNAL_ENTRIES_COLLECTION = 'journal_entries';

// ============================================
// JOURNAL OPERATIONS
// ============================================

/**
 * Create a new journal
 *
 * @param userId - User ID who owns this journal
 * @param input - Journal data (validated with Zod)
 * @returns The newly created journal with ID
 */
export const createJournal = async (
  userId: string,
  input: CreateJournalInput
): Promise<Journal> => {
  // Validate input with Zod
  const validatedData = createJournalSchema.parse(input);

  // Prepare journal data
  const journalData: JournalData = {
    userId,
    name: validatedData.name,
    description: validatedData.description || null,
    color: validatedData.color,
    icon: validatedData.icon,
    entryCount: 0,
    createdAt: now(),
    updatedAt: now(),
  };

  // Save to Firestore
  const journalId = await createDocument<JournalData>(
    userId,
    JOURNALS_COLLECTION,
    journalData
  );

  return {
    id: journalId,
    ...journalData,
  };
};

/**
 * Get a single journal by ID
 */
export const getJournal = async (
  userId: string,
  journalId: string
): Promise<Journal | null> => {
  return getDocument<Journal>(userId, JOURNALS_COLLECTION, journalId);
};

/**
 * Get all journals for a user
 *
 * @param userId - User ID
 * @param sortBy - Sort by 'name', 'createdAt', or 'updatedAt' (default: 'updatedAt')
 * @returns Array of journals sorted by the specified field
 */
export const getUserJournals = async (
  userId: string,
  sortBy: 'name' | 'createdAt' | 'updatedAt' = 'updatedAt'
): Promise<Journal[]> => {
  return getDocuments<Journal>(
    userId,
    JOURNALS_COLLECTION,
    [orderBy(sortBy, sortBy === 'name' ? 'asc' : 'desc')]
  );
};

/**
 * Update a journal
 */
export const updateJournal = async (
  userId: string,
  journalId: string,
  updates: UpdateJournalInput
): Promise<void> => {
  // Validate input
  const validatedUpdates = updateJournalSchema.parse(updates);

  await updateDocument(userId, JOURNALS_COLLECTION, journalId, validatedUpdates);
};

/**
 * Delete a journal and all its entries
 *
 * IMPORTANT: This will delete the journal AND all entries in it!
 */
export const deleteJournal = async (
  userId: string,
  journalId: string
): Promise<void> => {
  // First, delete all entries in this journal
  const entries = await getJournalEntries(userId, journalId);
  await Promise.all(
    entries.map(entry => deleteJournalEntry(userId, entry.id))
  );

  // Then delete the journal itself
  await deleteDocument(userId, JOURNALS_COLLECTION, journalId);
};

/**
 * Subscribe to real-time updates for a single journal
 *
 * @returns Unsubscribe function - IMPORTANT: Call this when component unmounts!
 */
export const subscribeToJournal = (
  userId: string,
  journalId: string,
  onUpdate: (journal: Journal | null) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToDocument<Journal>(
    userId,
    JOURNALS_COLLECTION,
    journalId,
    onUpdate,
    onError
  );
};

/**
 * Subscribe to real-time updates for all journals
 */
export const subscribeToUserJournals = (
  userId: string,
  onUpdate: (journals: Journal[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToCollection<Journal>(
    userId,
    JOURNALS_COLLECTION,
    [orderBy('updatedAt', 'desc')],
    onUpdate,
    onError
  );
};

// ============================================
// JOURNAL ENTRY OPERATIONS
// ============================================

/**
 * Create a new journal entry
 *
 * Also updates the journal's entryCount and updatedAt
 */
export const createJournalEntry = async (
  userId: string,
  input: CreateJournalEntryInput
): Promise<JournalEntry> => {
  // Validate input
  const validatedData = createJournalEntrySchema.parse(input);

  // Prepare entry data
  const entryData: JournalEntryData = {
    journalId: validatedData.journalId,
    userId,
    title: validatedData.title,
    content: validatedData.content,
    mood: validatedData.mood || null,
    tags: validatedData.tags || [],
    isFavorite: validatedData.isFavorite || false,
    createdAt: now(),
    updatedAt: now(),
  };

  // Save entry to Firestore
  const entryId = await createDocument<JournalEntryData>(
    userId,
    JOURNAL_ENTRIES_COLLECTION,
    entryData
  );

  // Update journal's entry count and updatedAt
  const journal = await getJournal(userId, validatedData.journalId);
  if (journal) {
    await updateDocument(userId, JOURNALS_COLLECTION, validatedData.journalId, {
      entryCount: journal.entryCount + 1,
      updatedAt: now(),
    });
  }

  return {
    id: entryId,
    ...entryData,
  };
};

/**
 * Get a single journal entry by ID
 */
export const getJournalEntry = async (
  userId: string,
  entryId: string
): Promise<JournalEntry | null> => {
  return getDocument<JournalEntry>(userId, JOURNAL_ENTRIES_COLLECTION, entryId);
};

/**
 * Get all entries for a specific journal
 *
 * @param maxEntries - Maximum number of entries to return (default: 100)
 * @param sortBy - Sort by 'createdAt' or 'updatedAt' (default: 'createdAt')
 */
export const getJournalEntries = async (
  userId: string,
  journalId: string,
  maxEntries: number = 100,
  sortBy: 'createdAt' | 'updatedAt' = 'createdAt'
): Promise<JournalEntry[]> => {
  return getDocuments<JournalEntry>(
    userId,
    JOURNAL_ENTRIES_COLLECTION,
    [
      where('journalId', '==', journalId),
      orderBy(sortBy, 'desc'),
      limit(maxEntries),
    ]
  );
};

/**
 * Get favorite entries across all journals
 */
export const getFavoriteEntries = async (
  userId: string,
  maxEntries: number = 50
): Promise<JournalEntry[]> => {
  return getDocuments<JournalEntry>(
    userId,
    JOURNAL_ENTRIES_COLLECTION,
    [
      where('isFavorite', '==', true),
      orderBy('createdAt', 'desc'),
      limit(maxEntries),
    ]
  );
};

/**
 * Search entries by tags
 */
export const searchEntriesByTag = async (
  userId: string,
  tag: string,
  maxEntries: number = 50
): Promise<JournalEntry[]> => {
  return getDocuments<JournalEntry>(
    userId,
    JOURNAL_ENTRIES_COLLECTION,
    [
      where('tags', 'array-contains', tag.toLowerCase()),
      orderBy('createdAt', 'desc'),
      limit(maxEntries),
    ]
  );
};

/**
 * Update a journal entry
 */
export const updateJournalEntry = async (
  userId: string,
  entryId: string,
  updates: UpdateJournalEntryInput
): Promise<void> => {
  // Validate input
  const validatedUpdates = updateJournalEntrySchema.parse(updates);

  await updateDocument(userId, JOURNAL_ENTRIES_COLLECTION, entryId, validatedUpdates);

  // Update journal's updatedAt
  const entry = await getJournalEntry(userId, entryId);
  if (entry) {
    await updateDocument(userId, JOURNALS_COLLECTION, entry.journalId, {
      updatedAt: now(),
    });
  }
};

/**
 * Delete a journal entry
 *
 * Also updates the journal's entryCount
 */
export const deleteJournalEntry = async (
  userId: string,
  entryId: string
): Promise<void> => {
  // Get entry first to know which journal it belongs to
  const entry = await getJournalEntry(userId, entryId);

  // Delete the entry
  await deleteDocument(userId, JOURNAL_ENTRIES_COLLECTION, entryId);

  // Update journal's entry count
  if (entry) {
    const journal = await getJournal(userId, entry.journalId);
    if (journal && journal.entryCount > 0) {
      await updateDocument(userId, JOURNALS_COLLECTION, entry.journalId, {
        entryCount: journal.entryCount - 1,
        updatedAt: now(),
      });
    }
  }
};

/**
 * Toggle favorite status on an entry
 */
export const toggleEntryFavorite = async (
  userId: string,
  entryId: string
): Promise<boolean> => {
  const entry = await getJournalEntry(userId, entryId);
  if (!entry) {
    throw new Error('Entry not found');
  }

  const newFavoriteStatus = !entry.isFavorite;
  await updateDocument(userId, JOURNAL_ENTRIES_COLLECTION, entryId, {
    isFavorite: newFavoriteStatus,
  });

  return newFavoriteStatus;
};

/**
 * Subscribe to real-time updates for journal entries
 */
export const subscribeToJournalEntries = (
  userId: string,
  journalId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToCollection<JournalEntry>(
    userId,
    JOURNAL_ENTRIES_COLLECTION,
    [
      where('journalId', '==', journalId),
      orderBy('createdAt', 'desc'),
    ],
    onUpdate,
    onError
  );
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get journals with statistics (entry count, latest entry)
 * Useful for dashboard views
 */
export const getJournalsWithStats = async (
  userId: string
): Promise<JournalWithStats[]> => {
  const journals = await getUserJournals(userId);

  const journalsWithStats: JournalWithStats[] = await Promise.all(
    journals.map(async (journal) => {
      // Get latest entry for this journal
      const latestEntries = await getDocuments<JournalEntry>(
        userId,
        JOURNAL_ENTRIES_COLLECTION,
        [
          where('journalId', '==', journal.id),
          orderBy('createdAt', 'desc'),
          limit(1),
        ]
      );

      const latestEntry = latestEntries.length > 0
        ? {
            id: latestEntries[0].id,
            title: latestEntries[0].title,
            createdAt: latestEntries[0].createdAt,
          }
        : null;

      return {
        ...journal,
        latestEntry,
      };
    })
  );

  return journalsWithStats;
};

/**
 * Get all unique tags across all entries
 * Useful for tag selection dropdowns
 */
export const getAllTags = async (userId: string): Promise<string[]> => {
  const entries = await getDocuments<JournalEntry>(
    userId,
    JOURNAL_ENTRIES_COLLECTION,
    []
  );

  const tagsSet = new Set<string>();
  entries.forEach(entry => {
    entry.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
};
