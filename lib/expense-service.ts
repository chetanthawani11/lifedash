// Expense Service - All expense tracking database operations
// Handles expenses, categories, and budget tracking

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
  dateToTimestamp,
} from './db-utils';

import {
  Expense,
  ExpenseCategory,
  ExpenseData,
  ExpenseCategoryData,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
  createExpenseSchema,
  updateExpenseSchema,
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  ExpenseWithCategory,
  CategoryWithSpending,
  DEFAULT_EXPENSE_CATEGORIES,
} from '@/types';

import { Timestamp, Unsubscribe } from 'firebase/firestore';

// Collection names
const CATEGORIES_COLLECTION = 'expense_categories';
const EXPENSES_COLLECTION = 'expenses';

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * Create default expense categories for a new user
 * Call this once when user signs up
 */
export const createDefaultCategories = async (userId: string): Promise<void> => {
  await Promise.all(
    DEFAULT_EXPENSE_CATEGORIES.map(category =>
      createExpenseCategory(userId, category)
    )
  );
};

/**
 * Create a new expense category
 */
export const createExpenseCategory = async (
  userId: string,
  input: CreateExpenseCategoryInput
): Promise<ExpenseCategory> => {
  // Validate input
  const validatedData = createExpenseCategorySchema.parse(input);

  // Prepare category data
  const categoryData: ExpenseCategoryData = {
    userId,
    name: validatedData.name,
    color: validatedData.color,
    icon: validatedData.icon,
    budget: validatedData.budget || null,
    createdAt: now(),
    updatedAt: now(),
  };

  // Save to Firestore
  const categoryId = await createDocument<ExpenseCategoryData>(
    userId,
    CATEGORIES_COLLECTION,
    categoryData
  );

  return {
    id: categoryId,
    ...categoryData,
  };
};

/**
 * Get a single expense category
 */
export const getExpenseCategory = async (
  userId: string,
  categoryId: string
): Promise<ExpenseCategory | null> => {
  return getDocument<ExpenseCategory>(userId, CATEGORIES_COLLECTION, categoryId);
};

/**
 * Get all expense categories for a user
 */
export const getUserExpenseCategories = async (
  userId: string
): Promise<ExpenseCategory[]> => {
  return getDocuments<ExpenseCategory>(
    userId,
    CATEGORIES_COLLECTION,
    [orderBy('name', 'asc')]
  );
};

/**
 * Update an expense category
 */
export const updateExpenseCategory = async (
  userId: string,
  categoryId: string,
  updates: UpdateExpenseCategoryInput
): Promise<void> => {
  const validatedUpdates = updateExpenseCategorySchema.parse(updates);
  await updateDocument(userId, CATEGORIES_COLLECTION, categoryId, validatedUpdates);
};

/**
 * Delete an expense category
 * WARNING: This will fail if there are expenses using this category
 */
export const deleteExpenseCategory = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  // Check if there are expenses using this category
  const expenses = await getDocuments<Expense>(
    userId,
    EXPENSES_COLLECTION,
    [where('categoryId', '==', categoryId), limit(1)]
  );

  if (expenses.length > 0) {
    throw new Error('Cannot delete category with existing expenses. Please delete or reassign the expenses first.');
  }

  await deleteDocument(userId, CATEGORIES_COLLECTION, categoryId);
};

// ============================================
// EXPENSE OPERATIONS
// ============================================

/**
 * Create a new expense
 */
export const createExpense = async (
  userId: string,
  input: CreateExpenseInput
): Promise<Expense> => {
  // Validate input
  const validatedData = createExpenseSchema.parse(input);

  // Prepare expense data
  const expenseData: ExpenseData = {
    userId,
    categoryId: validatedData.categoryId,
    amount: validatedData.amount,
    currency: validatedData.currency,
    description: validatedData.description,
    notes: validatedData.notes || null,
    date: dateToTimestamp(validatedData.date),
    paymentMethod: validatedData.paymentMethod,
    isRecurring: validatedData.isRecurring,
    tags: validatedData.tags || [],
    createdAt: now(),
    updatedAt: now(),
  };

  // Save to Firestore
  const expenseId = await createDocument<ExpenseData>(
    userId,
    EXPENSES_COLLECTION,
    expenseData
  );

  return {
    id: expenseId,
    ...expenseData,
  };
};

/**
 * Get a single expense
 */
export const getExpense = async (
  userId: string,
  expenseId: string
): Promise<Expense | null> => {
  return getDocument<Expense>(userId, EXPENSES_COLLECTION, expenseId);
};

/**
 * Get all expenses for a user
 *
 * @param maxExpenses - Maximum number of expenses to return
 * @param sortBy - Sort by 'date' or 'amount' (default: 'date')
 */
export const getUserExpenses = async (
  userId: string,
  maxExpenses: number = 100,
  sortBy: 'date' | 'amount' = 'date'
): Promise<Expense[]> => {
  return getDocuments<Expense>(
    userId,
    EXPENSES_COLLECTION,
    [orderBy(sortBy, 'desc'), limit(maxExpenses)]
  );
};

/**
 * Get expenses for a specific category
 */
