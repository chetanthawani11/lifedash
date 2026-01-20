/**
 * GOAL SERVICE
 *
 * Firebase CRUD operations for goal tracking.
 * Handles creating, reading, updating, and deleting goals.
 * Also manages achievements and progress history.
 */

import {
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  where,
  orderBy,
} from './db-utils';
import {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalProgress,
  Achievement,
  GoalStatus,
  GoalPeriod,
  isGoalCompleted,
} from '@/types/goal';
import { Timestamp, Unsubscribe } from 'firebase/firestore';

// Collection names
const GOALS_COLLECTION = 'goals';
const GOAL_PROGRESS_COLLECTION = 'goal_progress';
const ACHIEVEMENTS_COLLECTION = 'achievements';

// ============================================
// HELPER FUNCTIONS
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
 * Get the end of the current period
 */
const getPeriodEnd = (period: GoalPeriod): Date => {
  const now = new Date();

  switch (period) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    case 'weekly':
      const dayOfWeek = now.getDay();
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekEnd.setDate(weekEnd.getDate() + (6 - dayOfWeek));
      weekEnd.setHours(23, 59, 59, 999);
      return weekEnd;
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
};

/**
 * Check if a date is in the current period
 */
const isInCurrentPeriod = (date: Date | Timestamp, period: GoalPeriod): boolean => {
  const checkDate = date instanceof Timestamp ? date.toDate() : date;
  const periodStart = getPeriodStart(period);
  const periodEnd = getPeriodEnd(period);

  return checkDate >= periodStart && checkDate <= periodEnd;
};

// ============================================
// GOAL CRUD OPERATIONS
// ============================================

/**
 * Create a new goal
 */
export const createGoal = async (
  userId: string,
  input: CreateGoalInput
): Promise<Goal> => {
  const now = new Date();
  const periodStart = getPeriodStart(input.period);

  const goalData = {
    userId,
    title: input.title,
    description: input.description || '',
    category: input.category,
    metric: input.metric,
    period: input.period,
    targetValue: input.targetValue,
    currentValue: 0,
    isUpperLimit: input.isUpperLimit || false,
    status: 'active' as GoalStatus,
    startDate: input.startDate || now,
    periodStart,
    currentStreak: 0,
    longestStreak: 0,
    completedPeriods: 0,
    totalPeriods: 0,
    createdAt: now,
    updatedAt: now,
    color: input.color || getCategoryColor(input.category),
  };

  const id = await createDocument(userId, GOALS_COLLECTION, goalData);

  // Create first goal achievement if this is user's first goal
  const existingGoals = await getDocuments<Goal>(userId, GOALS_COLLECTION, []);
  if (existingGoals.length === 1) {
    await createAchievement(userId, id, 'first_goal', 'First Goal Set!', 'You set your first goal. Great start!');
  }

  return { id, ...goalData };
};

/**
 * Get a goal by ID
 */
export const getGoal = async (userId: string, goalId: string): Promise<Goal | null> => {
  return getDocument<Goal>(userId, GOALS_COLLECTION, goalId);
};

/**
 * Get all active goals for a user
 */
export const getActiveGoals = async (userId: string): Promise<Goal[]> => {
  return getDocuments<Goal>(userId, GOALS_COLLECTION, [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  ]);
};

/**
 * Get all goals for a user (including completed/paused)
 */
export const getAllGoals = async (userId: string): Promise<Goal[]> => {
  return getDocuments<Goal>(userId, GOALS_COLLECTION, [
    orderBy('createdAt', 'desc'),
  ]);
};

/**
 * Subscribe to active goals (real-time updates)
 */
export const subscribeToGoals = (
  userId: string,
  onData: (goals: Goal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return subscribeToCollection<Goal>(
    userId,
    GOALS_COLLECTION,
    [where('status', '==', 'active'), orderBy('createdAt', 'desc')],
    onData,
    onError
  );
};

/**
 * Update a goal
 */
export const updateGoal = async (
  userId: string,
  goalId: string,
  input: UpdateGoalInput
): Promise<void> => {
  await updateDocument(userId, GOALS_COLLECTION, goalId, {
    ...input,
    updatedAt: new Date(),
  });
};

/**
 * Update goal progress
 */
export const updateGoalProgress = async (
  userId: string,
  goalId: string,
  currentValue: number
): Promise<{ completed: boolean; isNewCompletion: boolean }> => {
  const goal = await getGoal(userId, goalId);
  if (!goal) throw new Error('Goal not found');

  const wasCompleted = isGoalCompleted(goal);
  const updatedGoal = { ...goal, currentValue };
  const isNowCompleted = isGoalCompleted(updatedGoal);
  const isNewCompletion = !wasCompleted && isNowCompleted;

  await updateDocument(userId, GOALS_COLLECTION, goalId, {
    currentValue,
    updatedAt: new Date(),
  });

  // If newly completed, create achievement
  if (isNewCompletion) {
    await handleGoalCompletion(userId, goal);
  }

  return { completed: isNowCompleted, isNewCompletion };
};

/**
 * Delete a goal
 */
export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  await deleteDocument(userId, GOALS_COLLECTION, goalId);
};

/**
 * Pause a goal
 */
export const pauseGoal = async (userId: string, goalId: string): Promise<void> => {
  await updateDocument(userId, GOALS_COLLECTION, goalId, {
    status: 'paused' as GoalStatus,
    updatedAt: new Date(),
  });
};

/**
 * Resume a paused goal
 */
