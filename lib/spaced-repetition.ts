// Spaced Repetition Algorithm
// Based on the SM-2 algorithm (SuperMemo 2) - a proven method for memory retention

import { Flashcard } from '@/types';

/**
 * Difficulty ratings the user can choose when reviewing a flashcard
 */
export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculate the next review date based on difficulty rating
 *
 * HOW IT WORKS (Simple Explanation):
 * - Each card has an "easiness factor" (how easy it is for you)
 * - Each card has an "interval" (days until next review)
 * - When you rate a card, we adjust both of these numbers
 *
 * @param card - The flashcard being reviewed
 * @param rating - How difficult the card was (again, hard, good, easy)
 * @returns Updated card data with new review date and statistics
 */
export const calculateNextReview = (
  card: Flashcard,
  rating: DifficultyRating
): Partial<Flashcard> => {
  // Get current easiness factor (default: 2.5)
  // This is a multiplier that grows/shrinks based on performance
  // Range: 1.3 (very hard) to 3.0 (very easy)
  const currentEF = card.easinessFactor || 2.5;

  // Get current interval (days between reviews)
  const currentInterval = card.interval || 0;

  // Get how many times reviewed
  const timesReviewed = (card.timesReviewed || 0) + 1;

  // Get how many times correct (we'll update this below)
  let timesCorrect = card.timesCorrect || 0;

  // Initialize new values
  let newEF = currentEF;
  let newInterval = 0;
  let newStatus: 'new' | 'learning' | 'review' | 'mastered' = card.status || 'new';

  // Calculate new easiness factor based on rating
  // This formula is from the SM-2 algorithm
  switch (rating) {
    case 'again':
      // Failed - reset to beginning
      newEF = Math.max(1.3, currentEF - 0.2); // Decrease easiness (min 1.3)
      newInterval = 1; // Review tomorrow
      newStatus = 'learning';
      break;

    case 'hard':
      // Struggled - slight decrease in easiness
      newEF = Math.max(1.3, currentEF - 0.15);
      // Interval grows slowly (multiply by 1.2)
      newInterval = Math.max(1, Math.round(currentInterval * 1.2));
      timesCorrect += 1;
      newStatus = 'learning';
      break;

    case 'good':
      // Got it right - normal growth
      newEF = currentEF; // Keep easiness the same

      // Interval calculation based on how many times reviewed
      if (currentInterval === 0) {
        // First time: review in 1 day
        newInterval = 1;
      } else if (currentInterval === 1) {
        // Second time: review in 6 days
        newInterval = 6;
      } else {
        // After that: multiply by easiness factor
        newInterval = Math.round(currentInterval * newEF);
      }

      timesCorrect += 1;
      newStatus = timesReviewed >= 3 ? 'review' : 'learning';
      break;

    case 'easy':
      // Knew it instantly - big increase
      newEF = Math.min(3.0, currentEF + 0.15); // Increase easiness (max 3.0)

      // Interval calculation - grows faster
      if (currentInterval === 0) {
        // First time: review in 4 days (skipping tomorrow)
        newInterval = 4;
      } else if (currentInterval === 1) {
        // Second time: review in 10 days
        newInterval = 10;
      } else {
        // After that: multiply by easiness factor + bonus
        newInterval = Math.round(currentInterval * newEF * 1.3);
      }

      timesCorrect += 1;
      newStatus = timesReviewed >= 2 ? 'mastered' : 'review';
      break;
  }

  // Calculate next review date
  // Current date + interval days
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Calculate accuracy percentage
  const accuracy = timesReviewed > 0 ? Math.round((timesCorrect / timesReviewed) * 100) : 0;

  // Return updated card data
  return {
    interval: newInterval,
    easinessFactor: newEF,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewed: new Date().toISOString(),
    timesReviewed,
    timesCorrect,
    status: newStatus,
    difficulty: getDifficultyLevel(accuracy, newEF),
  };
};

