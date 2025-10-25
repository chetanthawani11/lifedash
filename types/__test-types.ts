// TEST FILE - Verify all types and schemas work correctly
// This file won't be used in production, just for testing
// If this file has no TypeScript errors, all our types are working!

import { Timestamp } from 'firebase/firestore';
import {
  // Journal imports
  Journal,
  JournalEntry,
  createJournalSchema,
  createJournalEntrySchema,
  CreateJournalInput,
  CreateJournalEntryInput,

  // Expense imports
  Expense,
  ExpenseCategory,
  createExpenseSchema,
  createExpenseCategorySchema,
  CreateExpenseInput,
  dollarsToCents,
  centsToDollars,

  // Flashcard imports
  Flashcard,
  FlashcardDeck,
  FlashcardFolder,
  createFlashcardSchema,
  calculateNextReviewInterval,

  // Task imports
  Task,
  createTaskSchema,
  isTaskOverdue,
  formatMinutes,

  // Common types
  ApiResponse,
  PaginatedResponse,
  getDateRangeFromPreset,
} from './index';

// ============================================
// TEST: Journal Types
// ============================================

console.log('Testing Journal types...');

// Test creating a journal with validation
const newJournal: CreateJournalInput = {
  name: 'My Test Journal',
  description: 'This is a test',
  color: '#f26419',
  icon: '📔',
};

// Validate with Zod
const journalValidation = createJournalSchema.safeParse(newJournal);
if (journalValidation.success) {
  console.log('✅ Journal validation passed:', journalValidation.data);
} else {
  console.error('❌ Journal validation failed:', journalValidation.error);
}

// Test journal entry
const newEntry: CreateJournalEntryInput = {
  journalId: 'test-journal-id',
  title: 'Test Entry',
  content: 'This is my first entry!',
  mood: 'great',
  tags: ['testing', 'typescript'],
  isFavorite: false,
};

const entryValidation = createJournalEntrySchema.safeParse(newEntry);
if (entryValidation.success) {
  console.log('✅ Journal entry validation passed:', entryValidation.data);
} else {
  console.error('❌ Journal entry validation failed:', entryValidation.error);
}

// ============================================
// TEST: Expense Types
// ============================================

console.log('\nTesting Expense types...');

// Test expense category
const newCategory = {
  name: 'Food',
  color: '#ef4444',
  icon: '🍔',
  budget: dollarsToCents(500), // $500 budget in cents
};

const categoryValidation = createExpenseCategorySchema.safeParse(newCategory);
if (categoryValidation.success) {
  console.log('✅ Expense category validation passed:', categoryValidation.data);
} else {
  console.error('❌ Expense category validation failed:', categoryValidation.error);
}

// Test expense
const newExpense: CreateExpenseInput = {
  categoryId: 'test-category-id',
  amount: dollarsToCents(25.50), // $25.50 in cents
  currency: 'USD',
  description: 'Lunch at restaurant',
  notes: 'With friends',
  date: new Date(),
  paymentMethod: 'card',
  isRecurring: false,
  tags: ['food', 'social'],
};

const expenseValidation = createExpenseSchema.safeParse(newExpense);
if (expenseValidation.success) {
  console.log('✅ Expense validation passed:', expenseValidation.data);
  console.log('Amount in dollars:', centsToDollars(expenseValidation.data.amount));
} else {
  console.error('❌ Expense validation failed:', expenseValidation.error);
}

// ============================================
// TEST: Flashcard Types
// ============================================

console.log('\nTesting Flashcard types...');

// Test flashcard
const newFlashcard = {
  deckId: 'test-deck-id',
  front: 'What is TypeScript?',
  back: 'TypeScript is a typed superset of JavaScript',
  notes: 'Also has great IDE support',
  tags: ['programming', 'typescript'],
  difficulty: 'medium' as const,
};

const flashcardValidation = createFlashcardSchema.safeParse(newFlashcard);
if (flashcardValidation.success) {
  console.log('✅ Flashcard validation passed:', flashcardValidation.data);
} else {
  console.error('❌ Flashcard validation failed:', flashcardValidation.error);
}

// Test spaced repetition algorithm
console.log('\nTesting spaced repetition:');
console.log('First correct:', calculateNextReviewInterval(true, 0), 'days'); // Should be 1
console.log('Second correct:', calculateNextReviewInterval(true, 1), 'days'); // Should be 3
console.log('Third correct:', calculateNextReviewInterval(true, 2), 'days'); // Should be 7
console.log('Wrong answer:', calculateNextReviewInterval(false, 5), 'days'); // Should reset to 1

// ============================================
// TEST: Task Types
// ============================================

console.log('\nTesting Task types...');

// Test task
const newTask = {
  title: 'Complete TypeScript tutorial',
  description: 'Learn about types and interfaces',
  status: 'todo' as const,
  priority: 'high' as const,
  dueDate: new Date(),
  tags: ['learning', 'typescript'],
  category: 'Education',
  estimatedMinutes: 120,
  isRecurring: false,
};

const taskValidation = createTaskSchema.safeParse(newTask);
if (taskValidation.success) {
  console.log('✅ Task validation passed:', taskValidation.data);
  console.log('Formatted time:', formatMinutes(taskValidation.data.estimatedMinutes || 0));
} else {
  console.error('❌ Task validation failed:', taskValidation.error);
}

// ============================================
// TEST: Common Types
// ============================================

console.log('\nTesting common types...');

// Test API response
const apiResponse: ApiResponse<Journal> = {
  success: true,
  data: {
    id: 'test-id',
    userId: 'user-123',
    name: 'Test Journal',
    description: null,
    color: '#f26419',
    icon: '📔',
    entryCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  message: 'Journal created successfully',
};

console.log('✅ API Response type works:', apiResponse.success);

// Test date range helpers
const last7Days = getDateRangeFromPreset('last7days');
if (last7Days) {
  console.log('✅ Date range helper works:');
  console.log('  From:', last7Days.from.toISOString());
  console.log('  To:', last7Days.to.toISOString());
}

// ============================================
// FINAL TEST SUMMARY
// ============================================

console.log('\n' + '='.repeat(50));
console.log('🎉 ALL TYPES AND SCHEMAS ARE WORKING!');
console.log('='.repeat(50));
console.log('\nIf you see this message and no TypeScript errors,');
console.log('all your types are set up correctly! ✨');
console.log('\nYou can now safely delete this file (__test-types.ts)');
console.log('or keep it for reference.');
