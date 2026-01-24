/**
 * DATA EXPORT SERVICE
 *
 * Handles exporting user data in multiple formats.
 *
 * Features:
 * - Export all data or specific types (journals, expenses, tasks, flashcards)
 * - Multiple formats: JSON, CSV, Markdown
 * - Date range filtering
 * - Download as file
 */

import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

// ============================================
// TYPES
// ============================================

export type ExportFormat = 'json' | 'csv' | 'markdown';
export type DataType = 'journals' | 'expenses' | 'tasks' | 'flashcards' | 'notes' | 'goals';

export interface ExportOptions {
  dataTypes: DataType[];
  format: ExportFormat;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMetadata?: boolean;
}

export interface ExportedData {
  exportedAt: string;
  userId: string;
  dataTypes: DataType[];
  dateRange?: { start: string; end: string };
  data: {
    journals?: JournalExport[];
    journalEntries?: JournalEntryExport[];
    expenses?: ExpenseExport[];
    expenseCategories?: CategoryExport[];
    tasks?: TaskExport[];
    flashcardDecks?: DeckExport[];
    flashcards?: FlashcardExport[];
    notes?: NoteExport[];
    goals?: GoalExport[];
  };
}

// Export types (simplified for export)
interface JournalExport {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
}

interface JournalEntryExport {
  id: string;
  journalId: string;
  journalName?: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExpenseExport {
  id: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  description: string;
  notes?: string;
  date: string;
  paymentMethod?: string;
  tags: string[];
}

interface CategoryExport {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

interface TaskExport {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  category?: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

interface DeckExport {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  masteredCount: number;
  createdAt: string;
}

interface FlashcardExport {
  id: string;
  deckId: string;
  deckName?: string;
  front: string;
  back: string;
  difficulty: number;
  lastReviewed?: string;
  nextReview?: string;
}

interface NoteExport {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface GoalExport {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Firestore Timestamp to ISO string
 */
function timestampToString(timestamp: Timestamp | Date | null | undefined): string {
  if (!timestamp) return '';
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return '';
}

/**
 * Format cents to dollars string
 */
function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

async function fetchJournals(userId: string): Promise<{ journals: JournalExport[]; entries: JournalEntryExport[] }> {
  const journals: JournalExport[] = [];
  const entries: JournalEntryExport[] = [];
  const journalMap = new Map<string, string>();

  // Fetch journals
  const journalsRef = collection(db, 'users', userId, 'journals');
  const journalsSnapshot = await getDocs(journalsRef);

  journalsSnapshot.forEach((doc) => {
    const data = doc.data();
    journalMap.set(doc.id, data.name);
    journals.push({
      id: doc.id,
      name: data.name,
      description: data.description || '',
      color: data.color,
      icon: data.icon,
      createdAt: timestampToString(data.createdAt),
    });
  });

  // Fetch all entries (stored at top level with journalId field)
  const entriesRef = collection(db, 'users', userId, 'journal_entries');
  const entriesSnapshot = await getDocs(entriesRef);

  entriesSnapshot.forEach((doc) => {
    const data = doc.data();
    entries.push({
      id: doc.id,
      journalId: data.journalId,
      journalName: journalMap.get(data.journalId),
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      createdAt: timestampToString(data.createdAt),
      updatedAt: timestampToString(data.updatedAt),
    });
  });

  return { journals, entries };
}

async function fetchExpenses(userId: string, dateRange?: { start: Date; end: Date }): Promise<{ expenses: ExpenseExport[]; categories: CategoryExport[] }> {
  const expenses: ExpenseExport[] = [];
  const categories: CategoryExport[] = [];
  const categoryMap = new Map<string, string>();

  // Fetch categories
  const categoriesRef = collection(db, 'users', userId, 'expense_categories');
  const categoriesSnapshot = await getDocs(categoriesRef);

  categoriesSnapshot.forEach((doc) => {
    const data = doc.data();
    categoryMap.set(doc.id, data.name);
    categories.push({
      id: doc.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      budget: data.budget ? data.budget / 100 : undefined,
    });
  });

  // Fetch expenses
  const expensesRef = collection(db, 'users', userId, 'expenses');
  let expensesQuery = query(expensesRef, orderBy('date', 'desc'));

  if (dateRange) {
    expensesQuery = query(
      expensesRef,
      where('date', '>=', Timestamp.fromDate(dateRange.start)),
      where('date', '<=', Timestamp.fromDate(dateRange.end)),
      orderBy('date', 'desc')
    );
  }

  const expensesSnapshot = await getDocs(expensesQuery);

  expensesSnapshot.forEach((doc) => {
    const data = doc.data();
    const amount = data.amount || 0;
    expenses.push({
      id: doc.id,
      categoryId: data.categoryId,
      categoryName: categoryMap.get(data.categoryId),
      amount: amount / 100,
      amountFormatted: `$${centsToDollars(amount)}`,
      currency: data.currency || 'USD',
      description: data.description,
      notes: data.notes,
      date: timestampToString(data.date),
      paymentMethod: data.paymentMethod,
      tags: data.tags || [],
    });
  });

  return { expenses, categories };
}

async function fetchTasks(userId: string, dateRange?: { start: Date; end: Date }): Promise<TaskExport[]> {
  const tasks: TaskExport[] = [];

  const tasksRef = collection(db, 'users', userId, 'tasks');
  let tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'));

  if (dateRange) {
    tasksQuery = query(
      tasksRef,
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end)),
      orderBy('createdAt', 'desc')
    );
  }

