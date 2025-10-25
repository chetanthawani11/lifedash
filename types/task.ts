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
export const RECURRING_PATTERN_OPTIONS: { value: RecurringPattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

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
  parentTaskId: z.string()
    .nullable()
    .optional(),
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
