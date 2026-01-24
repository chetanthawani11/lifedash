/**
 * PERFORMANCE TESTS FOR LARGE DATASETS
 *
 * These tests ensure the app performs well with lots of data.
 * We test:
 * - Rendering many items
 * - Filtering large lists
 * - Sorting operations
 * - Memory usage patterns
 *
 * WHY PERFORMANCE TESTS?
 * - Users will add lots of data over time
 * - Slow apps = frustrated users
 * - Find problems before users do
 */

import { Expense, Task, Flashcard, JournalEntry } from '@/types';

// Helper to measure execution time
const measureTime = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`${name}: ${duration.toFixed(2)}ms`);
  return { result, duration };
};

// Generate large dataset of expenses
const generateExpenses = (count: number): Expense[] => {
  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping'];

  return Array.from({ length: count }, (_, i) => ({
    id: `expense-${i}`,
    userId: 'user-123',
    amount: Math.random() * 1000,
    description: `Expense item ${i}`,
    category: categories[i % categories.length],
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

// Generate large dataset of tasks
const generateTasks = (count: number): Task[] => {
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
  const statuses: ('pending' | 'in_progress' | 'completed')[] = [
    'pending',
    'in_progress',
    'completed',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    userId: 'user-123',
    title: `Task ${i}`,
    description: `Description for task ${i}`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [`tag-${i % 10}`],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

// Generate large dataset of flashcards
const generateFlashcards = (count: number): Flashcard[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i}`,
    deckId: `deck-${i % 10}`,
    front: `Question ${i}`,
    back: `Answer ${i}`,
    status: 'new' as const,
    difficulty: 0,
    easinessFactor: 2.5,
    interval: 0,
    timesReviewed: 0,
    timesCorrect: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

describe('Performance Tests', () => {
  describe('Expense Operations', () => {
    it('should filter 10,000 expenses quickly', async () => {
      const expenses = generateExpenses(10000);

      const { duration } = await measureTime('Filter 10k expenses', () => {
        return expenses.filter((e) => e.category === 'Food');
      });

      // Should complete in under 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should calculate total of 10,000 expenses quickly', async () => {
      const expenses = generateExpenses(10000);

      const { duration, result } = await measureTime('Sum 10k expenses', () => {
        return expenses.reduce((sum, e) => sum + e.amount, 0);
      });

      expect(duration).toBeLessThan(20);
      expect(result).toBeGreaterThan(0);
    });

    it('should sort 10,000 expenses by date quickly', async () => {
      const expenses = generateExpenses(10000);

      const { duration } = await measureTime('Sort 10k expenses', () => {
        return [...expenses].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });

      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should group 10,000 expenses by category quickly', async () => {
      const expenses = generateExpenses(10000);

      const { duration, result } = await measureTime('Group 10k expenses', () => {
        return expenses.reduce(
          (acc, exp) => {
            if (!acc[exp.category]) {
              acc[exp.category] = [];
            }
            acc[exp.category].push(exp);
            return acc;
          },
          {} as Record<string, Expense[]>
        );
      });

      expect(duration).toBeLessThan(50);
      expect(Object.keys(result).length).toBe(5);
    });

    it('should calculate category totals for 10,000 expenses quickly', async () => {
      const expenses = generateExpenses(10000);

      const { duration, result } = await measureTime('Category totals 10k', () => {
        return expenses.reduce(
          (acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
          },
          {} as Record<string, number>
        );
      });

      expect(duration).toBeLessThan(30);
      expect(Object.keys(result).length).toBe(5);
    });
  });

  describe('Task Operations', () => {
    it('should filter 5,000 tasks by status quickly', async () => {
      const tasks = generateTasks(5000);

      const { duration } = await measureTime('Filter 5k tasks', () => {
        return tasks.filter((t) => t.status === 'pending');
      });

      expect(duration).toBeLessThan(20);
    });

    it('should sort 5,000 tasks by priority and date quickly', async () => {
      const tasks = generateTasks(5000);
      const priorityOrder = { high: 0, medium: 1, low: 2 };

      const { duration } = await measureTime('Sort 5k tasks', () => {
        return [...tasks].sort((a, b) => {
          const priorityDiff =
            priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
          if (priorityDiff !== 0) return priorityDiff;

          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      });

      expect(duration).toBeLessThan(100);
    });

    it('should find overdue tasks in 5,000 tasks quickly', async () => {
      const tasks = generateTasks(5000);
      const now = new Date();

      const { duration, result } = await measureTime('Find overdue in 5k', () => {
        return tasks.filter((t) => {
          if (!t.dueDate || t.status === 'completed') return false;
          return new Date(t.dueDate) < now;
        });
      });

      expect(duration).toBeLessThan(30);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Flashcard Operations', () => {
    it('should filter 10,000 cards by deck quickly', async () => {
      const cards = generateFlashcards(10000);

      const { duration } = await measureTime('Filter 10k cards', () => {
        return cards.filter((c) => c.deckId === 'deck-5');
      });

      expect(duration).toBeLessThan(20);
    });

    it('should find due cards in 10,000 cards quickly', async () => {
      const cards = generateFlashcards(10000);

      const { duration } = await measureTime('Find due in 10k', () => {
        const now = new Date();
        return cards.filter((card) => {
          if (!card.lastReviewed) return true;
          if (!card.nextReviewDate) return true;
          return new Date(card.nextReviewDate) <= now;
        });
      });

      expect(duration).toBeLessThan(30);
    });

    it('should calculate deck statistics for 10,000 cards quickly', async () => {
      const cards = generateFlashcards(10000);

      const { duration, result } = await measureTime('Deck stats 10k', () => {
        return cards.reduce(
          (stats, card) => {
            stats.total++;
            if (!card.lastReviewed) {
              stats.new++;
            } else if (card.status === 'mastered') {
              stats.mastered++;
            } else {
              stats.learning++;
            }
            stats.totalEF += card.easinessFactor || 2.5;
            return stats;
          },
          { total: 0, new: 0, learning: 0, mastered: 0, totalEF: 0 }
        );
      });

      expect(duration).toBeLessThan(30);
      expect(result.total).toBe(10000);
    });
  });

  describe('Search Operations', () => {
    it('should search through 10,000 items quickly', async () => {
      const items = Array.from({ length: 10000 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item number ${i} with some description text`,
        content: `This is the content for item ${i}. It contains various words and phrases.`,
      }));

      const { duration, result } = await measureTime('Search 10k items', () => {
        const searchTerm = 'number 5000';
        return items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      expect(duration).toBeLessThan(100);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle fuzzy search on 5,000 items', async () => {
      const items = generateTasks(5000);

      const { duration } = await measureTime('Fuzzy search 5k', () => {
        const searchTerm = 'task';
        return items
          .map((item) => ({
            item,
            score: item.title.toLowerCase().includes(searchTerm) ? 1 : 0,
          }))
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 50);
      });

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Memory Efficiency', () => {
    it('should handle creating 50,000 objects without crashing', async () => {
      const { duration } = await measureTime('Create 50k objects', () => {
        return generateExpenses(50000);
      });

      // Should complete in under 500ms
      expect(duration).toBeLessThan(500);
    });

    it('should handle chained operations on large datasets', async () => {
      const expenses = generateExpenses(10000);

      const { duration, result } = await measureTime('Chained operations', () => {
        return expenses
          .filter((e) => e.amount > 100)
          .filter((e) => e.category === 'Food' || e.category === 'Transport')
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 100)
          .map((e) => ({ id: e.id, amount: e.amount }));
      });

      expect(duration).toBeLessThan(100);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Date Operations', () => {
    it('should filter by date range on 10,000 items quickly', async () => {
      const expenses = generateExpenses(10000);
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const { duration } = await measureTime('Date filter 10k', () => {
        return expenses.filter((e) => {
          const date = new Date(e.date);
          return date >= startDate && date <= endDate;
        });
      });

      expect(duration).toBeLessThan(50);
    });

    it('should group by month on 10,000 items quickly', async () => {
      const expenses = generateExpenses(10000);

      const { duration, result } = await measureTime('Group by month 10k', () => {
        return expenses.reduce(
          (acc, exp) => {
            const date = new Date(exp.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[monthKey]) {
              acc[monthKey] = { total: 0, count: 0 };
            }
            acc[monthKey].total += exp.amount;
            acc[monthKey].count++;
            return acc;
          },
          {} as Record<string, { total: number; count: number }>
        );
      });

      expect(duration).toBeLessThan(50);
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });
  });
});
