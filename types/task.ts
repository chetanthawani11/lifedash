// Task Management Data Models and Validation Schemas
// This file defines the shape of all task-related data in LifeDash

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

/**
 * Task - A single task/todo item
 */
export interface Task {
  id: string;                    // Unique identifier
  userId: string;                // Who owns this task
  title: string;                 // Task title (e.g., "Finish homework")
  description: string | null;    // Optional detailed description
  status: TaskStatus;            // Current status
  priority: TaskPriority;        // How important/urgent
  dueDate: Timestamp | null;     // When is this due
  completedAt: Timestamp | null; // When was this completed
  tags: string[];                // Tags for organization
  category: string | null;       // Optional category (e.g., "Work", "Personal")
  estimatedMinutes: number | null; // Estimated time to complete (in minutes)
  actualMinutes: number | null;  // Actual time spent (in minutes)
  isRecurring: boolean;          // Is this a recurring task
  recurringPattern: RecurringPattern | null; // How often does it repeat
  recurringSeriesId: string | null; // If this is an instance, which series it belongs to
  parentTaskId: string | null;   // Parent task (for subtasks)
  order: number;                 // Order in list (for drag-and-drop sorting)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Task status options
 */
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Recurring task patterns
 */
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Days of the week for weekly recurring tasks
 */
export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

/**
 * Recurring task configuration
 * This defines HOW a task repeats
 */
export interface RecurringConfig {
  pattern: RecurringPattern;     // How often: daily, weekly, monthly, yearly
  interval: number;              // Every X days/weeks/months/years (e.g., every 2 weeks)
  daysOfWeek?: DayOfWeek[];      // For weekly: which days (e.g., ['mon', 'wed', 'fri'])
  dayOfMonth?: number;           // For monthly: which day (1-31)
  endDate?: Timestamp | null;    // When to stop generating (null = never)
  maxOccurrences?: number | null; // Max times to repeat (null = unlimited)
}

/**
 * Recurring task series - The "template" that generates instances
 */
export interface RecurringTaskSeries {
  id: string;                    // Unique ID for this series
  userId: string;                // Who owns this series
  title: string;                 // Task title template
  description: string | null;    // Description template
  priority: TaskPriority;        // Default priority for instances
  category: string | null;       // Category for instances
  tags: string[];                // Tags for instances
  estimatedMinutes: number | null; // Estimated time for instances
  recurringConfig: RecurringConfig; // How it repeats
  lastGeneratedDate: Timestamp | null; // Last time we generated an instance
  nextDueDate: Timestamp | null; // When the next instance is due
  isActive: boolean;             // Is this series still active
  totalGenerated: number;        // How many instances we've created
  totalCompleted: number;        // How many instances have been completed
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Status options for the UI
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: '#78716c' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

// Priority options for the UI
export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string; icon: string }[] = [
  { value: 'low', label: 'Low', color: '#78716c', icon: '🔽' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '➡️' },
  { value: 'high', label: 'High', color: '#f97316', icon: '⬆️' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444', icon: '🔥' },
];

// Recurring pattern options for the UI
export const RECURRING_PATTERN_OPTIONS: { value: RecurringPattern; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Repeats every day' },
  { value: 'weekly', label: 'Weekly', description: 'Repeats on selected days' },
  { value: 'monthly', label: 'Monthly', description: 'Repeats on a specific date' },
  { value: 'yearly', label: 'Yearly', description: 'Repeats once a year' },
];

// Days of week options for the UI
export const DAYS_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string; shortLabel: string }[] = [
  { value: 'sun', label: 'Sunday', shortLabel: 'Su' },
  { value: 'mon', label: 'Monday', shortLabel: 'Mo' },
  { value: 'tue', label: 'Tuesday', shortLabel: 'Tu' },
  { value: 'wed', label: 'Wednesday', shortLabel: 'We' },
  { value: 'thu', label: 'Thursday', shortLabel: 'Th' },
  { value: 'fri', label: 'Friday', shortLabel: 'Fr' },
  { value: 'sat', label: 'Saturday', shortLabel: 'Sa' },
];

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

/**
 * Schema for recurring configuration
 */
export const recurringConfigSchema = z.object({
  pattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().min(1).max(365).default(1),
  daysOfWeek: z.array(z.enum(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']))
    .optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  endDate: z.date().nullable().optional(),
  maxOccurrences: z.number().int().min(1).max(1000).nullable().optional(),
});

/**
 * Schema for creating a NEW task
 */
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .nullable()
    .optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled'])
    .default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  dueDate: z.date()
    .nullable()
    .optional(),
  tags: z.array(z.string().trim().toLowerCase())
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  category: z.string()
    .max(30, 'Category must be less than 30 characters')
    .trim()
    .nullable()
    .optional(),
  estimatedMinutes: z.number()
    .int('Must be a whole number')
    .positive('Must be greater than 0')
    .max(10080, 'Must be less than a week (10,080 minutes)')
    .nullable()
    .optional(),
  isRecurring: z.boolean()
    .default(false),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly'])
    .nullable()
    .optional(),
  recurringConfig: recurringConfigSchema.nullable().optional(),
  recurringSeriesId: z.string().nullable().optional(),
  parentTaskId: z.string()
    .nullable()
    .optional(),
});

/**
 * Schema for creating a recurring task series
 */
export const createRecurringSeriesSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .nullable()
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  category: z.string()
    .max(30, 'Category must be less than 30 characters')
    .trim()
    .nullable()
    .optional(),
  tags: z.array(z.string().trim().toLowerCase())
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  estimatedMinutes: z.number()
    .int('Must be a whole number')
    .positive('Must be greater than 0')
    .max(10080, 'Must be less than a week (10,080 minutes)')
    .nullable()
    .optional(),
  recurringConfig: recurringConfigSchema,
  startDate: z.date(),
});

