// Task Service - All task management database operations
// This file handles creating, reading, updating, and deleting tasks

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
  Task,
  TaskData,
  CreateTaskInput,
  UpdateTaskInput,
  CompleteTaskInput,
  TaskStatus,
  TaskPriority,
  TaskStats,
  RecurringTaskSeries,
  RecurringTaskSeriesData,
  RecurringConfig,
  CreateRecurringSeriesInput,
  createTaskSchema,
  updateTaskSchema,
  completeTaskSchema,
  createRecurringSeriesSchema,
  calculateNextDueDate,
} from '@/types';

import { Unsubscribe } from 'firebase/firestore';

// Collection names
const TASKS_COLLECTION = 'tasks';
const RECURRING_SERIES_COLLECTION = 'recurring_series';

// ============================================
// TASK CRUD OPERATIONS
// ============================================

/**
 * Create a new task
 *
 * @param userId - User ID who owns this task
 * @param input - Task data (validated with Zod)
 * @returns The newly created task with ID
 *
 * WHAT THIS DOES:
 * 1. Validates the input data using our Zod schema
 * 2. Prepares the task data with timestamps
 * 3. Saves it to Firebase Firestore
 * 4. Returns the complete task object with its new ID
 */
export const createTask = async (
  userId: string,
  input: CreateTaskInput
): Promise<Task> => {
  // Validate input with Zod (throws error if invalid)
  const validatedData = createTaskSchema.parse(input);

  // Get current count of tasks for ordering (new tasks go at the end)
  const existingTasks = await getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [orderBy('order', 'desc'), limit(1)]
  );
  const nextOrder = existingTasks.length > 0 ? existingTasks[0].order + 1 : 0;

  // Prepare task data for Firestore
  const taskData: TaskData = {
    userId,
    title: validatedData.title,
    description: validatedData.description || null,
    status: validatedData.status || 'todo',
    priority: validatedData.priority || 'medium',
    dueDate: validatedData.dueDate ? dateToTimestamp(validatedData.dueDate) : null,
    completedAt: null,
    tags: validatedData.tags || [],
    category: validatedData.category || null,
    estimatedMinutes: validatedData.estimatedMinutes || null,
    actualMinutes: null,
    isRecurring: validatedData.isRecurring || false,
    recurringPattern: validatedData.recurringPattern || null,
    parentTaskId: validatedData.parentTaskId || null,
    order: nextOrder,
    createdAt: now(),
    updatedAt: now(),
  };

  // Save to Firestore and get the new document ID
  const taskId = await createDocument<TaskData>(
    userId,
    TASKS_COLLECTION,
    taskData
  );

  // Return the complete task with its ID
  return {
    id: taskId,
    ...taskData,
  };
};

/**
 * Get a single task by ID
 *
 * @param userId - User ID who owns the task
 * @param taskId - The task's unique ID
 * @returns The task if found, null otherwise
 */
export const getTask = async (
  userId: string,
  taskId: string
): Promise<Task | null> => {
  return getDocument<Task>(userId, TASKS_COLLECTION, taskId);
};

/**
 * Get all tasks for a user
 *
 * @param userId - User ID
 * @param maxTasks - Maximum number of tasks to return (default: 100)
 * @returns Array of tasks sorted by order (for drag-and-drop)
 */
export const getUserTasks = async (
  userId: string,
  maxTasks: number = 100
): Promise<Task[]> => {
  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [orderBy('order', 'asc'), limit(maxTasks)]
  );
};

/**
 * Get tasks filtered by status
 *
 * @param userId - User ID
 * @param status - Task status to filter by
 * @returns Array of tasks with the specified status
 */
export const getTasksByStatus = async (
  userId: string,
  status: TaskStatus
): Promise<Task[]> => {
  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('status', '==', status),
      orderBy('order', 'asc'),
    ]
  );
};

/**
 * Get tasks filtered by priority
 *
 * @param userId - User ID
 * @param priority - Task priority to filter by
 * @returns Array of tasks with the specified priority
 */
export const getTasksByPriority = async (
  userId: string,
  priority: TaskPriority
): Promise<Task[]> => {
  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('priority', '==', priority),
      orderBy('order', 'asc'),
    ]
  );
};

/**
 * Get tasks by category
 *
 * @param userId - User ID
 * @param category - Category name to filter by
 * @returns Array of tasks in the specified category
 */
