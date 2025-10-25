/**
 * DATA VALIDATION SCHEMAS
 *
 * This file contains all validation rules for LifeDash data.
 * We use Zod - a TypeScript-first validation library.
 *
 * WHAT IS ZOD?
 * Think of it like a security guard that checks:
 * - Is the email actually an email? ✅
 * - Is the password long enough? ✅
 * - Is the amount a valid number? ✅
 * - Are there dangerous characters? ❌
 *
 * HOW IT WORKS:
 * 1. Define a schema (rules)
 * 2. Pass data to schema.parse()
 * 3. If valid: returns clean data
 * 4. If invalid: throws error with helpful message
 */

import { z } from 'zod';

// ============================================
// HELPER SCHEMAS (Reusable pieces)
// ============================================

/**
 * Email validation
 * Must be a valid email format
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(3, 'Email is too short')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim();

/**
 * Password validation
 * At least 6 characters (Firebase minimum)
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long');

/**
 * Non-empty string validation
 * Used for titles, names, etc.
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'This field is required')
  .trim();

/**
 * Optional string validation
 * Allows empty strings or undefined
 */
export const optionalStringSchema = z
  .string()
  .trim()
  .optional();

/**
 * Color hex code validation
 * Must be valid hex color (#RRGGBB)
 */
export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid color (e.g., #FF5733)')
  .default('#3B82F6'); // Default blue

/**
 * Icon/Emoji validation
 * Single emoji or up to 4 characters
 */
export const iconSchema = z
  .string()
  .max(4, 'Icon must be 4 characters or less')
  .default('📝');

/**
 * Tag array validation
 * Array of strings, each 1-30 characters
 */
export const tagsSchema = z
  .array(
    z.string()
      .min(1, 'Tag cannot be empty')
      .max(30, 'Tag is too long')
      .trim()
  )
  .default([]);

/**
 * URL validation
 * Optional valid URL
 */
export const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''));

/**
 * Positive number validation
 * Must be greater than 0
 */
export const positiveNumberSchema = z
  .number()
  .positive('Must be greater than 0');

/**
 * Non-negative number validation
 * Must be 0 or greater
 */
export const nonNegativeNumberSchema = z
  .number()
  .nonnegative('Cannot be negative');

/**
 * Date validation
 * Converts string dates to Date objects
 */
export const dateSchema = z.coerce.date();

// ============================================
// USER & AUTH SCHEMAS
// ============================================

/**
 * Registration schema
 * For creating new accounts
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .trim()
    .optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

/**
 * Login schema
 * For user authentication
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
});

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  displayName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .trim()
    .optional(),
  photoURL: urlSchema,
});

// ============================================
// JOURNAL SCHEMAS
// ============================================

/**
 * Create journal schema
 * Validates when creating a new journal
 */
export const createJournalSchema = z.object({
  name: z.string()
    .min(1, 'Journal name is required')
    .max(100, 'Journal name is too long')
    .trim(),
  description: z.string()
    .max(500, 'Description is too long')
    .trim()
    .optional(),
  color: colorSchema,
  icon: iconSchema,
});

/**
 * Update journal schema
 * All fields optional (partial update)
 */
export const updateJournalSchema = createJournalSchema.partial();

/**
 * Mood validation
 * One of 5 predefined moods
 */
export const moodSchema = z.enum([
  'terrible',
  'bad',
  'okay',
  'good',
  'great'
], {
  errorMap: () => ({ message: 'Invalid mood value' }),
}).optional();

/**
 * Create journal entry schema
 */
export const createJournalEntrySchema = z.object({
  journalId: z.string().min(1, 'Journal ID is required'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .trim(),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content is too long (max 50,000 characters)')
    .trim(),
  mood: moodSchema,
  tags: tagsSchema,
  isFavorite: z.boolean().default(false),
});

/**
 * Update journal entry schema
 */
export const updateJournalEntrySchema = createJournalEntrySchema
  .omit({ journalId: true })
  .partial();

// ============================================
// EXPENSE SCHEMAS
// ============================================

/**
 * Currency validation
 * Common currency codes
 */
export const currencySchema = z.enum([
  'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'CAD', 'AUD'
], {
  errorMap: () => ({ message: 'Invalid currency' }),
}).default('USD');

/**
 * Payment method validation
 */
export const paymentMethodSchema = z.enum([
  'cash',
  'card',
  'bank_transfer',
  'digital_wallet',
  'other'
], {
  errorMap: () => ({ message: 'Invalid payment method' }),
}).default('cash');

/**
 * Create expense category schema
 */
export const createExpenseCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name is too long')
    .trim(),
  icon: iconSchema,
  color: colorSchema,
  budget: z.number()
    .nonnegative('Budget cannot be negative')
    .optional(),
  budgetPeriod: z.enum(['monthly', 'yearly'], {
    errorMap: () => ({ message: 'Budget period must be monthly or yearly' }),
  }).optional(),
});