/**
 * Schema for updating a task
 */
export const updateTaskSchema = createTaskSchema.partial();

/**
 * Schema for marking a task as complete
 */
export const completeTaskSchema = z.object({
  actualMinutes: z.number()
    .int('Must be a whole number')
    .positive('Must be greater than 0')
    .max(10080, 'Must be less than a week')
    .nullable()
    .optional(),
});

// ============================================
// TYPESCRIPT TYPES FROM ZOD SCHEMAS
// ============================================

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type RecurringConfigInput = z.infer<typeof recurringConfigSchema>;
export type CreateRecurringSeriesInput = z.infer<typeof createRecurringSeriesSchema>;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Task with subtasks
 * Used in task detail views
 */
export interface TaskWithSubtasks extends Task {
  subtasks: Task[];
}

/**
 * Task grouped by date (for calendar view)
 */
export interface TasksByDate {
  date: string;                  // Date in YYYY-MM-DD format
  tasks: Task[];
}

/**
 * Task statistics for analytics
 */
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  cancelled: number;
  overdue: number;
  completionRate: number;        // Percentage (0-100)
}

/**
 * Firestore document data (without id)
 */
export type TaskData = Omit<Task, 'id'>;

/**
 * Helper function to check if a task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }

  const now = new Date();
  const dueDate = task.dueDate.toDate();
  return dueDate < now;
};

/**
 * Helper function to get tasks due today
 */
