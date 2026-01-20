/**
 * ANALYTICS SERVICE
 *
 * Calculates statistics and prepares data for dashboard charts.
 * This service aggregates data from all modules to show:
 * - Journal writing frequency
 * - Expense spending patterns
 * - Flashcard study progress
 * - Task completion rates
 */

import { getDocuments, where, orderBy } from './db-utils';
import { Journal, JournalEntry, Expense, Deck, Flashcard, Task } from '@/types';

// Collection names (must match the service files)
const JOURNALS_COLLECTION = 'journals';
const JOURNAL_ENTRIES_COLLECTION = 'journal_entries';
const EXPENSES_COLLECTION = 'expenses';
const DECKS_COLLECTION = 'flashcard_decks';
const FLASHCARDS_COLLECTION = 'flashcards';
const TASKS_COLLECTION = 'tasks';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Data point for charts - date and count/value
 */
export interface ChartDataPoint {
  date: string;      // Formatted date (e.g., "Jan 5", "Mon")
  value: number;     // Count or amount
  label?: string;    // Optional label for tooltips
}

/**
 * Journal analytics data
 */
export interface JournalAnalytics {
  totalJournals: number;
  totalEntries: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  currentStreak: number;      // Consecutive days with entries
  longestStreak: number;
  weeklyActivity: ChartDataPoint[];  // Last 7 days
  monthlyActivity: ChartDataPoint[]; // Last 30 days grouped by week
}

/**
 * Expense analytics data
 */
export interface ExpenseAnalytics {
  totalSpent: number;
  thisMonth: number;
  lastMonth: number;
  avgPerDay: number;
  topCategory: { name: string; amount: number } | null;
  dailySpending: ChartDataPoint[];   // Last 7 days
  categoryBreakdown: { name: string; value: number; color: string }[];
}

/**
 * Flashcard/Learning analytics data
 */
export interface LearningAnalytics {
  totalDecks: number;
  totalCards: number;
  cardsDue: number;
  cardsLearned: number;        // Cards reviewed at least once
  masteredCards: number;       // Cards with high confidence
  studyStreak: number;
  weeklyStudy: ChartDataPoint[];  // Cards studied per day
}

/**
 * Task analytics data
 */
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;      // Percentage
  tasksThisWeek: number;
  weeklyCompletion: ChartDataPoint[];  // Completed tasks per day
  priorityBreakdown: { name: string; value: number; color: string }[];
}

/**
 * Combined dashboard analytics
 */
export interface DashboardAnalytics {
  journal: JournalAnalytics;
  expense: ExpenseAnalytics;
  learning: LearningAnalytics;
  task: TaskAnalytics;
  lastUpdated: Date;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get date with time set to midnight for comparison
 */
const getDateOnly = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Get array of last N days as Date objects
 */
const getLastNDays = (n: number): Date[] => {
  const days: Date[] = [];
  const today = getDateOnly(new Date());

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  return days;
};

/**
 * Format date for chart display
 */
const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format date as day of week
 */
const formatDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Convert Firestore timestamp to Date
 */
const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  return new Date(timestamp);
};

// ============================================
// JOURNAL ANALYTICS
// ============================================

