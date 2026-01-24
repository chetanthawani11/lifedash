/**
 * FLASHCARD SERVICE INTEGRATION TESTS
 *
 * Tests the flashcard system including:
 * - Deck management
 * - Card operations
 * - Spaced repetition calculations
 * - Study session logic
 */

import { calculateNextReview, getDueCards, sortCardsForStudy } from '@/lib/spaced-repetition';
import { Flashcard, FlashcardDeck } from '@/types';

// Helper to create mock flashcards
const createMockCard = (overrides: Partial<Flashcard> = {}): Flashcard => ({
  id: `card-${Math.random().toString(36).substr(2, 9)}`,
  deckId: 'test-deck-1',
  front: 'Test Question',
  back: 'Test Answer',
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

// Helper to create mock decks
const createMockDeck = (overrides: Partial<FlashcardDeck> = {}): FlashcardDeck => ({
  id: `deck-${Math.random().toString(36).substr(2, 9)}`,
  userId: 'test-user-123',
  name: 'Test Deck',
  description: 'A test deck',
  folderId: null,
  cardCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Flashcard Service Integration', () => {
  describe('Deck operations', () => {
    it('should create a valid deck structure', () => {
      const deck = createMockDeck({
        name: 'JavaScript Fundamentals',
        description: 'Core JS concepts',
      });

      expect(deck.name).toBe('JavaScript Fundamentals');
      expect(deck.description).toBe('Core JS concepts');
      expect(deck.id).toBeDefined();
      expect(deck.userId).toBeDefined();
    });

    it('should organize decks into folders', () => {
      const decks: FlashcardDeck[] = [
        createMockDeck({ name: 'JS Basics', folderId: 'programming' }),
        createMockDeck({ name: 'React Hooks', folderId: 'programming' }),
        createMockDeck({ name: 'Spanish Vocab', folderId: 'languages' }),
        createMockDeck({ name: 'Random Deck', folderId: null }),
      ];

      // Group decks by folder
      const grouped = decks.reduce(
        (acc, deck) => {
          const folder = deck.folderId || 'uncategorized';
          if (!acc[folder]) {
            acc[folder] = [];
          }
          acc[folder].push(deck);
          return acc;
        },
        {} as Record<string, FlashcardDeck[]>
      );

      expect(grouped['programming'].length).toBe(2);
      expect(grouped['languages'].length).toBe(1);
      expect(grouped['uncategorized'].length).toBe(1);
    });
  });

  describe('Card operations', () => {
    it('should add cards to a deck', () => {
      const deckId = 'test-deck-1';
      const cards: Flashcard[] = [];

      // Add cards
      cards.push(createMockCard({ deckId, front: 'Q1', back: 'A1' }));
      cards.push(createMockCard({ deckId, front: 'Q2', back: 'A2' }));
      cards.push(createMockCard({ deckId, front: 'Q3', back: 'A3' }));

      const deckCards = cards.filter((c) => c.deckId === deckId);
      expect(deckCards.length).toBe(3);
    });

    it('should validate card has front and back', () => {
      const validateCard = (card: Partial<Flashcard>): boolean => {
        return !!(
          card.front &&
          card.front.trim().length > 0 &&
          card.back &&
          card.back.trim().length > 0
        );
      };

      expect(validateCard({ front: 'Question', back: 'Answer' })).toBe(true);
      expect(validateCard({ front: '', back: 'Answer' })).toBe(false);
      expect(validateCard({ front: 'Question', back: '' })).toBe(false);
      expect(validateCard({ front: '   ', back: 'Answer' })).toBe(false);
    });
  });

  describe('Study session logic', () => {
    it('should get all due cards', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const cards: Flashcard[] = [
        createMockCard({
          id: '1',
          status: 'new',
          lastReviewed: undefined,
        }),
        createMockCard({
          id: '2',
          status: 'learning',
          lastReviewed: yesterday.toISOString(),
          nextReviewDate: yesterday.toISOString(),
        }),
        createMockCard({
          id: '3',
          status: 'review',
          lastReviewed: yesterday.toISOString(),
          nextReviewDate: tomorrow.toISOString(),
        }),
      ];

      const dueCards = getDueCards(cards);

      // Card 1 (new) and Card 2 (overdue) should be due
      // Card 3 is scheduled for tomorrow, not due yet
      expect(dueCards.length).toBe(2);
      expect(dueCards.map((c) => c.id)).toContain('1');
      expect(dueCards.map((c) => c.id)).toContain('2');
    });

    it('should sort cards for optimal study order', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const cards: Flashcard[] = [
        createMockCard({
          id: 'reviewed',
          lastReviewed: yesterday.toISOString(),
          nextReviewDate: now.toISOString(),
        }),
        createMockCard({
          id: 'new',
          lastReviewed: undefined,
        }),
      ];

      const sorted = sortCardsForStudy(cards);

      // New cards should come first
      expect(sorted[0].id).toBe('new');
    });

    it('should track study progress through a session', () => {
      const cards: Flashcard[] = [
        createMockCard({ id: '1' }),
        createMockCard({ id: '2' }),
        createMockCard({ id: '3' }),
      ];

      const session = {
        totalCards: cards.length,
        cardsStudied: 0,
        correct: 0,
        incorrect: 0,
      };

      // Simulate studying cards
      const studyCard = (rating: 'correct' | 'incorrect') => {
        session.cardsStudied++;
        if (rating === 'correct') {
          session.correct++;
        } else {
          session.incorrect++;
        }
      };

      studyCard('correct');
      studyCard('correct');
      studyCard('incorrect');

      expect(session.cardsStudied).toBe(3);
      expect(session.correct).toBe(2);
      expect(session.incorrect).toBe(1);

      const accuracy = Math.round((session.correct / session.cardsStudied) * 100);
      expect(accuracy).toBe(67);
    });
  });

  describe('Spaced repetition integration', () => {
    it('should update card after review and calculate new interval', () => {
      const card = createMockCard({
        interval: 1,
        easinessFactor: 2.5,
        timesReviewed: 1,
        status: 'learning',
      });

      // Review with "good" rating
      const result = calculateNextReview(card, 'good');

      // Should update interval (1 day -> 6 days for second review)
      expect(result.interval).toBe(6);
      expect(result.timesReviewed).toBe(2);
      expect(result.nextReviewDate).toBeDefined();
    });

    it('should handle a complete learning journey', () => {
      let card = createMockCard({
        status: 'new',
        interval: 0,
        easinessFactor: 2.5,
        timesReviewed: 0,
        timesCorrect: 0,
      });

      // First review - rated "good"
      let result = calculateNextReview(card, 'good');
      expect(result.interval).toBe(1); // First interval is 1 day

      // Update card with result
      card = { ...card, ...result } as Flashcard;

      // Second review - rated "good"
      result = calculateNextReview(card, 'good');
      expect(result.interval).toBe(6); // Second interval is 6 days

      // Update card
      card = { ...card, ...result } as Flashcard;

      // Third review - rated "easy"
      result = calculateNextReview(card, 'easy');
      expect(result.interval).toBeGreaterThan(6); // Should grow significantly
      expect(result.easinessFactor).toBeGreaterThan(2.5); // EF should increase
    });

    it('should reset interval when card is failed', () => {
      const card = createMockCard({
        interval: 30,
        easinessFactor: 2.5,
        timesReviewed: 5,
        status: 'review',
      });

      // Fail the card
      const result = calculateNextReview(card, 'again');

      // Should reset to learning status with short interval
      expect(result.interval).toBe(1);
      expect(result.status).toBe('learning');
      expect(result.easinessFactor).toBeLessThan(2.5);
    });
  });
});
