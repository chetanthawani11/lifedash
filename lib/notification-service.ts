/**
 * NOTIFICATION SERVICE
 *
 * Handles browser push notifications for LifeDash.
 *
 * Features:
 * - Request notification permission
 * - Show notifications for reminders, goals, etc.
 * - Store notification preferences
 *
 * Note: This uses the Web Notifications API which works
 * even without Firebase Cloud Messaging for basic notifications.
 */

// Types for notification preferences
export interface NotificationPreferences {
  enabled: boolean;
  taskReminders: boolean;
  goalReminders: boolean;
  dailySummary: boolean;
  flashcardReminders: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  taskReminders: true,
  goalReminders: true,
  dailySummary: false,
  flashcardReminders: true,
};

// Storage key
const PREFS_KEY = 'lifedash_notification_prefs';

/**
 * Check if notifications are supported
 */
export function areNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!areNotificationsSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!areNotificationsSupported()) {
    console.warn('Notifications not supported in this browser');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Get notification preferences from localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save notification preferences to localStorage
 */
export function saveNotificationPreferences(prefs: Partial<NotificationPreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

/**
 * Show a notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): Promise<Notification | null> {
  if (!areNotificationsSupported()) {
    console.warn('Notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  const prefs = getNotificationPreferences();
  if (!prefs.enabled) {
    console.log('Notifications disabled by user');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      ...options,
    });

    // Handle click
    if (options?.onClick) {
      notification.onclick = () => {
        options.onClick?.();
        notification.close();
      };
    }

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

/**
 * Show a task reminder notification
 */
export function showTaskReminder(taskTitle: string, dueTime?: string): Promise<Notification | null> {
  const prefs = getNotificationPreferences();
  if (!prefs.taskReminders) return Promise.resolve(null);

  return showNotification('Task Reminder', {
    body: dueTime ? `"${taskTitle}" is due ${dueTime}` : `Don't forget: "${taskTitle}"`,
    tag: 'task-reminder',
    requireInteraction: true,
    onClick: () => {
      window.focus();
      window.location.href = '/tasks';
    },
  });
}

/**
 * Show a goal progress notification
 */
export function showGoalReminder(goalTitle: string, progress: number): Promise<Notification | null> {
  const prefs = getNotificationPreferences();
  if (!prefs.goalReminders) return Promise.resolve(null);

  const message =
    progress >= 100
      ? `Congratulations! You've completed your goal: "${goalTitle}"`
      : `Keep going! You're ${progress}% towards your goal: "${goalTitle}"`;

  return showNotification('Goal Update', {
    body: message,
    tag: 'goal-reminder',
    onClick: () => {
      window.focus();
      window.location.href = '/dashboard';
    },
  });
}

/**
 * Show a flashcard study reminder
 */
export function showFlashcardReminder(cardsCount: number): Promise<Notification | null> {
  const prefs = getNotificationPreferences();
  if (!prefs.flashcardReminders) return Promise.resolve(null);

  return showNotification('Time to Study!', {
    body: `You have ${cardsCount} flashcard${cardsCount === 1 ? '' : 's'} due for review`,
    tag: 'flashcard-reminder',
    onClick: () => {
      window.focus();
      window.location.href = '/flashcards';
    },
  });
}

/**
 * Show a daily summary notification
 */
export function showDailySummary(summary: {
  tasksCompleted: number;
  tasksPending: number;
  expenses: number;
}): Promise<Notification | null> {
  const prefs = getNotificationPreferences();
  if (!prefs.dailySummary) return Promise.resolve(null);

  const body = [
    `${summary.tasksCompleted} tasks completed`,
    `${summary.tasksPending} tasks pending`,
    `$${summary.expenses.toFixed(2)} spent today`,
  ].join(' • ');

  return showNotification('Daily Summary', {
    body,
    tag: 'daily-summary',
    onClick: () => {
      window.focus();
      window.location.href = '/dashboard';
    },
  });
}