export const getJournalAnalytics = async (userId: string): Promise<JournalAnalytics> => {
  // Fetch data
  const journals = await getDocuments<Journal>(userId, JOURNALS_COLLECTION, []);
  const entries = await getDocuments<JournalEntry>(userId, JOURNAL_ENTRIES_COLLECTION, [
    orderBy('createdAt', 'desc')
  ]);

  const now = new Date();
  const today = getDateOnly(now);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  // Calculate basic stats
  const totalJournals = journals.length;
  const totalEntries = entries.length;

  const entriesThisWeek = entries.filter(e => {
    const date = toDate(e.createdAt);
    return date >= weekAgo;
  }).length;

  const entriesThisMonth = entries.filter(e => {
    const date = toDate(e.createdAt);
    return date >= monthAgo;
  }).length;

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Get unique dates with entries
  const entryDates = new Set(
    entries.map(e => getDateOnly(toDate(e.createdAt)).toISOString())
  );

  // Check consecutive days from today backwards
  let checkDate = new Date(today);
  while (entryDates.has(checkDate.toISOString())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak (simplified - just check last 90 days)
  const last90Days = getLastNDays(90);
  for (const day of last90Days) {
    if (entryDates.has(day.toISOString())) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Weekly activity (last 7 days)
  const last7Days = getLastNDays(7);
  const weeklyActivity: ChartDataPoint[] = last7Days.map(day => {
    const dayStr = day.toISOString();
    const count = entries.filter(e =>
      getDateOnly(toDate(e.createdAt)).toISOString() === dayStr
    ).length;

    return {
      date: formatDayOfWeek(day),
      value: count,
      label: formatDateShort(day),
    };
  });

  // Monthly activity (last 4 weeks)
  const monthlyActivity: ChartDataPoint[] = [];
  for (let week = 3; week >= 0; week--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (week * 7) - 6);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - (week * 7));

    const count = entries.filter(e => {
      const date = getDateOnly(toDate(e.createdAt));
      return date >= weekStart && date <= weekEnd;
    }).length;

    monthlyActivity.push({
      date: `Week ${4 - week}`,
      value: count,
      label: `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`,
    });
  }

  return {
    totalJournals,
    totalEntries,
    entriesThisWeek,
    entriesThisMonth,
    currentStreak,
    longestStreak,
    weeklyActivity,
    monthlyActivity,
  };
};

// ============================================
// EXPENSE ANALYTICS
// ============================================

export const getExpenseAnalytics = async (userId: string): Promise<ExpenseAnalytics> => {
  const expenses = await getDocuments<Expense>(userId, EXPENSES_COLLECTION, [
    orderBy('date', 'desc')
  ]);

  const now = new Date();
  const today = getDateOnly(now);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Calculate totals
  let totalSpent = 0;
  let thisMonth = 0;
  let lastMonth = 0;
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(expense => {
    const date = toDate(expense.date);
    const amount = expense.amount;

    totalSpent += amount;

    if (date >= thisMonthStart) {
      thisMonth += amount;
    }

    if (date >= lastMonthStart && date <= lastMonthEnd) {
      lastMonth += amount;
    }

    // Track by category
    const cat = expense.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
  });

  // Average per day this month
  const daysInMonth = now.getDate();
  const avgPerDay = daysInMonth > 0 ? thisMonth / daysInMonth : 0;

  // Top category
  let topCategory: { name: string; amount: number } | null = null;
  let maxAmount = 0;
  Object.entries(categoryTotals).forEach(([name, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCategory = { name, amount };
    }
  });

  // Daily spending (last 7 days)
  const last7Days = getLastNDays(7);
  const dailySpending: ChartDataPoint[] = last7Days.map(day => {
    const dayStart = day;
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const total = expenses.reduce((sum, e) => {
      const date = toDate(e.date);
      if (date >= dayStart && date < dayEnd) {
        return sum + e.amount;
      }
      return sum;
    }, 0);

    return {
      date: formatDayOfWeek(day),
      value: total,
      label: formatDateShort(day),
    };
  });

  // Category breakdown with colors
  const categoryColors: Record<string, string> = {
    'Food & Dining': '#ef4444',
    'Transportation': '#3b82f6',
    'Shopping': '#a855f7',
    'Entertainment': '#ec4899',
    'Bills & Utilities': '#f59e0b',
    'Healthcare': '#22c55e',
    'Education': '#14b8a6',
    'Other': '#78716c',
  };

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#78716c',
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories

  return {
    totalSpent,
    thisMonth,
    lastMonth,
    avgPerDay,
    topCategory,
    dailySpending,
    categoryBreakdown,
  };
};

// ============================================
// LEARNING/FLASHCARD ANALYTICS
// ============================================

