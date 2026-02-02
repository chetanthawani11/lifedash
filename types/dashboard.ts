// Dashboard Widget Types and Configuration
// This file defines all the widget types and their configuration options

import { z } from 'zod';

// ============================================
// WIDGET TYPES
// ============================================

/**
 * Available widget types in the dashboard
 * Each represents a different feature module
 */
export type WidgetType =
  | 'journals'      // Journal entries summary
  | 'expenses'      // Expense tracking summary
  | 'flashcards'    // Flashcard decks summary
  | 'tasks'         // Task management summary
  | 'quick-actions' // Quick action buttons
  | 'recent-activity' // Recent activity feed
  | 'stats-overview'; // Overall statistics

/**
 * Widget size options for responsive layout
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

/**
 * Individual widget configuration
 */
export interface WidgetConfig {
  id: string;           // Unique identifier
  type: WidgetType;     // Type of widget
  title: string;        // Display title
  size: WidgetSize;     // Size in grid
  order: number;        // Order in dashboard
  isVisible: boolean;   // Whether widget is shown
  settings?: Record<string, unknown>; // Widget-specific settings
}

/**
 * Complete dashboard layout configuration
 */
export interface DashboardLayout {
  widgets: WidgetConfig[];
  lastUpdated: Date;
}

/**
 * Widget metadata for displaying in widget selector
 */
export interface WidgetMetadata {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  color: string;
}

// ============================================
// WIDGET METADATA DEFINITIONS
// ============================================

/**
 * All available widgets with their metadata
 * This is used for the widget selector and default configuration
 */
export const WIDGET_METADATA: WidgetMetadata[] = [
  {
    type: 'journals',
    title: 'Journals',
    description: 'View your recent journal entries and create new ones',
    icon: 'book',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    color: '#3b82f6', // Blue
  },
  {
    type: 'expenses',
    title: 'Expenses',
    description: 'Track your spending and view expense summaries',
    icon: 'dollar',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    color: '#22c55e', // Green
  },
  {
    type: 'flashcards',
    title: 'Flashcards',
    description: 'Study your flashcard decks and track progress',
    icon: 'cards',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    color: '#a855f7', // Purple
  },
  {
    type: 'tasks',
    title: 'Tasks',
    description: 'Manage your tasks and see upcoming deadlines',
    icon: 'check',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    color: '#0d9488', // Teal (primary)
  },
  {
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'Fast access to common actions',
    icon: 'lightning',
    defaultSize: 'small',
    minSize: 'small',
    maxSize: 'medium',
    color: '#f59e0b', // Amber
  },
  {
    type: 'recent-activity',
    title: 'Recent Activity',
    description: 'See your latest activity across all modules',
    icon: 'clock',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'full',
    color: '#6366f1', // Indigo
  },
  {
    type: 'stats-overview',
    title: 'Statistics',
    description: 'Overview of your productivity and progress',
    icon: 'chart',
    defaultSize: 'full',
    minSize: 'large',
    maxSize: 'full',
    color: '#ec4899', // Pink
  },
];

/**
 * Default dashboard layout for new users
 */
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: [
    { id: 'journals-1', type: 'journals', title: 'Journals', size: 'medium', order: 0, isVisible: true },
    { id: 'expenses-1', type: 'expenses', title: 'Expenses', size: 'medium', order: 1, isVisible: true },
    { id: 'flashcards-1', type: 'flashcards', title: 'Flashcards', size: 'medium', order: 2, isVisible: true },
    { id: 'tasks-1', type: 'tasks', title: 'Tasks', size: 'medium', order: 3, isVisible: true },
    { id: 'quick-actions-1', type: 'quick-actions', title: 'Quick Actions', size: 'small', order: 4, isVisible: true },
    { id: 'recent-activity-1', type: 'recent-activity', title: 'Recent Activity', size: 'large', order: 5, isVisible: true },
  ],
  lastUpdated: new Date(),
};

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

export const widgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['journals', 'expenses', 'flashcards', 'tasks', 'quick-actions', 'recent-activity', 'stats-overview']),
  title: z.string(),
  size: z.enum(['small', 'medium', 'large', 'full']),
  order: z.number().int().min(0),
  isVisible: z.boolean(),
  settings: z.record(z.unknown()).optional(),
});

export const dashboardLayoutSchema = z.object({
  widgets: z.array(widgetConfigSchema),
  lastUpdated: z.date(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get widget metadata by type
 */
export const getWidgetMetadata = (type: WidgetType): WidgetMetadata | undefined => {
  return WIDGET_METADATA.find(w => w.type === type);
};

/**
 * Generate a unique widget ID
 */
export const generateWidgetId = (type: WidgetType): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get CSS grid column span for widget size
 */
export const getWidgetGridSpan = (size: WidgetSize): number => {
  switch (size) {
    case 'small': return 1;
    case 'medium': return 2;
    case 'large': return 3;
    case 'full': return 4;
    default: return 2;
  }
};

/**
 * Sort widgets by order
 */
export const sortWidgetsByOrder = (widgets: WidgetConfig[]): WidgetConfig[] => {
  return [...widgets].sort((a, b) => a.order - b.order);
};

/**
 * Get visible widgets only
 */
export const getVisibleWidgets = (widgets: WidgetConfig[]): WidgetConfig[] => {
  return widgets.filter(w => w.isVisible);
};