/**
 * Update expense category schema
 */
export const updateExpenseCategorySchema = createExpenseCategorySchema.partial();

/**
 * Create expense schema
 */
export const createExpenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .int('Amount must be in cents (no decimals)')
    .max(999999999, 'Amount is too large'), // ~$10 million max
  currency: currencySchema,
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description is too long')
    .trim(),
  notes: z.string()
    .max(1000, 'Notes are too long')
    .trim()
    .optional(),
  date: dateSchema,
  paymentMethod: paymentMethodSchema,
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  tags: tagsSchema,
});

/**
 * Update expense schema
 */
export const updateExpenseSchema = createExpenseSchema.partial();

// ============================================
// FLASHCARD SCHEMAS
// ============================================

/**
 * Create flashcard deck schema
 */
export const createFlashcardDeckSchema = z.object({
  name: z.string()
    .min(1, 'Deck name is required')
    .max(100, 'Deck name is too long')
    .trim(),
  description: z.string()
    .max(500, 'Description is too long')
    .trim()
    .optional(),
  color: colorSchema,
  icon: iconSchema,
  parentId: z.string().optional(), // For folder organization
  isFolder: z.boolean().default(false),
});

/**
 * Update flashcard deck schema
 */
export const updateFlashcardDeckSchema = createFlashcardDeckSchema.partial();

/**
 * Difficulty level validation
 */
export const difficultySchema = z.number()
  .min(1, 'Difficulty must be at least 1')
  .max(5, 'Difficulty cannot exceed 5')
  .default(3);

/**
 * Create flashcard schema
 */
export const createFlashcardSchema = z.object({
  deckId: z.string().min(1, 'Deck ID is required'),
  front: z.string()
    .min(1, 'Front content is required')
    .max(1000, 'Front content is too long')
    .trim(),
  back: z.string()
    .min(1, 'Back content is required')
    .max(1000, 'Back content is too long')
    .trim(),
  tags: tagsSchema,
  hint: z.string()
    .max(500, 'Hint is too long')
    .trim()
    .optional(),
  difficulty: difficultySchema,
});

/**
 * Update flashcard schema
 */
export const updateFlashcardSchema = createFlashcardSchema
  .omit({ deckId: true })
  .partial();

/**
 * Flashcard review result schema
 * For spaced repetition algorithm
 */
export const flashcardReviewSchema = z.object({
  cardId: z.string().min(1, 'Card ID is required'),
  quality: z.number()
    .min(0, 'Quality must be at least 0')
    .max(5, 'Quality cannot exceed 5'),
  timeSpent: z.number()
    .nonnegative('Time spent cannot be negative'),
});

// ============================================
// TASK SCHEMAS
// ============================================

/**
 * Priority validation
 */
export const prioritySchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
}).default('medium');

/**
 * Task status validation
 */
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed'], {
  errorMap: () => ({ message: 'Invalid task status' }),
}).default('todo');

/**
 * Create task schema
 */
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title is too long')
    .trim(),
  description: z.string()
    .max(2000, 'Description is too long')
    .trim()
    .optional(),
  status: taskStatusSchema,
  priority: prioritySchema,
  dueDate: dateSchema.optional(),
  category: z.string()
    .max(50, 'Category is too long')
    .trim()
    .optional(),
  tags: tagsSchema,
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  estimatedMinutes: z.number()
    .positive('Estimated time must be positive')
    .optional(),
});

/**
 * Update task schema
 */
export const updateTaskSchema = createTaskSchema.partial();

// ============================================
// EXPORT TYPES FROM SCHEMAS
// ============================================

// These types are automatically inferred from the schemas
// Use them in your TypeScript code for type safety

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;

export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateFlashcardDeckInput = z.infer<typeof createFlashcardDeckSchema>;
export type UpdateFlashcardDeckInput = z.infer<typeof updateFlashcardDeckSchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type FlashcardReviewInput = z.infer<typeof flashcardReviewSchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