export const isTaskDueToday = (task: Task): boolean => {
  if (!task.dueDate) return false;

  const today = new Date();
  const dueDate = task.dueDate.toDate();

  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Helper function to format estimated time
 * Example: 90 minutes => "1h 30m"
 */
export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

// ============================================
// RECURRING TASK HELPERS
// ============================================

/**
 * Calculate the next due date based on recurring pattern
 * @param currentDate - The current/last due date
 * @param config - The recurring configuration
 * @returns The next due date, or null if series has ended
 */
export const calculateNextDueDate = (
  currentDate: Date,
  config: RecurringConfig
): Date | null => {
  const { pattern, interval, daysOfWeek, dayOfMonth, endDate, maxOccurrences } = config;

  // Check if we've reached the end date
  if (endDate) {
    const endDateValue = endDate instanceof Date ? endDate : endDate.toDate();
    if (currentDate >= endDateValue) {
      return null;
    }
  }

  let nextDate = new Date(currentDate);

  switch (pattern) {
    case 'daily':
      // Add interval days
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      // If specific days are set, find the next matching day
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayMap: Record<DayOfWeek, number> = {
          sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
        };
        const targetDays = daysOfWeek.map(d => dayMap[d]).sort((a, b) => a - b);

        // Find next occurrence
        let found = false;
        let daysToAdd = 1;

        // Try up to 14 days ahead (covers 2 weeks for interval > 1)
        while (!found && daysToAdd <= 7 * interval + 7) {
          const checkDate = new Date(currentDate);
          checkDate.setDate(checkDate.getDate() + daysToAdd);
          const dayOfWeek = checkDate.getDay();

          if (targetDays.includes(dayOfWeek)) {
            // For intervals > 1, check if this is in the right week
            const weeksDiff = Math.floor(daysToAdd / 7);
            if (weeksDiff % interval === 0 || (daysToAdd <= 7 && targetDays.indexOf(dayOfWeek) > targetDays.indexOf(currentDate.getDay()))) {
              nextDate = checkDate;
              found = true;
            } else if (daysToAdd > 7) {
              // After first week, we need to be on the right interval
              const startOfWeek = new Date(currentDate);
              startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
              const checkWeekStart = new Date(checkDate);
              checkWeekStart.setDate(checkWeekStart.getDate() - checkWeekStart.getDay());
              const weeksBetween = Math.floor((checkWeekStart.getTime() - startOfWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));

              if (weeksBetween % interval === 0) {
                nextDate = checkDate;
                found = true;
              }
            }
          }
          daysToAdd++;
        }

        if (!found) {
          // Fallback: just add interval weeks
          nextDate.setDate(nextDate.getDate() + 7 * interval);
        }
      } else {
        // No specific days, just add interval weeks
        nextDate.setDate(nextDate.getDate() + 7 * interval);
      }
      break;

    case 'monthly':
      // Add interval months
      nextDate.setMonth(nextDate.getMonth() + interval);

      // If specific day of month is set, use it
      if (dayOfMonth) {
        const targetDay = dayOfMonth;
        const maxDayInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(targetDay, maxDayInMonth));
      }
      break;

    case 'yearly':
      // Add interval years
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }

  // Check if next date exceeds end date
  if (endDate) {
    const endDateValue = endDate instanceof Date ? endDate : endDate.toDate();
    if (nextDate > endDateValue) {
      return null;
    }
  }

  return nextDate;
};

/**
 * Format a recurring pattern for display
 * @param config - The recurring configuration
 * @returns Human-readable string like "Every day" or "Every 2 weeks on Mon, Wed, Fri"
 */
export const formatRecurringPattern = (config: RecurringConfig): string => {
  const { pattern, interval, daysOfWeek, dayOfMonth } = config;

  const dayLabels: Record<DayOfWeek, string> = {
    sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat'
  };

  switch (pattern) {
    case 'daily':
      if (interval === 1) return 'Every day';
      return `Every ${interval} days`;

    case 'weekly':
      const daysStr = daysOfWeek && daysOfWeek.length > 0
        ? ` on ${daysOfWeek.map(d => dayLabels[d]).join(', ')}`
        : '';
      if (interval === 1) return `Every week${daysStr}`;
      return `Every ${interval} weeks${daysStr}`;

    case 'monthly':
      const dayStr = dayOfMonth ? ` on day ${dayOfMonth}` : '';
      if (interval === 1) return `Every month${dayStr}`;
      return `Every ${interval} months${dayStr}`;

    case 'yearly':
      if (interval === 1) return 'Every year';
      return `Every ${interval} years`;

    default:
      return 'Repeating';
  }
};

/**
 * Recurring series statistics
 */
export interface RecurringSeriesStats {
  totalGenerated: number;
  totalCompleted: number;
  completionRate: number;
  nextDueDate: Date | null;
  isActive: boolean;
};

/**
 * Firestore document data for recurring series (without id)
 */
export type RecurringTaskSeriesData = Omit<RecurringTaskSeries, 'id'>;