export const getTasksByCategory = async (
  userId: string,
  category: string
): Promise<Task[]> => {
  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('category', '==', category),
      orderBy('order', 'asc'),
    ]
  );
};

/**
 * Get tasks due today
 *
 * @param userId - User ID
 * @returns Array of tasks due today
 */
export const getTasksDueToday = async (
  userId: string
): Promise<Task[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('dueDate', '>=', dateToTimestamp(today)),
      where('dueDate', '<', dateToTimestamp(tomorrow)),
      orderBy('dueDate', 'asc'),
    ]
  );
};

/**
 * Get overdue tasks (past due date and not completed)
 *
 * @param userId - User ID
 * @returns Array of overdue tasks
 */
export const getOverdueTasks = async (
  userId: string
): Promise<Task[]> => {
  const now = new Date();

  // Get all tasks that might be overdue
  const tasks = await getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('status', 'in', ['todo', 'in_progress']),
      orderBy('dueDate', 'asc'),
    ]
  );

  // Filter to only overdue tasks (has due date and due date is in the past)
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    return task.dueDate.toDate() < now;
  });
};

/**
 * Update a task
 *
 * @param userId - User ID
 * @param taskId - Task ID to update
 * @param updates - Partial task data to update
 */
export const updateTask = async (
  userId: string,
  taskId: string,
  updates: UpdateTaskInput
): Promise<void> => {
  // Validate the updates
  const validatedUpdates = updateTaskSchema.parse(updates);

  // Prepare update data
  const updateData: Record<string, unknown> = {
    ...validatedUpdates,
    updatedAt: now(),
  };

  // Convert due date if provided
  if (validatedUpdates.dueDate !== undefined) {
    updateData.dueDate = validatedUpdates.dueDate
      ? dateToTimestamp(validatedUpdates.dueDate)
      : null;
  }

  await updateDocument(userId, TASKS_COLLECTION, taskId, updateData);
};

/**
 * Mark a task as complete
 *
 * @param userId - User ID
 * @param taskId - Task ID to complete
 * @param input - Optional completion data (actual time spent)
 *
 * WHAT THIS DOES:
 * 1. Sets status to 'completed'
 * 2. Records the completion timestamp
 * 3. Optionally records actual time spent
 */
export const completeTask = async (
  userId: string,
  taskId: string,
  input?: CompleteTaskInput
): Promise<void> => {
  // Validate input if provided
  const validatedInput = input ? completeTaskSchema.parse(input) : {};

  await updateDocument(userId, TASKS_COLLECTION, taskId, {
    status: 'completed',
    completedAt: now(),
    actualMinutes: validatedInput.actualMinutes || null,
    updatedAt: now(),
  });
};

/**
 * Mark a task as incomplete (reopen it)
 *
 * @param userId - User ID
 * @param taskId - Task ID to reopen
 */
export const reopenTask = async (
  userId: string,
  taskId: string
): Promise<void> => {
  await updateDocument(userId, TASKS_COLLECTION, taskId, {
    status: 'todo',
    completedAt: null,
    updatedAt: now(),
  });
};

/**
 * Delete a task
 *
 * @param userId - User ID
 * @param taskId - Task ID to delete
 */
export const deleteTask = async (
  userId: string,
  taskId: string
): Promise<void> => {
  await deleteDocument(userId, TASKS_COLLECTION, taskId);
};

/**
 * Update task order (for drag-and-drop reordering)
 *
 * @param userId - User ID
 * @param taskId - Task ID to reorder
 * @param newOrder - New order position
 */
