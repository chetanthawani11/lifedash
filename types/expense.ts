// Expense Tracking Data Models and Validation Schemas
// This file defines the shape of all expense-related data in LifeDash

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

/**
 * ExpenseCategory - Categories for organizing expenses
 * Example: "Food", "Transport", "Entertainment"
 */
export interface ExpenseCategory {
  id: string;                    // Unique identifier
  userId: string;                // Who owns this category
  name: string;                  // Category name (e.g., "Food & Dining")
  color: string;                 // Color for charts/visuals
  icon: string;                  // Emoji or icon (e.g., "🍔")
  budget: number | null;         // Optional monthly budget for this category
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Expense - A single expense transaction
 */
export interface Expense {
  id: string;                    // Unique identifier
  userId: string;                // Who made this expense
  categoryId: string;            // Which category does this belong to
  amount: number;                // Amount spent (in cents to avoid floating point issues)
  currency: string;              // Currency code (e.g., "USD", "EUR")
  description: string;           // What was this expense for
  notes: string | null;          // Optional additional notes
  date: Timestamp;               // When did this expense occur
  paymentMethod: PaymentMethod;  // How was this paid
  isRecurring: boolean;          // Is this a recurring expense
  tags: string[];                // Tags for organization
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * PaymentMethod - How the expense was paid
 */
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

// Payment method options for the UI
export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'other', label: 'Other', icon: '💰' },
];

// ============================================
// PREDEFINED EXPENSE CATEGORIES
// ============================================

/**
 * Default categories to create for new users
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { name: 'Shopping', icon: '🛍️', color: '#a855f7' },
  { name: 'Entertainment', icon: '🎮', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: '💡', color: '#f59e0b' },
  { name: 'Healthcare', icon: '🏥', color: '#22c55e' },
  { name: 'Education', icon: '📚', color: '#14b8a6' },
  { name: 'Other', icon: '📦', color: '#78716c' },
];

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a NEW expense category
 */
export const createExpenseCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(30, 'Category name must be less than 30 characters')
    .trim(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color')
    .default('#f26419'),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(10, 'Icon must be a single emoji or short text')
    .default('📦'),
  budget: z.number()
    .positive('Budget must be a positive number')
    .max(999999999, 'Budget is too large') // ~$10 million limit
    .nullable()
    .optional(),
});

/**
 * Schema for updating an expense category
 */
export const updateExpenseCategorySchema = createExpenseCategorySchema.partial();

/**
 * Schema for creating a NEW expense
 */
export const createExpenseSchema = z.object({
  categoryId: z.string()
    .min(1, 'Category is required'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  currency: z.string()
    .length(3, 'Currency must be a 3-letter code (e.g., USD)')
    .default('USD'),
  description: z.string()
    .min(1, 'Description is required')
    .max(100, 'Description must be less than 100 characters')
    .trim(),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
  date: z.date()
    .default(() => new Date()),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'other'])
    .default('card'),
  isRecurring: z.boolean()
    .default(false),
  tags: z.array(z.string().trim().toLowerCase())
    .max(5, 'Maximum 5 tags allowed')
    .default([]),
});

/**
 * Schema for updating an existing expense
 */
export const updateExpenseSchema = createExpenseSchema.partial();

// ============================================
// TYPESCRIPT TYPES FROM ZOD SCHEMAS
// ============================================

export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Expense with category details
 * Used in expense list views to show category name, color, icon
 */
export interface ExpenseWithCategory extends Expense {
  category: Pick<ExpenseCategory, 'name' | 'color' | 'icon'>;
}

/**
 * Category with spending summary
 * Used in budget overview/analytics
 */
export interface CategoryWithSpending extends ExpenseCategory {
  totalSpent: number;           // Total spent in this category (current month)
  expenseCount: number;         // Number of expenses in this category
  percentageOfBudget: number | null; // How much of budget is used (if budget exists)
}

/**
 * Firestore document data (without id)
 */
export type ExpenseCategoryData = Omit<ExpenseCategory, 'id'>;
export type ExpenseData = Omit<Expense, 'id'>;

/**
 * Helper function to convert dollars to cents (avoid floating point errors)
 * Example: dollarsToCents(10.50) => 1050
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

/**
 * Helper function to convert cents to dollars
 * Example: centsToDollars(1050) => 10.50
 */
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};