export const resumeGoal = async (userId: string, goalId: string): Promise<void> => {
  await updateDocument(userId, GOALS_COLLECTION, goalId, {
    status: 'active' as GoalStatus,
    periodStart: getPeriodStart((await getGoal(userId, goalId))?.period || 'daily'),
    currentValue: 0,
    updatedAt: new Date(),
  });
};

// ============================================
// PERIOD RESET (Call this periodically)
// ============================================

/**
 * Reset goals for new period (should be called at period boundaries)
 */
export const resetGoalsForNewPeriod = async (userId: string): Promise<void> => {
  const goals = await getActiveGoals(userId);

  for (const goal of goals) {
    const periodStart = getPeriodStart(goal.period);

    // Check if we're in a new period
    const goalPeriodStart = goal.periodStart instanceof Timestamp
      ? goal.periodStart.toDate()
      : goal.periodStart;

    if (periodStart > goalPeriodStart) {
      // Save progress history
      await saveProgressHistory(userId, goal, goalPeriodStart, new Date(periodStart.getTime() - 1));

      // Check if goal was completed
      const wasCompleted = isGoalCompleted(goal);

      // Update streak
      let newStreak = wasCompleted ? goal.currentStreak + 1 : 0;
      let longestStreak = Math.max(goal.longestStreak, newStreak);

      // Reset for new period
      await updateDocument(userId, GOALS_COLLECTION, goal.id, {
        currentValue: 0,
        periodStart,
        currentStreak: newStreak,
        longestStreak,
        completedPeriods: goal.completedPeriods + (wasCompleted ? 1 : 0),
        totalPeriods: goal.totalPeriods + 1,
        updatedAt: new Date(),
      });

      // Check for streak milestones
      if (newStreak > 0 && newStreak % 7 === 0) {
        await createAchievement(
          userId,
          goal.id,
          'streak_milestone',
          `${newStreak} ${goal.period === 'daily' ? 'Day' : goal.period === 'weekly' ? 'Week' : 'Month'} Streak!`,
          `You've completed "${goal.title}" for ${newStreak} ${goal.period === 'daily' ? 'days' : goal.period === 'weekly' ? 'weeks' : 'months'} in a row!`
        );
      }
    }
  }
};

// ============================================
// PROGRESS HISTORY
// ============================================

/**
 * Save progress history entry
 */
const saveProgressHistory = async (
  userId: string,
  goal: Goal,
  periodStart: Date,
  periodEnd: Date
): Promise<void> => {
  const progressData: Omit<GoalProgress, 'id'> = {
    goalId: goal.id,
    periodStart,
    periodEnd,
    targetValue: goal.targetValue,
    achievedValue: goal.currentValue,
    completed: isGoalCompleted(goal),
    createdAt: new Date(),
  };

  await createDocument(userId, GOAL_PROGRESS_COLLECTION, progressData);
};

/**
 * Get progress history for a goal
 */
export const getGoalProgressHistory = async (
  userId: string,
  goalId: string,
  limit: number = 30
): Promise<GoalProgress[]> => {
  return getDocuments<GoalProgress>(userId, GOAL_PROGRESS_COLLECTION, [
    where('goalId', '==', goalId),
    orderBy('periodStart', 'desc'),
  ]).then(results => results.slice(0, limit));
};

// ============================================
// ACHIEVEMENTS
// ============================================

/**
 * Create an achievement
 */
const createAchievement = async (
  userId: string,
  goalId: string,
  type: Achievement['type'],
  title: string,
  message: string
): Promise<void> => {
  const achievementData: Omit<Achievement, 'id'> = {
    userId,
    goalId,
    type,
    title,
    message,
    seen: false,
    createdAt: new Date(),
  };

  await createDocument(userId, ACHIEVEMENTS_COLLECTION, achievementData);
};

/**
 * Handle goal completion
 */
const handleGoalCompletion = async (userId: string, goal: Goal): Promise<void> => {
  await createAchievement(
    userId,
    goal.id,
    'goal_completed',
    'Goal Completed!',
    `You completed "${goal.title}" for this ${goal.period} period!`
  );

  // Check for personal best
  if (goal.currentValue > 0 && goal.currentStreak >= goal.longestStreak) {
    await createAchievement(
      userId,
      goal.id,
      'personal_best',
      'Personal Best!',
      `New longest streak for "${goal.title}"!`
    );
  }
};

/**
 * Get unseen achievements
 */
export const getUnseenAchievements = async (userId: string): Promise<Achievement[]> => {
  return getDocuments<Achievement>(userId, ACHIEVEMENTS_COLLECTION, [
    where('seen', '==', false),
    orderBy('createdAt', 'desc'),
  ]);
};

/**
 * Get all achievements
 */
export const getAllAchievements = async (userId: string): Promise<Achievement[]> => {
  return getDocuments<Achievement>(userId, ACHIEVEMENTS_COLLECTION, [
    orderBy('createdAt', 'desc'),
  ]);
};

/**
 * Mark achievement as seen
 */
export const markAchievementSeen = async (
  userId: string,
  achievementId: string
): Promise<void> => {
  await updateDocument(userId, ACHIEVEMENTS_COLLECTION, achievementId, {
    seen: true,
  });
};

/**
 * Mark all achievements as seen
 */
export const markAllAchievementsSeen = async (userId: string): Promise<void> => {
  const unseen = await getUnseenAchievements(userId);
  for (const achievement of unseen) {
    await markAchievementSeen(userId, achievement.id);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get default color for category
 */
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'journal':
      return '#3b82f6';
    case 'flashcard':
      return '#a855f7';
    case 'expense':
      return '#22c55e';
    case 'task':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};
