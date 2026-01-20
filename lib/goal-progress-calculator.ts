/**
 * GOAL PROGRESS CALCULATOR
 *
 * Calculates current values for goals based on analytics data.
 * Connects goals to actual user activity in journals, flashcards, expenses, and tasks.
 */

import {
  Goal,
  GoalMetric,
  GoalPeriod,
  GoalSuggestion,
  GoalCategory,
} from '@/types/goal';
import {
  getJournalAnalytics,
  getExpenseAnalytics,
  getLearningAnalytics,
  getTaskAnalytics,
  JournalAnalytics,
  ExpenseAnalytics,
  LearningAnalytics,
  TaskAnalytics,
} from './analytics-service';
import { getDocuments, where } from './db-utils';
import { JournalEntry, Expense, Flashcard, Task } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Collection names
const JOURNAL_ENTRIES_COLLECTION = 'journal_entries';
const EXPENSES_COLLECTION = 'expenses';
const FLASHCARDS_COLLECTION = 'flashcards';
const TASKS_COLLECTION = 'tasks';

// ============================================
// PERIOD HELPERS
// ============================================

/**
 * Get the start of the current period
 */
const getPeriodStart = (period: GoalPeriod): Date => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'daily':
      return today;
    case 'weekly':
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek);
      return weekStart;
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};

/**
 * Convert timestamp to Date
 */
const toDate = (timestamp: Date | Timestamp | undefined): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof (timestamp as Timestamp).toDate === 'function') {
    return (timestamp as Timestamp).toDate();
  }
  return new Date(timestamp as unknown as string);
};

/**
 * Check if date is in period
 */
const isInPeriod = (date: Date | null, periodStart: Date): boolean => {
  if (!date) return false;
  return date >= periodStart;
};

// ============================================
// METRIC CALCULATORS
// ============================================

/**
 * Calculate journal entries for period
 */
const calculateJournalEntries = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const entries = await getDocuments<JournalEntry>(userId, JOURNAL_ENTRIES_COLLECTION, []);

  return entries.filter(entry => {
    const date = toDate(entry.createdAt);
    return isInPeriod(date, periodStart);
  }).length;
};

/**
 * Calculate words written for period
 */
const calculateWordsWritten = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const entries = await getDocuments<JournalEntry>(userId, JOURNAL_ENTRIES_COLLECTION, []);

  return entries
    .filter(entry => {
      const date = toDate(entry.createdAt);
      return isInPeriod(date, periodStart);
    })
    .reduce((total, entry) => {
      const wordCount = entry.content?.split(/\s+/).filter(w => w.length > 0).length || 0;
      return total + wordCount;
    }, 0);
};

/**
 * Calculate cards reviewed for period
 */
const calculateCardsReviewed = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const cards = await getDocuments<Flashcard>(userId, FLASHCARDS_COLLECTION, []);

  return cards.filter(card => {
    const reviewDate = toDate(card.lastReviewedAt);
    return isInPeriod(reviewDate, periodStart);
  }).length;
};

/**
 * Calculate cards mastered for period
 */
const calculateCardsMastered = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const cards = await getDocuments<Flashcard>(userId, FLASHCARDS_COLLECTION, []);

  // Mastered = confidence level 5 (or highest)
  return cards.filter(card => {
    const reviewDate = toDate(card.lastReviewedAt);
    return isInPeriod(reviewDate, periodStart) && (card.confidence || 0) >= 5;
  }).length;
};

/**
 * Calculate study streak (days in a row with study activity)
 */
