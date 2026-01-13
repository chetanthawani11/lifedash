// Dashboard Service - Manages dashboard layout and widget preferences
// This file handles saving and loading dashboard configuration

import {
  getDocument,
  setDocument,
  now,
  subscribeToDocument,
} from './db-utils';

import {
  DashboardLayout,
  WidgetConfig,
  DEFAULT_DASHBOARD_LAYOUT,
  sortWidgetsByOrder,
} from '@/types';

import { Unsubscribe } from 'firebase/firestore';

// Collection name for dashboard settings
const DASHBOARD_SETTINGS_COLLECTION = 'dashboard_settings';
const DASHBOARD_DOC_ID = 'layout';

// ============================================
// DASHBOARD LAYOUT CRUD OPERATIONS
// ============================================

/**
 * Dashboard settings document structure
 */
interface DashboardSettingsDoc {
  widgets: WidgetConfig[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get the user's dashboard layout
 *
 * @param userId - User ID
 * @returns The dashboard layout, or default if none exists
 */
export const getDashboardLayout = async (
  userId: string
): Promise<DashboardLayout> => {
  try {
    const doc = await getDocument<DashboardSettingsDoc>(
      userId,
      DASHBOARD_SETTINGS_COLLECTION,
      DASHBOARD_DOC_ID
    );

    if (doc) {
      return {
        widgets: sortWidgetsByOrder(doc.widgets),
        lastUpdated: doc.lastUpdated instanceof Date
          ? doc.lastUpdated
          : new Date(),
      };
    }

    // Return default layout if none exists
    return DEFAULT_DASHBOARD_LAYOUT;
  } catch (error) {
    console.error('Error loading dashboard layout:', error);
    return DEFAULT_DASHBOARD_LAYOUT;
  }
};

/**
 * Save the user's dashboard layout
 *
 * @param userId - User ID
 * @param layout - The dashboard layout to save
 */
export const saveDashboardLayout = async (
  userId: string,
  layout: DashboardLayout
): Promise<void> => {
  try {
    await setDocument(
      userId,
      DASHBOARD_SETTINGS_COLLECTION,
      DASHBOARD_DOC_ID,
      {
        widgets: layout.widgets,
        lastUpdated: new Date(),
      },
      true // merge with existing data
    );
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    throw error;
  }
};

/**
 * Update a single widget's configuration
 *
 * @param userId - User ID
 * @param widgetId - Widget ID to update
 * @param updates - Partial widget config to update
 */
export const updateWidgetConfig = async (
  userId: string,
  widgetId: string,
  updates: Partial<WidgetConfig>
): Promise<void> => {
  const layout = await getDashboardLayout(userId);

  const updatedWidgets = layout.widgets.map(widget =>
    widget.id === widgetId
      ? { ...widget, ...updates }
      : widget
  );

  await saveDashboardLayout(userId, {
    widgets: updatedWidgets,
    lastUpdated: new Date(),
  });
};

/**
 * Toggle widget visibility
 *
 * @param userId - User ID
 * @param widgetId - Widget ID to toggle
 */
export const toggleWidgetVisibility = async (
  userId: string,
  widgetId: string
): Promise<void> => {
  const layout = await getDashboardLayout(userId);

  const widget = layout.widgets.find(w => w.id === widgetId);
  if (!widget) return;

  await updateWidgetConfig(userId, widgetId, {
    isVisible: !widget.isVisible,
  });
};

/**
 * Reorder widgets by updating their order values
 *
 * @param userId - User ID
 * @param widgetIds - Array of widget IDs in new order
 */
export const reorderWidgets = async (
  userId: string,
  widgetIds: string[]
): Promise<void> => {
  const layout = await getDashboardLayout(userId);

  const updatedWidgets = layout.widgets.map(widget => {
    const newOrder = widgetIds.indexOf(widget.id);
    return {
      ...widget,
      order: newOrder >= 0 ? newOrder : widget.order,
    };
  });

  await saveDashboardLayout(userId, {
    widgets: sortWidgetsByOrder(updatedWidgets),
    lastUpdated: new Date(),
  });
};

/**
 * Add a new widget to the dashboard
 *
 * @param userId - User ID
 * @param widget - Widget config to add
 */
export const addWidget = async (
  userId: string,
  widget: WidgetConfig
): Promise<void> => {
  const layout = await getDashboardLayout(userId);

  // Set order to be at the end
  const maxOrder = Math.max(...layout.widgets.map(w => w.order), -1);
  const newWidget = { ...widget, order: maxOrder + 1 };

  await saveDashboardLayout(userId, {
    widgets: [...layout.widgets, newWidget],
    lastUpdated: new Date(),
  });
};

/**
 * Remove a widget from the dashboard
 *
 * @param userId - User ID
 * @param widgetId - Widget ID to remove
 */
export const removeWidget = async (
  userId: string,
  widgetId: string
): Promise<void> => {
  const layout = await getDashboardLayout(userId);

  const updatedWidgets = layout.widgets
    .filter(w => w.id !== widgetId)
    .map((w, index) => ({ ...w, order: index })); // Reorder

  await saveDashboardLayout(userId, {
    widgets: updatedWidgets,
    lastUpdated: new Date(),
  });
};

/**
 * Reset dashboard to default layout
 *
 * @param userId - User ID
 */
export const resetDashboardLayout = async (
  userId: string
): Promise<void> => {
  await saveDashboardLayout(userId, {
    ...DEFAULT_DASHBOARD_LAYOUT,
    lastUpdated: new Date(),
  });
};

/**
 * Subscribe to real-time dashboard layout updates
 *
 * @param userId - User ID
 * @param onUpdate - Callback when layout changes
 * @param onError - Optional error callback
 * @returns Unsubscribe function
 */
export const subscribeToDashboardLayout = (
  userId: string,
  onUpdate: (layout: DashboardLayout) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return subscribeToDocument<DashboardSettingsDoc>(
    userId,
    DASHBOARD_SETTINGS_COLLECTION,
    DASHBOARD_DOC_ID,
    (doc) => {
      if (doc) {
        onUpdate({
          widgets: sortWidgetsByOrder(doc.widgets),
          lastUpdated: doc.lastUpdated instanceof Date
            ? doc.lastUpdated
            : new Date(),
        });
      } else {
        onUpdate(DEFAULT_DASHBOARD_LAYOUT);
      }
    },
    onError
  );
};