export const updateTaskOrder = async (
  userId: string,
  taskId: string,
  newOrder: number
): Promise<void> => {
  await updateDocument(userId, TASKS_COLLECTION, taskId, {
    order: newOrder,
    updatedAt: now(),
  });
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to real-time updates for all tasks
 *
 * @param userId - User ID
 * @param onUpdate - Callback function when tasks change
 * @param onError - Optional error callback
 * @returns Unsubscribe function - IMPORTANT: Call this when component unmounts!
 *
 * USAGE EXAMPLE:
 * ```
 * useEffect(() => {
 *   const unsubscribe = subscribeToUserTasks(userId, (tasks) => {
 *     setTasks(tasks);
 *   });
 *   return () => unsubscribe(); // Cleanup on unmount
 * }, [userId]);
 * ```
 */
export const subscribeToUserTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return subscribeToCollection<Task>(
    userId,
    TASKS_COLLECTION,
    [orderBy('order', 'asc')],
    onUpdate,
    onError
  );
};

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Get task statistics for a user
 *
 * @param userId - User ID
 * @returns Task statistics (total, completed, in progress, etc.)
 *
 * WHAT THIS RETURNS:
 * - total: Total number of tasks
 * - completed: Number of completed tasks
 * - inProgress: Number of tasks in progress
 * - todo: Number of tasks not started
 * - cancelled: Number of cancelled tasks
 * - overdue: Number of overdue tasks
 * - completionRate: Percentage of tasks completed (0-100)
 */
export const getTaskStats = async (
  userId: string
): Promise<TaskStats> => {
  const tasks = await getUserTasks(userId, 1000);
  const now = new Date();

  const stats: TaskStats = {
    total: tasks.length,
    completed: 0,
    inProgress: 0,
    todo: 0,
    cancelled: 0,
    overdue: 0,
    completionRate: 0,
  };

  // Count tasks by status
  tasks.forEach(task => {
    switch (task.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'in_progress':
        stats.inProgress++;
        break;
      case 'todo':
        stats.todo++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
    }

    // Check for overdue (has due date, not completed/cancelled, past due)
    if (
      task.dueDate &&
      task.status !== 'completed' &&
      task.status !== 'cancelled' &&
      task.dueDate.toDate() < now
    ) {
      stats.overdue++;
    }
  });

  // Calculate completion rate (excluding cancelled)
  const nonCancelledTotal = stats.total - stats.cancelled;
  stats.completionRate = nonCancelledTotal > 0
    ? Math.round((stats.completed / nonCancelledTotal) * 100)
    : 0;

  return stats;
};

/**
 * Get all unique categories across all tasks
 *
 * @param userId - User ID
 * @returns Array of unique category names
 */
export const getAllTaskCategories = async (
  userId: string
): Promise<string[]> => {
  const tasks = await getDocuments<Task>(userId, TASKS_COLLECTION, []);

  const categoriesSet = new Set<string>();
  tasks.forEach(task => {
    if (task.category) {
      categoriesSet.add(task.category);
    }
  });

  return Array.from(categoriesSet).sort();
};

/**
 * Get all unique tags across all tasks
 *
 * @param userId - User ID
 * @returns Array of unique tag names
 */
export const getAllTaskTags = async (
  userId: string
): Promise<string[]> => {
  const tasks = await getDocuments<Task>(userId, TASKS_COLLECTION, []);

  const tagsSet = new Set<string>();
  tasks.forEach(task => {
    task.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
};

/**
 * Search tasks by tag
 *
 * @param userId - User ID
 * @param tag - Tag to search for
 * @returns Array of tasks with the specified tag
 */
export const searchTasksByTag = async (
  userId: string,
  tag: string
): Promise<Task[]> => {
  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('tags', 'array-contains', tag.toLowerCase()),
      orderBy('order', 'asc'),
    ]
  );
};

// ============================================
// RECURRING TASK SERIES OPERATIONS
// ============================================

/**
 * Create a new recurring task series
 *
 * @param userId - User ID who owns this series
 * @param input - Series configuration data
 * @returns The newly created series with its ID
 *
 * WHAT THIS DOES:
 * 1. Validates the input data
 * 2. Creates the recurring series template
 * 3. Creates the first task instance
 * 4. Returns the complete series object
 */