const calculateStudyStreak = async (userId: string): Promise<number> => {
  const cards = await getDocuments<Flashcard>(userId, FLASHCARDS_COLLECTION, []);

  // Get unique dates with reviews
  const reviewDates = new Set<string>();
  cards.forEach(card => {
    const date = toDate(card.lastReviewedAt);
    if (date) {
      reviewDates.add(date.toISOString().split('T')[0]);
    }
  });

  // Count consecutive days from today backwards
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);
  while (reviewDates.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

/**
 * Calculate expenses for period (budget tracking)
 */
const calculateExpenses = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const expenses = await getDocuments<Expense>(userId, EXPENSES_COLLECTION, []);

  return expenses
    .filter(expense => {
      const date = toDate(expense.date);
      return isInPeriod(date, periodStart);
    })
    .reduce((total, expense) => total + (expense.amount || 0), 0);
};

/**
 * Calculate tasks completed for period
 */
const calculateTasksCompleted = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const tasks = await getDocuments<Task>(userId, TASKS_COLLECTION, []);

  return tasks.filter(task => {
    if (task.status !== 'completed') return false;
    const completedDate = toDate(task.completedAt);
    return isInPeriod(completedDate, periodStart);
  }).length;
};

/**
 * Calculate task completion rate for period
 */
const calculateCompletionRate = async (
  userId: string,
  period: GoalPeriod
): Promise<number> => {
  const periodStart = getPeriodStart(period);
  const tasks = await getDocuments<Task>(userId, TASKS_COLLECTION, []);

  // Filter tasks created or due in this period
  const periodTasks = tasks.filter(task => {
    const createdDate = toDate(task.createdAt);
    const dueDate = toDate(task.dueDate);
    return isInPeriod(createdDate, periodStart) || isInPeriod(dueDate, periodStart);
  });

  if (periodTasks.length === 0) return 100; // No tasks = 100%

  const completed = periodTasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / periodTasks.length) * 100);
};

// ============================================
// MAIN CALCULATOR
// ============================================

/**
 * Calculate current value for a goal based on its metric
 */
export const calculateGoalCurrentValue = async (
  userId: string,
  goal: Goal
): Promise<number> => {
  const { metric, period } = goal;

  switch (metric) {
    case 'entries':
      return calculateJournalEntries(userId, period);
    case 'words':
      return calculateWordsWritten(userId, period);
    case 'cards_reviewed':
      return calculateCardsReviewed(userId, period);
    case 'cards_mastered':
      return calculateCardsMastered(userId, period);
    case 'study_streak':
      return calculateStudyStreak(userId);
    case 'budget_limit':
    case 'savings_target':
      return calculateExpenses(userId, period);
    case 'tasks_completed':
      return calculateTasksCompleted(userId, period);
    case 'completion_rate':
      return calculateCompletionRate(userId, period);
    default:
      return 0;
  }
};

/**
 * Calculate current values for all goals
 */
export const calculateAllGoalProgress = async (
  userId: string,
  goals: Goal[]
): Promise<Map<string, number>> => {
  const progressMap = new Map<string, number>();

  await Promise.all(
    goals.map(async goal => {
      const value = await calculateGoalCurrentValue(userId, goal);
      progressMap.set(goal.id, value);
    })
  );

  return progressMap;
};

// ============================================
// GOAL SUGGESTIONS
// ============================================

/**
 * Generate goal suggestions based on user activity
 */