/**
 * Determine difficulty level based on accuracy and easiness factor
 *
 * EXPLANATION:
 * - High accuracy + high EF = easy
 * - Low accuracy or low EF = hard
 * - In between = medium
 */
const getDifficultyLevel = (
  accuracy: number,
  easinessFactor: number
): 'easy' | 'medium' | 'hard' => {
  if (accuracy >= 80 && easinessFactor >= 2.5) {
    return 'easy';
  } else if (accuracy <= 50 || easinessFactor <= 1.8) {
    return 'hard';
  } else {
    return 'medium';
  }
};

/**
 * Get cards that are due for review today
 *
 * EXPLANATION:
 * - New cards (never reviewed) are always due
 * - Cards with nextReviewDate in the past or today are due
 * - Cards with future nextReviewDate are not due yet
 *
 * @param cards - All flashcards in the deck
 * @returns Cards that should be studied today
 */
export const getDueCards = (cards: Flashcard[]): Flashcard[] => {
  const now = new Date();

  return cards.filter(card => {
    // New cards are always due
    if (!card.lastReviewed) {
      return true;
    }

    // If no next review date set, it's due
    if (!card.nextReviewDate) {
      return true;
    }

    // Check if next review date is today or in the past
    const nextReview = new Date(card.nextReviewDate);
    return nextReview <= now;
  });
};

/**
 * Get cards by status (new, learning, review, mastered)
 */
export const getCardsByStatus = (
  cards: Flashcard[],
  status: 'new' | 'learning' | 'review' | 'mastered'
): Flashcard[] => {
  return cards.filter(card => (card.status || 'new') === status);
};

/**
 * Calculate study session statistics
 *
 * EXPLANATION:
 * This gives you an overview of your study session:
 * - How many cards studied
 * - How many got right/wrong
 * - Accuracy percentage
 * - Average difficulty
 */
export interface StudySessionStats {
  totalCards: number;
  cardsStudied: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  accuracy: number;
  newCards: number;
  reviewCards: number;
  averageEasinessFactor: number;
}

export const calculateSessionStats = (
  allCards: Flashcard[],
  studiedCards: Flashcard[]
): StudySessionStats => {
  const totalCards = allCards.length;
  const cardsStudied = studiedCards.length;

  // Count how many were correct (rated good or easy)
  const cardsCorrect = studiedCards.filter(card => {
    const lastReviewCorrect = card.timesCorrect || 0;
    const totalReviews = card.timesReviewed || 0;

    // If this was the most recent review and times correct increased, it was correct
    return totalReviews > 0;
  }).length;

  const cardsIncorrect = cardsStudied - cardsCorrect;

  const accuracy = cardsStudied > 0 ? Math.round((cardsCorrect / cardsStudied) * 100) : 0;

  const newCards = getCardsByStatus(allCards, 'new').length;
  const reviewCards = getDueCards(allCards).length;

  // Calculate average easiness factor
  const totalEF = allCards.reduce((sum, card) => sum + (card.easinessFactor || 2.5), 0);
  const averageEasinessFactor = totalCards > 0 ? totalEF / totalCards : 2.5;

  return {
    totalCards,
    cardsStudied,
    cardsCorrect,
    cardsIncorrect,
    accuracy,
    newCards,
    reviewCards,
    averageEasinessFactor,
  };
};

/**
 * Sort cards for optimal study order
 *
 * EXPLANATION:
 * Best order for studying:
 * 1. New cards first (to learn new things)
 * 2. Review cards by due date (oldest first)
 * 3. Learning cards (cards you're still learning)
 */
export const sortCardsForStudy = (cards: Flashcard[]): Flashcard[] => {
  return [...cards].sort((a, b) => {
    // New cards first
    const aIsNew = !a.lastReviewed;
    const bIsNew = !b.lastReviewed;

    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;

    // Then sort by next review date (oldest first)
    if (a.nextReviewDate && b.nextReviewDate) {
      return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
    }

    // Finally by creation date (oldest first)
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return 0;
  });
};