export const getExpensesByCategory = async (
  userId: string,
  categoryId: string,
  maxExpenses: number = 100
): Promise<Expense[]> => {
  return getDocuments<Expense>(
    userId,
    EXPENSES_COLLECTION,
    [
      where('categoryId', '==', categoryId),
      orderBy('date', 'desc'),
      limit(maxExpenses),
    ]
  );
};

/**
 * Get expenses within a date range
 */
export const getExpensesByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Expense[]> => {
  const start = dateToTimestamp(startDate);
  const end = dateToTimestamp(endDate);

  return getDocuments<Expense>(
    userId,
    EXPENSES_COLLECTION,
    [
      where('date', '>=', start),
      where('date', '<=', end),
      orderBy('date', 'desc'),
    ]
  );
};

/**
 * Get expenses for the current month
 */
export const getMonthlyExpenses = async (
  userId: string,
  year?: number,
  month?: number
): Promise<Expense[]> => {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  return getExpensesByDateRange(userId, startDate, endDate);
};

/**
 * Search expenses by tags
 */
export const searchExpensesByTag = async (
  userId: string,
  tag: string,
  maxExpenses: number = 50
): Promise<Expense[]> => {
  return getDocuments<Expense>(
    userId,
    EXPENSES_COLLECTION,
    [
      where('tags', 'array-contains', tag.toLowerCase()),
      orderBy('date', 'desc'),
      limit(maxExpenses),
    ]
  );
};

/**
 * Update an expense
 */
export const updateExpense = async (
  userId: string,
  expenseId: string,
  updates: UpdateExpenseInput
): Promise<void> => {
  const validatedUpdates = updateExpenseSchema.parse(updates);

  // Convert date if provided
  const updateData = validatedUpdates.date
    ? { ...validatedUpdates, date: dateToTimestamp(validatedUpdates.date) }
    : validatedUpdates;

  await updateDocument(userId, EXPENSES_COLLECTION, expenseId, updateData);
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  userId: string,
  expenseId: string
): Promise<void> => {
  await deleteDocument(userId, EXPENSES_COLLECTION, expenseId);
};

/**
 * Subscribe to real-time updates for expenses
 */
export const subscribeToUserExpenses = (
  userId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  return subscribeToCollection<Expense>(
    userId,
    EXPENSES_COLLECTION,
    [orderBy('date', 'desc'), limit(100)],
    onUpdate,
    onError
  );
};

// ============================================
// ANALYTICS & STATISTICS
// ============================================

/**
 * Get expenses with category details
 * Useful for displaying expenses with category names, colors, icons
 */
export const getExpensesWithCategories = async (
  userId: string,
  maxExpenses: number = 100
): Promise<ExpenseWithCategory[]> => {
  const expenses = await getUserExpenses(userId, maxExpenses);
  const categories = await getUserExpenseCategories(userId);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  return expenses.map(expense => {
    const category = categoryMap.get(expense.categoryId);
    return {
      ...expense,
      category: category
        ? {
            name: category.name,
            color: category.color,
            icon: category.icon,
          }
        : {
            name: 'Unknown',
            color: '#78716c',
            icon: '❓',
          },
    };
  });
};

/**
 * Get categories with spending statistics for current month
 * Shows how much spent in each category vs budget
 */
export const getCategoriesWithSpending = async (
  userId: string,
  year?: number,
  month?: number
): Promise<CategoryWithSpending[]> => {
  const categories = await getUserExpenseCategories(userId);
  const monthlyExpenses = await getMonthlyExpenses(userId, year, month);

  return categories.map(category => {
    // Calculate total spent in this category this month
    const categoryExpenses = monthlyExpenses.filter(
      expense => expense.categoryId === category.id
    );

    const totalSpent = categoryExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const expenseCount = categoryExpenses.length;

    const percentageOfBudget = category.budget
      ? (totalSpent / category.budget) * 100
      : null;

    return {
      ...category,
      totalSpent,
      expenseCount,
      percentageOfBudget,
    };
  });
};

/**
 * Calculate total spending for a date range
 */
export const getTotalSpending = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const expenses = await getExpensesByDateRange(userId, startDate, endDate);
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Get spending by category for charts/analytics
 */
export const getSpendingByCategory = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ categoryName: string; amount: number; color: string }[]> => {
  const expenses = await getExpensesByDateRange(userId, startDate, endDate);
  const categories = await getUserExpenseCategories(userId);

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const spendingMap = new Map<string, number>();

  // Sum spending by category
  expenses.forEach(expense => {
    const current = spendingMap.get(expense.categoryId) || 0;
    spendingMap.set(expense.categoryId, current + expense.amount);
  });

  // Convert to array with category names
  return Array.from(spendingMap.entries()).map(([categoryId, amount]) => {
    const category = categoryMap.get(categoryId);
    return {
      categoryName: category?.name || 'Unknown',
      amount,
      color: category?.color || '#78716c',
    };
  });
};

/**
 * Get all unique tags across all expenses
 */
export const getAllExpenseTags = async (userId: string): Promise<string[]> => {
  const expenses = await getDocuments<Expense>(userId, EXPENSES_COLLECTION, []);

  const tagsSet = new Set<string>();
  expenses.forEach(expense => {
    expense.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
};