  const tasksSnapshot = await getDocs(tasksQuery);

  tasksSnapshot.forEach((doc) => {
    const data = doc.data();
    tasks.push({
      id: doc.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: timestampToString(data.dueDate),
      category: data.category,
      tags: data.tags || [],
      createdAt: timestampToString(data.createdAt),
      completedAt: timestampToString(data.completedAt),
    });
  });

  return tasks;
}

async function fetchFlashcards(userId: string): Promise<{ decks: DeckExport[]; flashcards: FlashcardExport[] }> {
  const decks: DeckExport[] = [];
  const flashcards: FlashcardExport[] = [];
  const deckMap = new Map<string, string>();

  // Fetch decks
  const decksRef = collection(db, 'users', userId, 'flashcard_decks');
  const decksSnapshot = await getDocs(decksRef);

  decksSnapshot.forEach((doc) => {
    const data = doc.data();
    deckMap.set(doc.id, data.name);
    decks.push({
      id: doc.id,
      name: data.name,
      description: data.description,
      cardCount: data.cardCount || 0,
      masteredCount: data.masteredCount || 0,
      createdAt: timestampToString(data.createdAt),
    });
  });

  // Fetch all flashcards (stored at top level with deckId field)
  const cardsRef = collection(db, 'users', userId, 'flashcards');
  const cardsSnapshot = await getDocs(cardsRef);

  cardsSnapshot.forEach((doc) => {
    const data = doc.data();
    flashcards.push({
      id: doc.id,
      deckId: data.deckId,
      deckName: deckMap.get(data.deckId),
      front: data.front,
      back: data.back,
      difficulty: data.difficulty || 0,
      lastReviewed: timestampToString(data.lastReviewed),
      nextReview: timestampToString(data.nextReview),
    });
  });

  return { decks, flashcards };
}

async function fetchNotes(userId: string): Promise<NoteExport[]> {
  const notes: NoteExport[] = [];

  const notesRef = collection(db, 'users', userId, 'notes');
  const notesSnapshot = await getDocs(notesRef);

  notesSnapshot.forEach((doc) => {
    const data = doc.data();
    notes.push({
      id: doc.id,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      createdAt: timestampToString(data.createdAt),
      updatedAt: timestampToString(data.updatedAt),
    });
  });

  return notes;
}

async function fetchGoals(userId: string): Promise<GoalExport[]> {
  const goals: GoalExport[] = [];

  const goalsRef = collection(db, 'users', userId, 'goals');
  const goalsSnapshot = await getDocs(goalsRef);

  goalsSnapshot.forEach((doc) => {
    const data = doc.data();
    goals.push({
      id: doc.id,
      title: data.title,
      targetValue: data.targetValue,
      currentValue: data.currentValue || 0,
      unit: data.unit,
      period: data.period,
      category: data.category,
      isActive: data.isActive,
      createdAt: timestampToString(data.createdAt),
    });
  });

  return goals;
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

/**
 * Export user data based on options
 */
export async function exportUserData(userId: string, options: ExportOptions): Promise<ExportedData> {
  const exportedData: ExportedData = {
    exportedAt: new Date().toISOString(),
    userId,
    dataTypes: options.dataTypes,
    dateRange: options.dateRange
      ? {
          start: options.dateRange.start.toISOString(),
          end: options.dateRange.end.toISOString(),
        }
      : undefined,
    data: {},
  };

  // Fetch requested data types
  for (const dataType of options.dataTypes) {
    switch (dataType) {
      case 'journals': {
        const { journals, entries } = await fetchJournals(userId);
        exportedData.data.journals = journals;
        exportedData.data.journalEntries = entries;
        break;
      }
      case 'expenses': {
        const { expenses, categories } = await fetchExpenses(userId, options.dateRange);
        exportedData.data.expenses = expenses;
        exportedData.data.expenseCategories = categories;
        break;
      }
      case 'tasks': {
        exportedData.data.tasks = await fetchTasks(userId, options.dateRange);
        break;
      }
      case 'flashcards': {
        const { decks, flashcards } = await fetchFlashcards(userId);
        exportedData.data.flashcardDecks = decks;
        exportedData.data.flashcards = flashcards;
        break;
      }
      case 'notes': {
        exportedData.data.notes = await fetchNotes(userId);
        break;
      }
      case 'goals': {
        exportedData.data.goals = await fetchGoals(userId);
        break;
      }
    }
  }

  return exportedData;
}

// ============================================
// FORMAT CONVERTERS
// ============================================

/**
 * Convert data to JSON string
 */
export function toJSON(data: ExportedData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Convert data to CSV format (multiple files in a zip-like structure as text)
 */
export function toCSV(data: ExportedData): string {
  const csvSections: string[] = [];

  // Helper to convert array to CSV
  const arrayToCSV = (arr: Record<string, unknown>[], name: string): string => {
    if (arr.length === 0) return '';

    const headers = Object.keys(arr[0]);
    const rows = arr.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (value === null || value === undefined) return '';
          if (Array.isArray(value)) return `"${value.join(', ')}"`;
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        })
        .join(',')
    );

    return `=== ${name.toUpperCase()} ===\n${headers.join(',')}\n${rows.join('\n')}\n\n`;
  };

