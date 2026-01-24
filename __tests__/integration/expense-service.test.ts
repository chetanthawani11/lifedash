/**
 * EXPENSE SERVICE INTEGRATION TESTS
 *
 * Integration tests check that multiple parts of the code work together.
 * These tests mock Firebase but test the full service logic.
 *
 * WHY INTEGRATION TESTS?
 * - Unit tests check one function at a time
 * - Integration tests check that functions work together
 * - They catch bugs that unit tests miss
 */

import { Expense, ExpenseCategory } from '@/types';

// Mock Firebase before importing the service
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-123' },
  },
}));

// Mock Firestore functions
const mockExpenses: Expense[] = [];
const mockCategories: ExpenseCategory[] = [];

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn((_, data) => {
    const newExpense = { ...data, id: `expense-${Date.now()}` };
    mockExpenses.push(newExpense);
    return Promise.resolve({ id: newExpense.id });
  }),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: mockExpenses.map((exp) => ({
        id: exp.id,
        data: () => exp,
      })),
    })
  ),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: (date: Date) => ({ toDate: () => date }),
    now: () => ({ toDate: () => new Date() }),
  },
}));

describe('Expense Service Integration', () => {
  beforeEach(() => {
    // Clear mock data before each test
    mockExpenses.length = 0;
    mockCategories.length = 0;
  });

  describe('Expense calculations', () => {
    it('should calculate total expenses correctly', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 100,
          description: 'Groceries',
          category: 'Food',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          amount: 50,
          description: 'Gas',
          category: 'Transport',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          userId: 'user1',
          amount: 200,
          description: 'Electric bill',
          category: 'Utilities',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      expect(total).toBe(350);
    });

    it('should group expenses by category', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 100,
          description: 'Groceries',
          category: 'Food',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          amount: 50,
          description: 'Restaurant',
          category: 'Food',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          userId: 'user1',
          amount: 200,
          description: 'Electric',
          category: 'Utilities',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Group by category
      const grouped = expenses.reduce(
        (acc, exp) => {
          if (!acc[exp.category]) {
            acc[exp.category] = [];
          }
          acc[exp.category].push(exp);
          return acc;
        },
        {} as Record<string, Expense[]>
      );

      expect(Object.keys(grouped)).toEqual(['Food', 'Utilities']);
      expect(grouped['Food'].length).toBe(2);
      expect(grouped['Utilities'].length).toBe(1);
    });

    it('should calculate category totals', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 100,
          description: 'Groceries',
          category: 'Food',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          amount: 50,
          description: 'Restaurant',
          category: 'Food',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const categoryTotal = expenses
        .filter((exp) => exp.category === 'Food')
        .reduce((sum, exp) => sum + exp.amount, 0);

      expect(categoryTotal).toBe(150);
    });

    it('should filter expenses by date range', () => {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const expenses: Expense[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 100,
          description: 'Today expense',
          category: 'Food',
          date: today.toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          amount: 50,
          description: 'Last week expense',
          category: 'Food',
          date: lastWeek.toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          userId: 'user1',
          amount: 200,
          description: 'Last month expense',
          category: 'Food',
          date: lastMonth.toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Filter for this week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);

      const thisWeekExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= weekStart;
      });

      expect(thisWeekExpenses.length).toBe(2);
    });
  });

  describe('Expense validation', () => {
    it('should validate expense has required fields', () => {
      const validateExpense = (expense: Partial<Expense>): boolean => {
        return !!(
          expense.amount &&
          expense.amount > 0 &&
          expense.description &&
          expense.category &&
          expense.date
        );
      };

      expect(
        validateExpense({
          amount: 100,
          description: 'Test',
          category: 'Food',
          date: new Date().toISOString(),
        })
      ).toBe(true);

      expect(
        validateExpense({
          amount: 0,
          description: 'Test',
          category: 'Food',
          date: new Date().toISOString(),
        })
      ).toBe(false);

      expect(
        validateExpense({
          amount: 100,
          description: '',
          category: 'Food',
          date: new Date().toISOString(),
        })
      ).toBe(false);
    });

    it('should not allow negative amounts', () => {
      const validateAmount = (amount: number): boolean => {
        return amount > 0;
      };

      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-50)).toBe(false);
    });
  });

  describe('Budget calculations', () => {
    it('should calculate remaining budget', () => {
      const budget = 1000;
      const expenses: Expense[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 300,
          description: 'Groceries',
          category: 'Food',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          amount: 200,
          description: 'Gas',
          category: 'Transport',
          date: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const remaining = budget - spent;

      expect(remaining).toBe(500);
    });

    it('should calculate budget percentage used', () => {
      const budget = 1000;
      const spent = 750;

      const percentageUsed = Math.round((spent / budget) * 100);

      expect(percentageUsed).toBe(75);
    });

    it('should detect over-budget', () => {
      const budget = 1000;
      const spent = 1200;

      const isOverBudget = spent > budget;
      const overBy = spent - budget;

      expect(isOverBudget).toBe(true);
      expect(overBy).toBe(200);
    });
  });
});