export const getLearningAnalytics = async (userId: string): Promise<LearningAnalytics> => {
  const decks = await getDocuments<Deck>(userId, DECKS_COLLECTION, []);
  const cards = await getDocuments<Flashcard>(userId, FLASHCARDS_COLLECTION, []);

  // Calculate stats from decks
  const totalDecks = decks.length;
  const totalCards = decks.reduce((sum, d) => sum + (d.cardCount || 0), 0);
  const cardsDue = decks.reduce((sum, d) => sum + (d.cardsDue || 0), 0);
  const masteredCards = decks.reduce((sum, d) => sum + (d.masteredCount || 0), 0);

  // Cards that have been reviewed at least once
  const cardsLearned = cards.filter(c => (c.reviewCount || 0) > 0).length;

  // Study streak (simplified - check if studied in last 7 days)
  const now = new Date();
  const today = getDateOnly(now);
  let studyStreak = 0;

  // Check consecutive days with reviews
  const reviewDates = new Set(
    cards
      .filter(c => c.lastReviewedAt)
      .map(c => getDateOnly(toDate(c.lastReviewedAt)).toISOString())
  );

  let checkDate = new Date(today);
  while (reviewDates.has(checkDate.toISOString())) {
    studyStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Weekly study activity (cards reviewed per day)
  const last7Days = getLastNDays(7);
  const weeklyStudy: ChartDataPoint[] = last7Days.map(day => {
    const dayStr = day.toISOString();
    const count = cards.filter(c => {
      if (!c.lastReviewedAt) return false;
      return getDateOnly(toDate(c.lastReviewedAt)).toISOString() === dayStr;
    }).length;

    return {
      date: formatDayOfWeek(day),
      value: count,
      label: formatDateShort(day),
    };
  });

  return {
    totalDecks,
    totalCards,
    cardsDue,
    cardsLearned,
    masteredCards,
    studyStreak,
    weeklyStudy,
  };
};

// ============================================
// TASK ANALYTICS
// ============================================

export const getTaskAnalytics = async (userId: string): Promise<TaskAnalytics> => {
  const tasks = await getDocuments<Task>(userId, TASKS_COLLECTION, []);

  const now = new Date();
  const today = getDateOnly(now);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Basic counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  // Overdue tasks
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.dueDate) return false;
    return toDate(t.dueDate) < today;
  }).length;

  // Completion rate
  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Tasks completed this week
  const tasksThisWeek = tasks.filter(t => {
    if (t.status !== 'completed') return false;
    const completedAt = t.completedAt ? toDate(t.completedAt) : null;
    return completedAt && completedAt >= weekAgo;
  }).length;

  // Weekly completion (tasks completed per day)
  const last7Days = getLastNDays(7);
  const weeklyCompletion: ChartDataPoint[] = last7Days.map(day => {
    const dayStart = day;
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = tasks.filter(t => {
      if (t.status !== 'completed') return false;
      const completedAt = t.completedAt ? toDate(t.completedAt) : null;
      return completedAt && completedAt >= dayStart && completedAt < dayEnd;
    }).length;

    return {
      date: formatDayOfWeek(day),
      value: count,
      label: formatDateShort(day),
    };
  });

  // Priority breakdown
  const priorityCounts: Record<string, number> = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  tasks.filter(t => t.status !== 'completed').forEach(t => {
    const priority = t.priority || 'medium';
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
  });

  const priorityColors: Record<string, string> = {
    urgent: '#dc2626',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#6b7280',
  };

  const priorityBreakdown = Object.entries(priorityCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: priorityColors[name],
    }));

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    tasksThisWeek,
    weeklyCompletion,
    priorityBreakdown,
  };
};

// ============================================
// COMBINED ANALYTICS
// ============================================

/**
 * Get all analytics for the dashboard
 * Call this once and pass data to all widgets
 */
export const getDashboardAnalytics = async (userId: string): Promise<DashboardAnalytics> => {
  const [journal, expense, learning, task] = await Promise.all([
    getJournalAnalytics(userId),
    getExpenseAnalytics(userId),
    getLearningAnalytics(userId),
    getTaskAnalytics(userId),
  ]);

  return {
    journal,
    expense,
    learning,
    task,
    lastUpdated: new Date(),
  };
};
