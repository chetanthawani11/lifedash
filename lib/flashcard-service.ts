// Flashcard Service - All database operations for flashcards, decks, folders
// This is like a librarian who knows how to organize and find your flashcards

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
  Flashcard,
  FlashcardDeck,
  FlashcardFolder,
  FlashcardData,
  FlashcardDeckData,
  FlashcardFolderData,
  CreateFlashcardFolderInput,
  UpdateFlashcardFolderInput,
  CreateFlashcardDeckInput,
  UpdateFlashcardDeckInput,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  createFlashcardFolderSchema,
  updateFlashcardFolderSchema,
  createFlashcardDeckSchema,
  updateFlashcardDeckSchema,
  createFlashcardSchema,
  updateFlashcardSchema,
} from '@/types';

import { Unsubscribe } from 'firebase/firestore';

// Collection names in Firestore
const FOLDERS_COLLECTION = 'flashcard_folders';
const DECKS_COLLECTION = 'flashcard_decks';
const CARDS_COLLECTION = 'flashcards';

// ============================================
// FOLDER OPERATIONS
// ============================================

/**
 * Create a new flashcard folder
 */
export const createFlashcardFolder = async (
  userId: string,
  input: CreateFlashcardFolderInput
): Promise<FlashcardFolder> => {
  const validatedData = createFlashcardFolderSchema.parse(input);

  const folderData: FlashcardFolderData = {
    userId,
    name: validatedData.name,
    description: validatedData.description || null,
    color: validatedData.color,
    icon: validatedData.icon,
    parentId: validatedData.parentId || null,
    deckCount: 0,
    createdAt: now(),
    updatedAt: now(),
  };

  const folderId = await createDocument<FlashcardFolderData>(
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
 */
export const getFlashcardFolder = async (
  userId: string,
  folderId: string
): Promise<FlashcardFolder | null> => {
  return getDocument<FlashcardFolder>(userId, FOLDERS_COLLECTION, folderId);
};

/**
 * Get all folders for a user
 */
export const getUserFlashcardFolders = async (
  userId: string
): Promise<FlashcardFolder[]> => {
  return getDocuments<FlashcardFolder>(
    userId,
    FOLDERS_COLLECTION,
    []
  );
};

/**
 * Get subfolders of a parent folder
 */
export const getSubfolders = async (
  userId: string,
  parentId: string
): Promise<FlashcardFolder[]> => {
  return getDocuments<FlashcardFolder>(
    userId,
    FOLDERS_COLLECTION,
    [where('parentId', '==', parentId)]
  );
};

/**
 * Get root folders (folders with no parent)
 */
export const getRootFolders = async (
  userId: string
): Promise<FlashcardFolder[]> => {
  return getDocuments<FlashcardFolder>(
    userId,
    FOLDERS_COLLECTION,
    [where('parentId', '==', null)]
  );
};

/**
 * Update a folder
 */
export const updateFlashcardFolder = async (
  userId: string,
  folderId: string,
  updates: UpdateFlashcardFolderInput
): Promise<void> => {
  const validatedUpdates = updateFlashcardFolderSchema.parse(updates);
  await updateDocument(userId, FOLDERS_COLLECTION, folderId, {
    ...validatedUpdates,
    updatedAt: now(),
  });
};

/**
 * Delete a folder
 * WARNING: This will also delete all subfolders and decks inside!
 */
export const deleteFlashcardFolder = async (
  userId: string,
  folderId: string
): Promise<void> => {
  // Get all subfolders
  const subfolders = await getSubfolders(userId, folderId);

  // Delete each subfolder (recursive)
  for (const subfolder of subfolders) {
    await deleteFlashcardFolder(userId, subfolder.id);
  }

  // Get all decks in this folder
  const decks = await getDocuments<FlashcardDeck>(
    userId,
    DECKS_COLLECTION,
    [where('folderId', '==', folderId)]
  );

  // Delete each deck (and its flashcards)
  for (const deck of decks) {
    await deleteFlashcardDeck(userId, deck.id);
  }

  // Finally, delete the folder itself
  await deleteDocument(userId, FOLDERS_COLLECTION, folderId);
};

/**
 * Move a folder to a new parent (or to root)
 */
export const moveFolder = async (
  userId: string,
  folderId: string,
  newParentId: string | null
): Promise<void> => {
  if (newParentId === folderId) {
    throw new Error('Cannot move folder into itself');
  }

  await updateFlashcardFolder(userId, folderId, {
    parentId: newParentId,
  });
};

// ============================================
// DECK OPERATIONS
// ============================================

/**
 * Create a new flashcard deck
 */
export const createFlashcardDeck = async (
  userId: string,
  input: CreateFlashcardDeckInput
): Promise<FlashcardDeck> => {
  const validatedData = createFlashcardDeckSchema.parse(input);

  const deckData: FlashcardDeckData = {
    userId,
    folderId: validatedData.folderId || null,
    name: validatedData.name,
    description: validatedData.description || null,
    color: validatedData.color,
    icon: validatedData.icon,
    cardCount: 0,
    masteredCount: 0,
    lastStudied: null,
    createdAt: now(),
    updatedAt: now(),
  };

  const deckId = await createDocument<FlashcardDeckData>(
    userId,
    DECKS_COLLECTION,
    deckData
  );

  // Update folder's deck count if in a folder
  if (deckData.folderId) {
    await updateFolderDeckCount(userId, deckData.folderId);
  }

  return {
    id: deckId,
    ...deckData,
  };
};

/**
 * Get a single deck by ID
 */
export const getFlashcardDeck = async (
  userId: string,
  deckId: string
): Promise<FlashcardDeck | null> => {
  return getDocument<FlashcardDeck>(userId, DECKS_COLLECTION, deckId);
};

/**
 * Get all decks for a user
 */
export const getUserFlashcardDecks = async (
  userId: string
): Promise<FlashcardDeck[]> => {
  return getDocuments<FlashcardDeck>(
    userId,
    DECKS_COLLECTION,
    []
  );
};

/**
 * Get decks in a specific folder
 */
export const getDecksInFolder = async (
  userId: string,
  folderId: string | null
): Promise<FlashcardDeck[]> => {
  return getDocuments<FlashcardDeck>(
    userId,
    DECKS_COLLECTION,
    [where('folderId', '==', folderId)]
  );
};

/**
 * Update a deck
 */
export const updateFlashcardDeck = async (
  userId: string,
  deckId: string,
  updates: UpdateFlashcardDeckInput
): Promise<void> => {
  const validatedUpdates = updateFlashcardDeckSchema.parse(updates);

  // If moving to a different folder, update both folder counts
  if (updates.folderId !== undefined) {
    const oldDeck = await getFlashcardDeck(userId, deckId);
    if (oldDeck) {
      if (oldDeck.folderId) {
        await updateFolderDeckCount(userId, oldDeck.folderId);
      }
      if (updates.folderId) {
        await updateFolderDeckCount(userId, updates.folderId);
      }
    }
  }

  await updateDocument(userId, DECKS_COLLECTION, deckId, {
    ...validatedUpdates,
    updatedAt: now(),
  });
};

/**
 * Delete a deck
 * This will also delete all flashcards in the deck
 */
export const deleteFlashcardDeck = async (
  userId: string,
  deckId: string
): Promise<void> => {
  // Get the deck to find its folder
  const deck = await getFlashcardDeck(userId, deckId);

  // Get all flashcards in this deck
  const flashcards = await getDocuments<Flashcard>(
    userId,
    CARDS_COLLECTION,
    [where('deckId', '==', deckId)]
  );

  // Delete each flashcard
  for (const card of flashcards) {
    await deleteDocument(userId, CARDS_COLLECTION, card.id);
  }

  // Delete the deck itself
  await deleteDocument(userId, DECKS_COLLECTION, deckId);

  // Update folder's deck count if in a folder
  if (deck?.folderId) {
    await updateFolderDeckCount(userId, deck.folderId);
  }
};

/**
 * Move a deck to a different folder
 */
export const moveDeck = async (
  userId: string,
  deckId: string,
  newFolderId: string | null
): Promise<void> => {
  await updateFlashcardDeck(userId, deckId, {
    folderId: newFolderId,
  });
};

/**
 * Update folder's deck count
 */
export const updateFolderDeckCount = async (
  userId: string,
  folderId: string
): Promise<void> => {
  const decks = await getDecksInFolder(userId, folderId);
  await updateDocument(userId, FOLDERS_COLLECTION, folderId, {
    deckCount: decks.length,
    updatedAt: now(),
  });
};

/**
 * Update deck's card count
 */
export const updateDeckCardCount = async (
  userId: string,
  deckId: string
): Promise<void> => {
  const cards = await getDocuments<Flashcard>(
    userId,
    CARDS_COLLECTION,
    [where('deckId', '==', deckId)]
  );

  await updateDocument(userId, DECKS_COLLECTION, deckId, {
    cardCount: cards.length,
    updatedAt: now(),
  });
};

// ============================================
// FLASHCARD OPERATIONS
// ============================================

/**
 * Create a new flashcard
 */
export const createFlashcard = async (
  userId: string,
  input: CreateFlashcardInput
): Promise<Flashcard> => {
  const validatedData = createFlashcardSchema.parse(input);

  const flashcardData: FlashcardData = {
    userId,
    deckId: validatedData.deckId,
    front: validatedData.front,
    back: validatedData.back,
    notes: validatedData.notes || null,
    tags: validatedData.tags || [],
    difficulty: 'medium',
    status: 'new',
    timesReviewed: 0,
    timesCorrect: 0,
    lastReviewed: null,
    nextReviewDate: null,
    createdAt: now(),
    updatedAt: now(),
  };

  const cardId = await createDocument<FlashcardData>(
    userId,
    CARDS_COLLECTION,
    flashcardData
  );

  // Update deck's card count
  await updateDeckCardCount(userId, validatedData.deckId);

  return {
    id: cardId,
    ...flashcardData,
  };
};

/**
 * Get a single flashcard by ID
 */
export const getFlashcard = async (
  userId: string,
  cardId: string
): Promise<Flashcard | null> => {
  return getDocument<Flashcard>(userId, CARDS_COLLECTION, cardId);
};

/**
 * Get all flashcards in a deck
 */
export const getDeckFlashcards = async (
  userId: string,
  deckId: string
): Promise<Flashcard[]> => {
  return getDocuments<Flashcard>(
    userId,
    CARDS_COLLECTION,
    [where('deckId', '==', deckId), orderBy('createdAt', 'desc')]
  );
};

/**
 * Get flashcards by tag
 */
export const getFlashcardsByTag = async (
  userId: string,
  deckId: string,
  tag: string
): Promise<Flashcard[]> => {
  const allCards = await getDeckFlashcards(userId, deckId);
  return allCards.filter(card => card.tags.includes(tag));
};

/**
 * Get all unique tags from a deck
 */
export const getDeckTags = async (
  userId: string,
  deckId: string
): Promise<string[]> => {
  const cards = await getDeckFlashcards(userId, deckId);
  const tagsSet = new Set<string>();
  cards.forEach(card => {
    card.tags.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};

/**
 * Update a flashcard
 */
export const updateFlashcard = async (
  userId: string,
  cardId: string,
  updates: UpdateFlashcardInput
): Promise<void> => {
  const validatedUpdates = updateFlashcardSchema.parse(updates);
  await updateDocument(userId, CARDS_COLLECTION, cardId, {
    ...validatedUpdates,
    updatedAt: now(),
  });
};

/**
 * Delete a flashcard
 */
export const deleteFlashcard = async (
  userId: string,
  cardId: string
): Promise<void> => {
  // Get the card to find its deck
  const card = await getFlashcard(userId, cardId);

  // Delete the card
  await deleteDocument(userId, CARDS_COLLECTION, cardId);

  // Update deck's card count if card existed
  if (card) {
    await updateDeckCardCount(userId, card.deckId);
  }
};

/**
 * Get flashcard count for a deck
 */
export const getFlashcardCount = async (
  userId: string,
  deckId: string
): Promise<number> => {
  const cards = await getDocuments<Flashcard>(
    userId,
    CARDS_COLLECTION,
    [where('deckId', '==', deckId)]
  );
  return cards.length;
};

/**
 * Record a flashcard review
 *
 * EXPLANATION:
 * This function is called after you review a flashcard in study mode.
 * It updates the flashcard with:
 * - When you should see it next (nextReviewDate)
 * - How many times you've reviewed it (timesReviewed)
 * - How many times you got it right (timesCorrect)
 * - The easiness factor (how easy the card is for you)
 * - The card's status (new, learning, review, mastered)
 *
 * @param userId - The user ID
 * @param cardId - The flashcard ID
 * @param reviewData - Data from spaced repetition algorithm (interval, nextReviewDate, etc.)
 */
export const recordFlashcardReview = async (
  userId: string,
  cardId: string,
  reviewData: Partial<Flashcard>
): Promise<void> => {
  await updateDocument(userId, CARDS_COLLECTION, cardId, {
    ...reviewData,
    updatedAt: now(),
  });

  // If the card was reviewed, update the deck's lastStudied date
  if (reviewData.lastReviewed) {
    const card = await getFlashcard(userId, cardId);
    if (card) {
      await updateDocument(userId, DECKS_COLLECTION, card.deckId, {
        lastStudied: now(),
        updatedAt: now(),
      });
    }
  }
};

/**
 * Update deck's mastered count
 *
 * EXPLANATION:
 * This counts how many cards in a deck have status "mastered"
 * and updates the deck's masteredCount field.
 * Called after each study session.
 */
export const updateDeckMasteredCount = async (
  userId: string,
  deckId: string
): Promise<void> => {
  const cards = await getDeckFlashcards(userId, deckId);
  const masteredCards = cards.filter(card => card.status === 'mastered');

  await updateDocument(userId, DECKS_COLLECTION, deckId, {
    masteredCount: masteredCards.length,
    updatedAt: now(),
  });
};

/**
 * Subscribe to real-time folder updates
 */
export const subscribeToUserFolders = (
  userId: string,
  onUpdate: (folders: FlashcardFolder[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToCollection<FlashcardFolder>(
    userId,
    FOLDERS_COLLECTION,
    [],
    onUpdate,
    onError
  );
};

/**
 * Subscribe to real-time deck updates
 */
export const subscribeToUserDecks = (
  userId: string,
  onUpdate: (decks: FlashcardDeck[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToCollection<FlashcardDeck>(
    userId,
    DECKS_COLLECTION,
    [],
    onUpdate,
    onError
  );
};
