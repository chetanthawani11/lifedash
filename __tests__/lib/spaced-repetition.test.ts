/**
 * SPACED REPETITION TESTS
 *
 * Tests for the flashcard spaced repetition algorithm.
 * This algorithm determines when users should review flashcards.
 */

import { calculateNextReview, DifficultyRating } from '@/lib/spaced-repetition';
import { Flashcard } from '@/types';

// Helper to create a mock flashcard
const createMockCard = (overrides: Partial<Flashcard> = {}): Flashcard => ({
  id: 'test-card-1',
  deckId: 'test-deck-1',
  front: 'What is 2+2?',
  back: '4',
  status: 'new',
  difficulty: 0,
  easinessFactor: 2.5,
  interval: 0,
  timesReviewed: 0,
  timesCorrect: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Spaced Repetition Algorithm', () => {
  describe('calculateNextReview', () => {
    // Test 1: New card rated "again" (failed)
    describe('when rating is "again"', () => {
      it('should set interval to 1 day for a new card', () => {
        const card = createMockCard();
        const result = calculateNextReview(card, 'again');

        expect(result.interval).toBe(1);
        expect(result.status).toBe('learning');
      });

      it('should decrease easiness factor', () => {
        const card = createMockCard({ easinessFactor: 2.5 });
        const result = calculateNextReview(card, 'again');

        expect(result.easinessFactor).toBeLessThan(2.5);
        expect(result.easinessFactor).toBeGreaterThanOrEqual(1.3);
      });

      it('should not decrease easiness factor below 1.3', () => {
        const card = createMockCard({ easinessFactor: 1.3 });
        const result = calculateNextReview(card, 'again');

        expect(result.easinessFactor).toBe(1.3);
      });

      it('should not increase timesCorrect', () => {
        const card = createMockCard({ timesCorrect: 5 });
        const result = calculateNextReview(card, 'again');

        expect(result.timesCorrect).toBe(5);
      });
    });

    // Test 2: Card rated "hard"
    describe('when rating is "hard"', () => {
      it('should set a short interval', () => {
        const card = createMockCard({ interval: 1 });
        const result = calculateNextReview(card, 'hard');

        expect(result.interval).toBeGreaterThanOrEqual(1);
      });

      it('should slightly decrease easiness factor', () => {
        const card = createMockCard({ easinessFactor: 2.5 });
        const result = calculateNextReview(card, 'hard');

        expect(result.easinessFactor).toBeLessThan(2.5);
        expect(result.easinessFactor).toBeGreaterThan(2.3);
      });

      it('should increase timesCorrect', () => {
        const card = createMockCard({ timesCorrect: 3 });
        const result = calculateNextReview(card, 'hard');

        expect(result.timesCorrect).toBe(4);
      });
    });

    // Test 3: Card rated "good"
    describe('when rating is "good"', () => {
      it('should set interval to 1 for first review', () => {
        const card = createMockCard({ interval: 0 });
        const result = calculateNextReview(card, 'good');

        expect(result.interval).toBe(1);
      });

      it('should set interval to 6 for second review', () => {
        const card = createMockCard({ interval: 1 });
        const result = calculateNextReview(card, 'good');

        expect(result.interval).toBe(6);
      });

      it('should multiply interval by easiness factor for subsequent reviews', () => {
        const card = createMockCard({
          interval: 6,
          easinessFactor: 2.5,
        });
        const result = calculateNextReview(card, 'good');

        // 6 * 2.5 = 15
        expect(result.interval).toBe(15);
      });

      it('should keep easiness factor the same', () => {
        const card = createMockCard({ easinessFactor: 2.5 });
        const result = calculateNextReview(card, 'good');

        expect(result.easinessFactor).toBe(2.5);
      });

      it('should increase timesCorrect', () => {
        const card = createMockCard({ timesCorrect: 2 });
        const result = calculateNextReview(card, 'good');

        expect(result.timesCorrect).toBe(3);
      });
    });

    // Test 4: Card rated "easy"
    describe('when rating is "easy"', () => {
      it('should set a longer interval for first review', () => {
        const card = createMockCard({ interval: 0 });
        const result = calculateNextReview(card, 'easy');

        expect(result.interval).toBe(4);
      });

      it('should increase easiness factor', () => {
        const card = createMockCard({ easinessFactor: 2.5 });
        const result = calculateNextReview(card, 'easy');

        expect(result.easinessFactor).toBeGreaterThan(2.5);
      });

      it('should not increase easiness factor above 3.0', () => {
        const card = createMockCard({ easinessFactor: 3.0 });
        const result = calculateNextReview(card, 'easy');

        expect(result.easinessFactor).toBe(3.0);
      });

      it('should increase timesCorrect', () => {
        const card = createMockCard({ timesCorrect: 1 });
        const result = calculateNextReview(card, 'easy');

        expect(result.timesCorrect).toBe(2);
      });

      it('should grow interval faster than "good" rating', () => {
        const card = createMockCard({ interval: 6, easinessFactor: 2.5 });
        const goodResult = calculateNextReview(card, 'good');
        const easyResult = calculateNextReview(card, 'easy');

        expect(easyResult.interval).toBeGreaterThan(goodResult.interval!);
      });
    });

    // Test 5: Status transitions
    describe('status transitions', () => {
      it('should move to learning status when failed', () => {
        const card = createMockCard({ status: 'review' });
        const result = calculateNextReview(card, 'again');

        expect(result.status).toBe('learning');
      });

      it('should move to review status after 3+ reviews with good rating', () => {
        const card = createMockCard({
          timesReviewed: 2, // Will become 3 after this review
          interval: 6,
        });
        const result = calculateNextReview(card, 'good');

        expect(result.status).toBe('review');
      });
    });

    // Test 6: Edge cases
    describe('edge cases', () => {
      it('should handle card with undefined values', () => {
        const card = {
          id: 'test',
          deckId: 'test-deck',
          front: 'Q',
          back: 'A',
        } as Flashcard;

        // Should not throw
        expect(() => calculateNextReview(card, 'good')).not.toThrow();
      });

      it('should always return a next review date', () => {
        const card = createMockCard();
        const ratings: DifficultyRating[] = ['again', 'hard', 'good', 'easy'];

        ratings.forEach((rating) => {
          const result = calculateNextReview(card, rating);
          expect(result.nextReviewDate).toBeDefined();
        });
      });

      it('should increment timesReviewed for all ratings', () => {
        const card = createMockCard({ timesReviewed: 5 });
        const ratings: DifficultyRating[] = ['again', 'hard', 'good', 'easy'];

        ratings.forEach((rating) => {
          const result = calculateNextReview(
            createMockCard({ timesReviewed: 5 }),
            rating
          );
          expect(result.timesReviewed).toBe(6);
        });
      });
    });
  });
});
