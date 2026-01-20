/**
 * GOAL TYPES
 *
 * Types for the goal tracking and progress monitoring system.
 * Goals can be set for different activity types with various time periods.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Types of activities users can set goals for
 */
export type GoalCategory = 'journal' | 'flashcard' | 'expense' | 'task';

/**
 * Time period for goal tracking
 */
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Specific metric types for each category
 */
export type JournalGoalMetric = 'entries' | 'words';
export type FlashcardGoalMetric = 'cards_reviewed' | 'cards_mastered' | 'study_streak';
export type ExpenseGoalMetric = 'budget_limit' | 'savings_target';
export type TaskGoalMetric = 'tasks_completed' | 'completion_rate';

export type GoalMetric =
  | JournalGoalMetric
  | FlashcardGoalMetric
  | ExpenseGoalMetric
  | TaskGoalMetric;

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';

/**
 * Main Goal interface
 */
export interface Goal {
  id: string;
  userId: string;

  // Goal details
  title: string;
  description?: string;
  category: GoalCategory;
  metric: GoalMetric;
  period: GoalPeriod;

  // Target and progress
  targetValue: number;
  currentValue: number;

  // For expense budgets (target is maximum, not minimum)
  isUpperLimit?: boolean;

  // Status
  status: GoalStatus;

  // Time tracking
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;

  // Period tracking (current period start)
  periodStart: Date | Timestamp;

  // Streak tracking
  currentStreak: number;
  longestStreak: number;

  // Achievement history
  completedPeriods: number;
  totalPeriods: number;

  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;

  // Color for UI display
  color?: string;
}

/**
 * Goal creation input
 */
export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  metric: GoalMetric;
  period: GoalPeriod;
  targetValue: number;
  isUpperLimit?: boolean;
  startDate?: Date;
  color?: string;
}

/**
 * Goal update input
 */
export interface UpdateGoalInput {
  title?: string;
  description?: string;
  targetValue?: number;
  status?: GoalStatus;
  color?: string;
}

/**
 * Goal progress snapshot (for history)
 */
export interface GoalProgress {
  id: string;
  goalId: string;
  periodStart: Date | Timestamp;
  periodEnd: Date | Timestamp;
  targetValue: number;
  achievedValue: number;
  completed: boolean;
  createdAt: Date | Timestamp;
}

/**
 * Achievement notification
 */
export interface Achievement {
  id: string;
  userId: string;
  goalId: string;
  type: 'goal_completed' | 'streak_milestone' | 'personal_best' | 'first_goal';
  title: string;
  message: string;
  seen: boolean;
  createdAt: Date | Timestamp;
}

/**
 * Goal suggestion based on user activity
 */
export interface GoalSuggestion {
  category: GoalCategory;
  metric: GoalMetric;
  period: GoalPeriod;
  suggestedTarget: number;
  reason: string;
  title: string;
}

/**
 * Helper: Get display info for goal category
 */
export const getCategoryInfo = (category: GoalCategory): { label: string; color: string; icon: string } => {
  switch (category) {
    case 'journal':
      return { label: 'Journals', color: '#3b82f6', icon: '📝' };
    case 'flashcard':
      return { label: 'Flashcards', color: '#a855f7', icon: '🧠' };
    case 'expense':
      return { label: 'Expenses', color: '#22c55e', icon: '💰' };
    case 'task':
      return { label: 'Tasks', color: '#f59e0b', icon: '✅' };
  }
};

/**
 * Helper: Get metric display label
 */
export const getMetricLabel = (metric: GoalMetric): string => {
  const labels: Record<GoalMetric, string> = {
    entries: 'Journal Entries',
    words: 'Words Written',
    cards_reviewed: 'Cards Reviewed',
    cards_mastered: 'Cards Mastered',
    study_streak: 'Study Streak Days',
    budget_limit: 'Budget Limit',
    savings_target: 'Savings Target',
    tasks_completed: 'Tasks Completed',
    completion_rate: 'Completion Rate %',
  };
  return labels[metric] || metric;
};

/**
 * Helper: Get period display label
 */
export const getPeriodLabel = (period: GoalPeriod): string => {
  switch (period) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
  }
};

/**
 * Helper: Get metrics available for a category
 */
export const getMetricsForCategory = (category: GoalCategory): GoalMetric[] => {
  switch (category) {
    case 'journal':
      return ['entries', 'words'];
    case 'flashcard':
      return ['cards_reviewed', 'cards_mastered', 'study_streak'];
    case 'expense':
      return ['budget_limit', 'savings_target'];
    case 'task':
      return ['tasks_completed', 'completion_rate'];
  }
};

/**
 * Helper: Get default target for a metric
 */
export const getDefaultTarget = (metric: GoalMetric, period: GoalPeriod): number => {
  const dailyDefaults: Record<GoalMetric, number> = {
    entries: 1,
    words: 500,
    cards_reviewed: 20,
    cards_mastered: 5,
    study_streak: 7,
    budget_limit: 50,
    savings_target: 10,
    tasks_completed: 3,
    completion_rate: 80,
  };

  const multipliers: Record<GoalPeriod, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  };

  // Some metrics don't scale with period
  const nonScaling: GoalMetric[] = ['study_streak', 'completion_rate'];

  if (nonScaling.includes(metric)) {
    return dailyDefaults[metric];
  }

  return dailyDefaults[metric] * multipliers[period];
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current: number, target: number, isUpperLimit?: boolean): number => {
  if (target === 0) return 0;

  if (isUpperLimit) {
    // For budget limits, staying under is good
    // 100% means at limit, >100% means over budget
    return Math.round((current / target) * 100);
  }

  // For regular goals, progress towards target
  return Math.min(100, Math.round((current / target) * 100));
};

/**
 * Check if goal is completed for current period
 */
export const isGoalCompleted = (goal: Goal): boolean => {
  if (goal.isUpperLimit) {
    // For budget limits, completed means staying under
    return goal.currentValue <= goal.targetValue;
  }
  return goal.currentValue >= goal.targetValue;
};