  // Add metadata
  csvSections.push(`=== EXPORT METADATA ===\nExported At,${data.exportedAt}\nData Types,"${data.dataTypes.join(', ')}"\n\n`);

  // Convert each data type
  if (data.data.journals?.length) {
    csvSections.push(arrayToCSV(data.data.journals, 'Journals'));
  }
  if (data.data.journalEntries?.length) {
    csvSections.push(arrayToCSV(data.data.journalEntries, 'Journal Entries'));
  }
  if (data.data.expenseCategories?.length) {
    csvSections.push(arrayToCSV(data.data.expenseCategories, 'Expense Categories'));
  }
  if (data.data.expenses?.length) {
    csvSections.push(arrayToCSV(data.data.expenses, 'Expenses'));
  }
  if (data.data.tasks?.length) {
    csvSections.push(arrayToCSV(data.data.tasks, 'Tasks'));
  }
  if (data.data.flashcardDecks?.length) {
    csvSections.push(arrayToCSV(data.data.flashcardDecks, 'Flashcard Decks'));
  }
  if (data.data.flashcards?.length) {
    csvSections.push(arrayToCSV(data.data.flashcards, 'Flashcards'));
  }
  if (data.data.notes?.length) {
    csvSections.push(arrayToCSV(data.data.notes, 'Notes'));
  }
  if (data.data.goals?.length) {
    csvSections.push(arrayToCSV(data.data.goals, 'Goals'));
  }