export const createRecurringSeries = async (
  userId: string,
  input: CreateRecurringSeriesInput
): Promise<RecurringTaskSeries> => {
  // Validate input
  const validatedData = createRecurringSeriesSchema.parse(input);

  // Calculate the first due date
  const firstDueDate = validatedData.startDate;

  // Build recurring config - only include defined fields (Firestore doesn't accept undefined)
  const recurringConfig: Record<string, unknown> = {
    pattern: validatedData.recurringConfig.pattern,
    interval: validatedData.recurringConfig.interval || 1,
    endDate: validatedData.recurringConfig.endDate
      ? dateToTimestamp(validatedData.recurringConfig.endDate)
      : null,
    maxOccurrences: validatedData.recurringConfig.maxOccurrences || null,
  };

  // Only add daysOfWeek if it's defined and has values
  if (validatedData.recurringConfig.daysOfWeek && validatedData.recurringConfig.daysOfWeek.length > 0) {
    recurringConfig.daysOfWeek = validatedData.recurringConfig.daysOfWeek;
  }

  // Only add dayOfMonth if it's defined
  if (validatedData.recurringConfig.dayOfMonth !== undefined) {
    recurringConfig.dayOfMonth = validatedData.recurringConfig.dayOfMonth;
  }

  // Prepare series data
  const seriesData: RecurringTaskSeriesData = {
    userId,
    title: validatedData.title,
    description: validatedData.description || null,
    priority: validatedData.priority || 'medium',
    category: validatedData.category || null,
    tags: validatedData.tags || [],
    estimatedMinutes: validatedData.estimatedMinutes || null,
    recurringConfig: recurringConfig as RecurringTaskSeriesData['recurringConfig'],
    lastGeneratedDate: dateToTimestamp(firstDueDate),
    nextDueDate: dateToTimestamp(firstDueDate),
    isActive: true,
    totalGenerated: 0,
    totalCompleted: 0,
    createdAt: now(),
    updatedAt: now(),
  };

  // Save series to Firestore
  const seriesId = await createDocument<RecurringTaskSeriesData>(
    userId,
    RECURRING_SERIES_COLLECTION,
    seriesData
  );

  const series: RecurringTaskSeries = {
    id: seriesId,
    ...seriesData,
  };

  // Generate the first task instance
  await generateTaskFromSeries(userId, series);

  return series;
};

/**
 * Generate a task instance from a recurring series
 *
 * @param userId - User ID
 * @param series - The recurring series to generate from
 * @returns The newly created task, or null if series has ended
 */
export const generateTaskFromSeries = async (
  userId: string,
  series: RecurringTaskSeries
): Promise<Task | null> => {
  // Check if series is still active
  if (!series.isActive) {
    return null;
  }

  // Check if we've hit max occurrences
  if (
    series.recurringConfig.maxOccurrences &&
    series.totalGenerated >= series.recurringConfig.maxOccurrences
  ) {
    // Deactivate the series
    await updateRecurringSeries(userId, series.id, { isActive: false });
    return null;
  }

  // Get the due date for this instance
  const dueDate = series.nextDueDate
    ? series.nextDueDate.toDate()
    : new Date();

  // Get next order number
  const existingTasks = await getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [orderBy('order', 'desc'), limit(1)]
  );
  const nextOrder = existingTasks.length > 0 ? existingTasks[0].order + 1 : 0;

  // Create the task instance
  const taskData: TaskData = {
    userId,
    title: series.title,
    description: series.description,
    status: 'todo',
    priority: series.priority,
    dueDate: dateToTimestamp(dueDate),
    completedAt: null,
    tags: series.tags,
    category: series.category,
    estimatedMinutes: series.estimatedMinutes,
    actualMinutes: null,
    isRecurring: true,
    recurringPattern: series.recurringConfig.pattern,
    recurringSeriesId: series.id,
    parentTaskId: null,
    order: nextOrder,
    createdAt: now(),
    updatedAt: now(),
  };

  const taskId = await createDocument<TaskData>(
    userId,
    TASKS_COLLECTION,
    taskData
  );

  // Calculate next due date
  const nextDueDate = calculateNextDueDate(dueDate, series.recurringConfig);

  // Update series with new stats
  await updateDocument(userId, RECURRING_SERIES_COLLECTION, series.id, {
    lastGeneratedDate: dateToTimestamp(dueDate),
    nextDueDate: nextDueDate ? dateToTimestamp(nextDueDate) : null,
    totalGenerated: series.totalGenerated + 1,
    isActive: nextDueDate !== null,
    updatedAt: now(),
  });

  return {
    id: taskId,
    ...taskData,
  };
};

/**
 * Complete a recurring task and generate the next instance
 *
 * @param userId - User ID
 * @param taskId - Task ID to complete
 * @param input - Optional completion data
 * @returns The next task instance, or null if series has ended
 *
 * WHAT THIS DOES:
 * 1. Marks the current task as completed
 * 2. Updates the series completion count
 * 3. Generates the next task instance
 */