export const generateGoalSuggestions = async (
  userId: string
): Promise<GoalSuggestion[]> => {
  const suggestions: GoalSuggestion[] = [];

  try {
    // Fetch analytics
    const [journalAnalytics, expenseAnalytics, learningAnalytics, taskAnalytics] =
      await Promise.all([
        getJournalAnalytics(userId).catch(() => null),
        getExpenseAnalytics(userId).catch(() => null),
        getLearningAnalytics(userId).catch(() => null),
        getTaskAnalytics(userId).catch(() => null),
      ]);

    // Journal suggestions
    if (journalAnalytics) {
      const avgEntriesPerWeek = journalAnalytics.entriesThisWeek || 0;
      if (avgEntriesPerWeek < 3) {
        suggestions.push({
          category: 'journal',
          metric: 'entries',
          period: 'weekly',
          suggestedTarget: 3,
          reason: 'Build a consistent journaling habit',
          title: 'Write 3 journal entries per week',
        });
      } else if (avgEntriesPerWeek >= 3) {
        suggestions.push({
          category: 'journal',
          metric: 'entries',
          period: 'daily',
          suggestedTarget: 1,
          reason: 'You\'re doing great! Try daily journaling',
          title: 'Write daily journal entry',
        });
      }
    }

    // Flashcard suggestions
    if (learningAnalytics) {
      if (learningAnalytics.totalCards > 0 && learningAnalytics.cardsDue > 5) {
        suggestions.push({
          category: 'flashcard',
          metric: 'cards_reviewed',
          period: 'daily',
          suggestedTarget: Math.min(20, learningAnalytics.cardsDue),
          reason: 'Keep up with your due cards',
          title: `Review ${Math.min(20, learningAnalytics.cardsDue)} cards daily`,
        });
      }
      if (learningAnalytics.studyStreak < 7) {
        suggestions.push({
          category: 'flashcard',
          metric: 'study_streak',
          period: 'daily',
          suggestedTarget: 7,
          reason: 'Build a study streak',
          title: 'Maintain 7-day study streak',
        });
      }
    }

    // Expense suggestions
    if (expenseAnalytics) {
      if (expenseAnalytics.thisMonth > 0) {
        const suggestedBudget = Math.ceil(expenseAnalytics.thisMonth * 0.9 / 100) * 100;
        suggestions.push({
          category: 'expense',
          metric: 'budget_limit',
          period: 'monthly',
          suggestedTarget: suggestedBudget,
          reason: 'Set a budget based on your spending',
          title: `Stay under $${suggestedBudget}/month`,
        });
      }
    }

    // Task suggestions
    if (taskAnalytics) {
      if (taskAnalytics.pendingTasks > 0) {
        const dailyTarget = Math.max(2, Math.ceil(taskAnalytics.pendingTasks / 7));
        suggestions.push({
          category: 'task',
          metric: 'tasks_completed',
          period: 'daily',
          suggestedTarget: dailyTarget,
          reason: 'Clear your task backlog',
          title: `Complete ${dailyTarget} tasks daily`,
        });
      }
      if (taskAnalytics.completionRate < 80) {
        suggestions.push({
          category: 'task',
          metric: 'completion_rate',
          period: 'weekly',
          suggestedTarget: 80,
          reason: 'Improve your completion rate',
          title: 'Achieve 80% completion rate',
        });
      }
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
  }

  return suggestions;
};

/**
 * Get motivational message based on progress
 */
export const getMotivationalMessage = (
  progress: number,
  isUpperLimit: boolean = false
): { message: string; emoji: string } => {
  if (isUpperLimit) {
    // Budget goal - staying under is good
    if (progress <= 50) {
      return { message: 'Excellent budget control!', emoji: '🌟' };
    } else if (progress <= 75) {
      return { message: 'Good pace, keep it up!', emoji: '👍' };
    } else if (progress <= 90) {
      return { message: 'Getting close to your limit', emoji: '⚠️' };
    } else if (progress <= 100) {
      return { message: 'Almost at your limit!', emoji: '🔔' };
    } else {
      return { message: 'Over budget - time to cut back', emoji: '🚨' };
    }
  }

  // Regular goal - higher is better
  if (progress >= 100) {
    return { message: 'Goal achieved!', emoji: '🎉' };
  } else if (progress >= 75) {
    return { message: 'Almost there!', emoji: '🔥' };
  } else if (progress >= 50) {
    return { message: 'Halfway there!', emoji: '💪' };
  } else if (progress >= 25) {
    return { message: 'Good progress!', emoji: '👍' };
  } else if (progress > 0) {
    return { message: 'Just getting started!', emoji: '🚀' };
  } else {
    return { message: 'Time to get started!', emoji: '⏰' };
  }
};
