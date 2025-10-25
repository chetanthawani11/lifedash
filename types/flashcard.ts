// Flashcard/Learning System Data Models and Validation Schemas
// This file defines the shape of all flashcard-related data in LifeDash

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

/**
 * FlashcardFolder - Organize flashcard decks into folders
 * Example: "Web Development" folder containing "React" and "TypeScript" decks
 */
export interface FlashcardFolder {
  id: string;                    // Unique identifier
  userId: string;                // Who owns this folder
  name: string;                  // Folder name (e.g., "Web Development")
  description: string | null;    // Optional description
  color: string;                 // Color for visual organization
  icon: string;                  // Emoji or icon (e.g., "📁")
  parentId: string | null;       // Parent folder ID (for nested folders)
  deckCount: number;             // Number of decks in this folder
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * FlashcardDeck - A collection of flashcards on a specific topic
 * Example: "React Hooks" deck with 20 flashcards
 */
export interface FlashcardDeck {
  id: string;                    // Unique identifier
  userId: string;                // Who owns this deck
  folderId: string | null;       // Which folder (null = root level)
  name: string;                  // Deck name (e.g., "React Hooks")
  description: string | null;    // Optional description
  color: string;                 // Color for visual organization
  icon: string;                  // Emoji or icon (e.g., "⚛️")
  cardCount: number;             // Number of cards in this deck
  masteredCount: number;         // Number of cards marked as mastered
  lastStudied: Timestamp | null; // Last time this deck was studied
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Flashcard - A single flashcard with front and back
 */
export interface Flashcard {
  id: string;                    // Unique identifier
  deckId: string;                // Which deck does this belong to
  userId: string;                // Who owns this card
  front: string;                 // Question/Front side (e.g., "What is useState?")
  back: string;                  // Answer/Back side (e.g., "A React Hook for state management")
  notes: string | null;          // Optional additional notes/hints
  tags: string[];                // Tags for organization
  difficulty: Difficulty;        // How hard is this card
  status: CardStatus;            // Learning status
  timesReviewed: number;         // How many times reviewed
  timesCorrect: number;          // How many times answered correctly
  lastReviewed: Timestamp | null; // Last review date
  nextReviewDate: Timestamp | null; // When to review next (spaced repetition)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Difficulty levels for flashcards
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Learning status of a flashcard
 */
export type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

// Status options for the UI
export const CARD_STATUS_OPTIONS: { value: CardStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: '#3b82f6' },
  { value: 'learning', label: 'Learning', color: '#f59e0b' },
  { value: 'reviewing', label: 'Reviewing', color: '#a855f7' },
  { value: 'mastered', label: 'Mastered', color: '#22c55e' },
];

/**
 * StudySession - Track study sessions for analytics
 */
export interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  cardsStudied: number;          // Number of cards reviewed in this session
  correctAnswers: number;        // Number of correct answers
  duration: number;              // Session duration in seconds
  date: Timestamp;
  createdAt: Timestamp;
}

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a NEW flashcard folder
 */
export const createFlashcardFolderSchema = z.object({
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
 * Schema for updating a flashcard folder
 */
export const updateFlashcardFolderSchema = createFlashcardFolderSchema.partial();

/**
 * Schema for creating a NEW flashcard deck
 */
export const createFlashcardDeckSchema = z.object({
  folderId: z.string()
    .nullable()
    .optional(),
  name: z.string()
    .min(1, 'Deck name is required')
    .max(50, 'Deck name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .trim()
    .nullable()
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color')
    .default('#a855f7'),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(10, 'Icon must be a single emoji or short text')
    .default('🎴'),
});

/**
 * Schema for updating a flashcard deck
 */
export const updateFlashcardDeckSchema = createFlashcardDeckSchema.partial();

/**
 * Schema for creating a NEW flashcard
 */
export const createFlashcardSchema = z.object({
  deckId: z.string()
    .min(1, 'Deck ID is required'),
  front: z.string()
    .min(1, 'Front side is required')
    .max(1000, 'Front side is too long')
    .trim(),
  back: z.string()
    .min(1, 'Back side is required')
    .max(2000, 'Back side is too long')
    .trim(),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
  tags: z.array(z.string().trim().toLowerCase())
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  difficulty: z.enum(['easy', 'medium', 'hard'])
    .default('medium'),
});

/**
 * Schema for updating a flashcard
 */
export const updateFlashcardSchema = createFlashcardSchema
  .omit({ deckId: true })
  .partial();

/**
 * Schema for recording a flashcard review
 * Used when user studies and marks a card as correct/incorrect
 */
export const reviewFlashcardSchema = z.object({
  wasCorrect: z.boolean(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// ============================================
// TYPESCRIPT TYPES FROM ZOD SCHEMAS
// ============================================

export type CreateFlashcardFolderInput = z.infer<typeof createFlashcardFolderSchema>;
export type UpdateFlashcardFolderInput = z.infer<typeof updateFlashcardFolderSchema>;
export type CreateFlashcardDeckInput = z.infer<typeof createFlashcardDeckSchema>;
export type UpdateFlashcardDeckInput = z.infer<typeof updateFlashcardDeckSchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Deck with folder information and statistics
 */
export interface DeckWithStats extends FlashcardDeck {
  folder: Pick<FlashcardFolder, 'name' | 'color' | 'icon'> | null;
  newCards: number;              // Cards with status 'new'
  dueCards: number;              // Cards due for review today
}

/**
 * Flashcard with deck information
 */
export interface FlashcardWithDeck extends Flashcard {
  deck: Pick<FlashcardDeck, 'name' | 'color' | 'icon'>;
}

/**
 * Firestore document data (without id)
 */
export type FlashcardFolderData = Omit<FlashcardFolder, 'id'>;
export type FlashcardDeckData = Omit<FlashcardDeck, 'id'>;
export type FlashcardData = Omit<Flashcard, 'id'>;
export type StudySessionData = Omit<StudySession, 'id'>;

/**
 * Spaced Repetition Algorithm - Calculate next review date
 * Based on SuperMemo SM-2 algorithm (simplified)
 *
 * @param wasCorrect - Did the user answer correctly?
 * @param timesCorrect - How many times answered correctly in a row
 * @param currentInterval - Current interval in days
 * @returns Next interval in days
 */
export const calculateNextReviewInterval = (
  wasCorrect: boolean,
  timesCorrect: number,
  currentInterval: number = 1
): number => {
  if (!wasCorrect) {
    // Reset to beginning if wrong
    return 1;
  }

  // Correct answer - increase interval
  if (timesCorrect === 0) return 1;        // First time: 1 day
  if (timesCorrect === 1) return 3;        // Second time: 3 days
  if (timesCorrect === 2) return 7;        // Third time: 1 week

  // After that, multiply interval by 2
  return Math.min(currentInterval * 2, 180); // Max 180 days (6 months)
};