export const completeRecurringTask = async (
  userId: string,
  taskId: string,
  input?: CompleteTaskInput
): Promise<Task | null> => {
  // Get the task first
  const task = await getTask(userId, taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Validate input if provided
  const validatedInput = input ? completeTaskSchema.parse(input) : {};

  // Mark task as completed
  await updateDocument(userId, TASKS_COLLECTION, taskId, {
    status: 'completed',
    completedAt: now(),
    actualMinutes: validatedInput.actualMinutes || null,
    updatedAt: now(),
  });

  // If this is part of a recurring series, update the series
  if (task.recurringSeriesId) {
    const series = await getRecurringSeries(userId, task.recurringSeriesId);
    if (series && series.isActive) {
      // Update series completion count
      await updateDocument(userId, RECURRING_SERIES_COLLECTION, series.id, {
        totalCompleted: series.totalCompleted + 1,
        updatedAt: now(),
      });

      // Generate next task instance
      const updatedSeries = await getRecurringSeries(userId, series.id);
      if (updatedSeries) {
        return generateTaskFromSeries(userId, updatedSeries);
      }
    }
  }

  return null;
};

/**
 * Get a recurring series by ID
 *
 * @param userId - User ID
 * @param seriesId - Series ID
 * @returns The series if found, null otherwise
 */
export const getRecurringSeries = async (
  userId: string,
  seriesId: string
): Promise<RecurringTaskSeries | null> => {
  return getDocument<RecurringTaskSeries>(userId, RECURRING_SERIES_COLLECTION, seriesId);
};

/**
 * Get all recurring series for a user
 *
 * @param userId - User ID
 * @param activeOnly - If true, only return active series (default: false)
 * @returns Array of recurring series
 */
export const getUserRecurringSeries = async (
  userId: string,
  activeOnly: boolean = false
): Promise<RecurringTaskSeries[]> => {
  const constraints = activeOnly
    ? [where('isActive', '==', true), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')];

  return getDocuments<RecurringTaskSeries>(
    userId,
    RECURRING_SERIES_COLLECTION,
    constraints
  );
};

/**
 * Update a recurring series
 * Changes will affect future task instances
 *
 * @param userId - User ID
 * @param seriesId - Series ID to update
 * @param updates - Partial series data to update
 */
export const updateRecurringSeries = async (
  userId: string,
  seriesId: string,
  updates: Partial<{
    title: string;
    description: string | null;
    priority: string;
    category: string | null;
    tags: string[];
    estimatedMinutes: number | null;
    recurringConfig: RecurringConfig;
    isActive: boolean;
  }>
): Promise<void> => {
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: now(),
  };

  // Handle recurring config conversion if provided
  if (updates.recurringConfig?.endDate) {
    const config = { ...updates.recurringConfig };
    if (config.endDate instanceof Date) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config as any).endDate = dateToTimestamp(config.endDate);
    }
    updateData.recurringConfig = config;
  }

  await updateDocument(userId, RECURRING_SERIES_COLLECTION, seriesId, updateData);
};

/**
 * Delete a recurring series
 * Optionally delete all associated task instances
 *
 * @param userId - User ID
 * @param seriesId - Series ID to delete
 * @param deleteInstances - If true, also delete all task instances (default: false)
 */
export const deleteRecurringSeries = async (
  userId: string,
  seriesId: string,
  deleteInstances: boolean = false
): Promise<void> => {
  if (deleteInstances) {
    // Get all tasks from this series
    const tasks = await getDocuments<Task>(
      userId,
      TASKS_COLLECTION,
      [where('recurringSeriesId', '==', seriesId)]
    );

    // Delete each task
    for (const task of tasks) {
      await deleteDocument(userId, TASKS_COLLECTION, task.id);
    }
  }

  // Delete the series
  await deleteDocument(userId, RECURRING_SERIES_COLLECTION, seriesId);
};

/**
 * Pause a recurring series
 * Stops generating new instances until resumed
 *
 * @param userId - User ID
 * @param seriesId - Series ID to pause
 */
export const pauseRecurringSeries = async (
  userId: string,
  seriesId: string
): Promise<void> => {
  await updateDocument(userId, RECURRING_SERIES_COLLECTION, seriesId, {
    isActive: false,
    updatedAt: now(),
  });
};

/**
 * Resume a paused recurring series
 *
 * @param userId - User ID
 * @param seriesId - Series ID to resume
 */