  return csvSections.join('');
}

/**
 * Convert data to Markdown format
 */
export function toMarkdown(data: ExportedData): string {
  const sections: string[] = [];

  // Header
  sections.push(`# LifeDash Data Export\n`);
  sections.push(`**Exported:** ${new Date(data.exportedAt).toLocaleString()}\n`);
  sections.push(`**Data Types:** ${data.dataTypes.join(', ')}\n`);
  if (data.dateRange) {
    sections.push(`**Date Range:** ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}\n`);
  }
  sections.push(`\n---\n`);

  // Journals
  if (data.data.journals?.length) {
    sections.push(`\n## Journals\n`);
    data.data.journals.forEach((journal) => {
      sections.push(`\n### ${journal.icon} ${journal.name}\n`);
      if (journal.description) sections.push(`${journal.description}\n`);
      sections.push(`*Created: ${new Date(journal.createdAt).toLocaleDateString()}*\n`);
    });
  }

  // Journal Entries
  if (data.data.journalEntries?.length) {
    sections.push(`\n## Journal Entries\n`);
    data.data.journalEntries.forEach((entry) => {
      sections.push(`\n### ${entry.title}\n`);
      sections.push(`*${entry.journalName} • ${new Date(entry.createdAt).toLocaleDateString()}*\n`);
      if (entry.mood) sections.push(`**Mood:** ${entry.mood}\n`);
      sections.push(`\n${entry.content}\n`);
      if (entry.tags.length) sections.push(`\n**Tags:** ${entry.tags.join(', ')}\n`);
      sections.push(`\n---\n`);
    });
  }

  // Expenses
  if (data.data.expenses?.length) {
    sections.push(`\n## Expenses\n`);
    sections.push(`\n| Date | Category | Description | Amount |\n`);
    sections.push(`|------|----------|-------------|--------|\n`);
    data.data.expenses.forEach((expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      sections.push(`| ${date} | ${expense.categoryName || 'N/A'} | ${expense.description} | ${expense.amountFormatted} |\n`);
    });
  }

  // Tasks
  if (data.data.tasks?.length) {
    sections.push(`\n## Tasks\n`);
    const completed = data.data.tasks.filter((t) => t.status === 'completed');
    const pending = data.data.tasks.filter((t) => t.status !== 'completed');

    if (pending.length) {
      sections.push(`\n### Pending Tasks\n`);
      pending.forEach((task) => {
        const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        sections.push(`- [ ] ${priority} **${task.title}**`);
        if (task.dueDate) sections.push(` (Due: ${new Date(task.dueDate).toLocaleDateString()})`);
        sections.push(`\n`);
      });
    }

    if (completed.length) {
      sections.push(`\n### Completed Tasks\n`);
      completed.forEach((task) => {
        sections.push(`- [x] **${task.title}**`);
        if (task.completedAt) sections.push(` (Completed: ${new Date(task.completedAt).toLocaleDateString()})`);
        sections.push(`\n`);
      });
    }
  }

  // Flashcards
  if (data.data.flashcardDecks?.length) {
    sections.push(`\n## Flashcard Decks\n`);
    data.data.flashcardDecks.forEach((deck) => {
      sections.push(`\n### ${deck.name}\n`);
      if (deck.description) sections.push(`${deck.description}\n`);
      sections.push(`**Cards:** ${deck.cardCount} | **Mastered:** ${deck.masteredCount}\n`);
    });
  }

  if (data.data.flashcards?.length) {
    sections.push(`\n## Flashcards\n`);
    data.data.flashcards.forEach((card) => {
      sections.push(`\n**Deck:** ${card.deckName}\n`);
      sections.push(`> **Q:** ${card.front}\n`);
      sections.push(`> **A:** ${card.back}\n\n`);
    });
  }

  // Notes
  if (data.data.notes?.length) {
    sections.push(`\n## Notes\n`);
    data.data.notes.forEach((note) => {
      sections.push(`\n### ${note.title}\n`);
      sections.push(`*${new Date(note.createdAt).toLocaleDateString()}*\n\n`);
      sections.push(`${note.content}\n`);
      if (note.tags.length) sections.push(`\n**Tags:** ${note.tags.join(', ')}\n`);
      sections.push(`\n---\n`);
    });
  }

  // Goals
  if (data.data.goals?.length) {
    sections.push(`\n## Goals\n`);
    data.data.goals.forEach((goal) => {
      const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
      sections.push(`\n### ${goal.title}\n`);
      sections.push(`**Progress:** ${goal.currentValue}/${goal.targetValue} ${goal.unit} (${progress}%)\n`);
      sections.push(`**Period:** ${goal.period} | **Category:** ${goal.category}\n`);
      sections.push(`**Status:** ${goal.isActive ? 'Active' : 'Inactive'}\n`);
    });
  }

  return sections.join('');
}

// ============================================
// DOWNLOAD HELPER
// ============================================

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download data
 */
export async function exportAndDownload(userId: string, options: ExportOptions): Promise<void> {
  const data = await exportUserData(userId, options);
  const timestamp = new Date().toISOString().split('T')[0];

  switch (options.format) {
    case 'json': {
      const content = toJSON(data);
      downloadFile(content, `lifedash-export-${timestamp}.json`, 'application/json');
      break;
    }
    case 'csv': {
      const content = toCSV(data);
      downloadFile(content, `lifedash-export-${timestamp}.csv`, 'text/csv');
      break;
    }
    case 'markdown': {
      const content = toMarkdown(data);
      downloadFile(content, `lifedash-export-${timestamp}.md`, 'text/markdown');
      break;
    }
  }
}

// ============================================
// BACKUP AND RESTORE
// ============================================

export interface RestoreResult {
  success: boolean;
  restored: {
    journals: number;
    journalEntries: number;
    expenses: number;
    expenseCategories: number;
    tasks: number;
    flashcardDecks: number;
    flashcards: number;
    notes: number;
    goals: number;
  };
  errors: string[];
}

/**
 * Create a full backup (export all data as JSON)
 */
export async function createBackup(userId: string): Promise<void> {
  const allDataTypes: DataType[] = ['journals', 'expenses', 'tasks', 'flashcards', 'notes', 'goals'];

  await exportAndDownload(userId, {
    dataTypes: allDataTypes,
    format: 'json',
    includeMetadata: true,
  });
}

/**
 * Parse and validate backup file
 */
export function parseBackupFile(content: string): ExportedData | null {
  try {
    const data = JSON.parse(content);

    // Validate basic structure
    if (!data.exportedAt || !data.data) {
      return null;
    }

    return data as ExportedData;
  } catch {
    return null;
  }
}

/**
 * Restore data from a backup file
 */
export async function restoreFromBackup(
  userId: string,
  backupData: ExportedData,
  options: {
    overwrite?: boolean;
    dataTypes?: DataType[];
  } = {}
): Promise<RestoreResult> {
  const result: RestoreResult = {
    success: false,
    restored: {
      journals: 0,
      journalEntries: 0,
      expenses: 0,
      expenseCategories: 0,
      tasks: 0,
      flashcardDecks: 0,
      flashcards: 0,
      notes: 0,
      goals: 0,
    },
    errors: [],
  };

  const dataTypesToRestore = options.dataTypes || backupData.dataTypes;

  try {
    // Restore Journals
    if (dataTypesToRestore.includes('journals') && backupData.data.journals) {
      for (const journal of backupData.data.journals) {
        try {
          const journalRef = doc(db, 'users', userId, 'journals', journal.id);
          await setDoc(journalRef, {
            name: journal.name,
            description: journal.description,
            color: journal.color,
            icon: journal.icon,
            createdAt: journal.createdAt ? Timestamp.fromDate(new Date(journal.createdAt)) : Timestamp.now(),
          }, { merge: !options.overwrite });
          result.restored.journals++;
        } catch (err) {
          result.errors.push(`Failed to restore journal: ${journal.name}`);
          console.error(err);
        }
      }

      // Restore Journal Entries (stored at top level)
      if (backupData.data.journalEntries) {
        for (const entry of backupData.data.journalEntries) {
          try {
            const entryRef = doc(db, 'users', userId, 'journal_entries', entry.id);
            await setDoc(entryRef, {
              journalId: entry.journalId,
              title: entry.title,
              content: entry.content,
              mood: entry.mood,
              tags: entry.tags,
              createdAt: entry.createdAt ? Timestamp.fromDate(new Date(entry.createdAt)) : Timestamp.now(),
              updatedAt: entry.updatedAt ? Timestamp.fromDate(new Date(entry.updatedAt)) : Timestamp.now(),
            }, { merge: !options.overwrite });
            result.restored.journalEntries++;
          } catch (err) {
            result.errors.push(`Failed to restore journal entry: ${entry.title}`);
            console.error(err);
          }
        }
      }
    }

    // Restore Expense Categories
    if (dataTypesToRestore.includes('expenses') && backupData.data.expenseCategories) {
      for (const category of backupData.data.expenseCategories) {
        try {
          const catRef = doc(db, 'users', userId, 'expense_categories', category.id);
          await setDoc(catRef, {
            name: category.name,
            icon: category.icon,
            color: category.color,
            budget: category.budget ? Math.round(category.budget * 100) : undefined,
          }, { merge: !options.overwrite });
          result.restored.expenseCategories++;
        } catch (err) {
          result.errors.push(`Failed to restore category: ${category.name}`);
          console.error(err);
        }
      }
    }

    // Restore Expenses
    if (dataTypesToRestore.includes('expenses') && backupData.data.expenses) {
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const expense of backupData.data.expenses) {
        try {
          const expenseRef = doc(db, 'users', userId, 'expenses', expense.id);
          batch.set(expenseRef, {
            categoryId: expense.categoryId,
            amount: Math.round(expense.amount * 100),
            currency: expense.currency,
            description: expense.description,
            notes: expense.notes,
            date: expense.date ? Timestamp.fromDate(new Date(expense.date)) : Timestamp.now(),
            paymentMethod: expense.paymentMethod,
            tags: expense.tags,
          }, { merge: !options.overwrite });
          batchCount++;
          result.restored.expenses++;

          // Commit batch every 400 operations (Firestore limit is 500)
          if (batchCount >= 400) {
            await batch.commit();
            batchCount = 0;
          }
        } catch (err) {
          result.errors.push(`Failed to restore expense: ${expense.description}`);
          console.error(err);
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    }

    // Restore Tasks
    if (dataTypesToRestore.includes('tasks') && backupData.data.tasks) {
      for (const task of backupData.data.tasks) {
        try {
          const taskRef = doc(db, 'users', userId, 'tasks', task.id);
          await setDoc(taskRef, {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : undefined,
            category: task.category,
            tags: task.tags,
            createdAt: task.createdAt ? Timestamp.fromDate(new Date(task.createdAt)) : Timestamp.now(),
            completedAt: task.completedAt ? Timestamp.fromDate(new Date(task.completedAt)) : undefined,
          }, { merge: !options.overwrite });
          result.restored.tasks++;
        } catch (err) {
          result.errors.push(`Failed to restore task: ${task.title}`);
          console.error(err);
        }
      }
    }

    // Restore Flashcard Decks
    if (dataTypesToRestore.includes('flashcards') && backupData.data.flashcardDecks) {
      for (const deck of backupData.data.flashcardDecks) {
        try {
          const deckRef = doc(db, 'users', userId, 'flashcard_decks', deck.id);
          await setDoc(deckRef, {
            name: deck.name,
            description: deck.description,
            cardCount: deck.cardCount,
            masteredCount: deck.masteredCount,
            createdAt: deck.createdAt ? Timestamp.fromDate(new Date(deck.createdAt)) : Timestamp.now(),
          }, { merge: !options.overwrite });
          result.restored.flashcardDecks++;
        } catch (err) {
          result.errors.push(`Failed to restore deck: ${deck.name}`);
          console.error(err);
        }
      }

      // Restore Flashcards (stored at top level)
      if (backupData.data.flashcards) {
        for (const card of backupData.data.flashcards) {
          try {
            const cardRef = doc(db, 'users', userId, 'flashcards', card.id);
            await setDoc(cardRef, {
              deckId: card.deckId,
              front: card.front,
              back: card.back,
              difficulty: card.difficulty,
              lastReviewed: card.lastReviewed ? Timestamp.fromDate(new Date(card.lastReviewed)) : undefined,
              nextReview: card.nextReview ? Timestamp.fromDate(new Date(card.nextReview)) : undefined,
            }, { merge: !options.overwrite });
            result.restored.flashcards++;
          } catch (err) {
            result.errors.push(`Failed to restore flashcard`);
            console.error(err);
          }
        }
      }
    }

    // Restore Notes
    if (dataTypesToRestore.includes('notes') && backupData.data.notes) {
      for (const note of backupData.data.notes) {
        try {
          const noteRef = doc(db, 'users', userId, 'notes', note.id);
          await setDoc(noteRef, {
            title: note.title,
            content: note.content,
            tags: note.tags,
            createdAt: note.createdAt ? Timestamp.fromDate(new Date(note.createdAt)) : Timestamp.now(),
            updatedAt: note.updatedAt ? Timestamp.fromDate(new Date(note.updatedAt)) : Timestamp.now(),
          }, { merge: !options.overwrite });
          result.restored.notes++;
        } catch (err) {
          result.errors.push(`Failed to restore note: ${note.title}`);
          console.error(err);
        }
      }
    }

    // Restore Goals
    if (dataTypesToRestore.includes('goals') && backupData.data.goals) {
      for (const goal of backupData.data.goals) {
        try {
          const goalRef = doc(db, 'users', userId, 'goals', goal.id);
          await setDoc(goalRef, {
            title: goal.title,
            targetValue: goal.targetValue,
            currentValue: goal.currentValue,
            unit: goal.unit,
            period: goal.period,
            category: goal.category,
            isActive: goal.isActive,
            createdAt: goal.createdAt ? Timestamp.fromDate(new Date(goal.createdAt)) : Timestamp.now(),
          }, { merge: !options.overwrite });
          result.restored.goals++;
        } catch (err) {
          result.errors.push(`Failed to restore goal: ${goal.title}`);
          console.error(err);
        }
      }
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.errors.push(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}