export const resumeRecurringSeries = async (
  userId: string,
  seriesId: string
): Promise<void> => {
  const series = await getRecurringSeries(userId, seriesId);
  if (!series) {
    throw new Error('Series not found');
  }

  // Calculate the next due date from now
  const nextDueDate = calculateNextDueDate(new Date(), series.recurringConfig);

  await updateDocument(userId, RECURRING_SERIES_COLLECTION, seriesId, {
    isActive: true,
    nextDueDate: nextDueDate ? dateToTimestamp(nextDueDate) : null,
    updatedAt: now(),
  });

  // Generate a task for today if applicable
  if (nextDueDate) {
    const updatedSeries = await getRecurringSeries(userId, seriesId);
    if (updatedSeries) {
      await generateTaskFromSeries(userId, updatedSeries);
    }
  }
};

/**
 * Get all tasks from a recurring series
 *
 * @param userId - User ID
 * @param seriesId - Series ID
 * @returns Array of tasks from this series
 */
export const getTasksFromSeries = async (
  userId: string,
  seriesId: string
): Promise<Task[]> => {
  return getDocuments<Task>(
    userId,
    TASKS_COLLECTION,
    [
      where('recurringSeriesId', '==', seriesId),
      orderBy('dueDate', 'desc'),
    ]
  );
};

/**
 * Subscribe to real-time updates for recurring series
 *
 * @param userId - User ID
 * @param onUpdate - Callback when series change
 * @param onError - Optional error callback
 * @returns Unsubscribe function
 */
export const subscribeToRecurringSeries = (
  userId: string,
  onUpdate: (series: RecurringTaskSeries[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return subscribeToCollection<RecurringTaskSeries>(
    userId,
    RECURRING_SERIES_COLLECTION,
    [orderBy('createdAt', 'desc')],
    onUpdate,
    onError
  );
};

/**
 * Check and generate any due recurring tasks
 * This should be called when the app loads or periodically
 *
 * @param userId - User ID
 * @returns Number of tasks generated
 *
 * WHAT THIS DOES:
 * 1. Gets all active recurring series
 * 2. For each series, checks if a new task should be generated
 * 3. Generates tasks for any that are due
 */
export const checkAndGenerateRecurringTasks = async (
  userId: string
): Promise<number> => {
  const series = await getUserRecurringSeries(userId, true);
  let generated = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const s of series) {
    if (!s.nextDueDate) continue;

    const nextDue = s.nextDueDate.toDate();
    nextDue.setHours(0, 0, 0, 0);

    // Check if the next due date is today or earlier
    if (nextDue <= today) {
      // Check if we already have a pending task for this series on this date
      const existingTasks = await getDocuments<Task>(
        userId,
        TASKS_COLLECTION,
        [
          where('recurringSeriesId', '==', s.id),
          where('status', 'in', ['todo', 'in_progress']),
        ]
      );

      // If no pending tasks, generate a new one
      if (existingTasks.length === 0) {
        const task = await generateTaskFromSeries(userId, s);
        if (task) {
          generated++;
        }
      }
    }
  }

  return generated;
};

/**
 * Get recurring series statistics
 *
 * @param userId - User ID
 * @returns Statistics about recurring tasks
 */
export const getRecurringSeriesStats = async (
  userId: string
): Promise<{
  totalSeries: number;
  activeSeries: number;
  pausedSeries: number;
  totalTasksGenerated: number;
  totalTasksCompleted: number;
  overallCompletionRate: number;
}> => {
  const allSeries = await getUserRecurringSeries(userId);

  let activeSeries = 0;
  let pausedSeries = 0;
  let totalTasksGenerated = 0;
  let totalTasksCompleted = 0;

  allSeries.forEach(series => {
    if (series.isActive) {
      activeSeries++;
    } else {
      pausedSeries++;
    }
    totalTasksGenerated += series.totalGenerated;
    totalTasksCompleted += series.totalCompleted;
  });

  return {
    totalSeries: allSeries.length,
    activeSeries,
    pausedSeries,
    totalTasksGenerated,
    totalTasksCompleted,
    overallCompletionRate: totalTasksGenerated > 0
      ? Math.round((totalTasksCompleted / totalTasksGenerated) * 100)
      : 0,
  };
};
