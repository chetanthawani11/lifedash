'use client';

/**
 * NOTIFICATION SETTINGS COMPONENT
 *
 * Allows users to manage their notification preferences.
 * Matches the style of other settings sections.
 */

import { useState, useEffect } from 'react';
import {
  areNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences,
  showNotification,
  NotificationPreferences,
} from '@/lib/notification-service';
import toast from 'react-hot-toast';

export const NotificationSettings: React.FC = () => {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    enabled: false,
    taskReminders: true,
    goalReminders: true,
    dailySummary: false,
    flashcardReminders: true,
  });
  const [loading, setLoading] = useState(false);

  // Load initial state
  useEffect(() => {
    setSupported(areNotificationsSupported());
    setPermission(getNotificationPermission());
    setPrefs(getNotificationPreferences());
  }, []);

  // Request permission
  const handleRequestPermission = async () => {
    setLoading(true);
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === 'granted') {
      setPrefs((p) => {
        const updated = { ...p, enabled: true };
        saveNotificationPreferences(updated);
        return updated;
      });
      toast.success('Notifications enabled!');

      // Show a welcome notification
      await showNotification('LifeDash Notifications', {
        body: 'You will now receive reminders and updates!',
      });
    } else if (result === 'denied') {
      toast.error('Permission denied. Enable in browser settings.');
    }

    setLoading(false);
  };

  // Toggle preference
  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs((p) => {
      const updated = { ...p, [key]: !p[key] };
      saveNotificationPreferences(updated);
      return updated;
    });
  };

  if (!supported) {
    return (
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            Notifications
          </h2>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}
          >
            Your browser does not support notifications
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}
        >
          Notifications
        </h2>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
          }}
        >
          Get reminders for tasks, goals, and study sessions
        </p>
      </div>

      {/* Permission not granted */}
      {permission !== 'granted' && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 0.25rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
              }}
            >
              {permission === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
            </p>
            <p
              style={{
                margin: 0,
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {permission === 'denied'
                ? 'Please enable in your browser settings'
                : 'Allow LifeDash to send you reminders'}
            </p>
          </div>
          {permission !== 'denied' && (
            <button
              onClick={handleRequestPermission}
              disabled={loading}
              style={{
                backgroundColor: 'var(--primary-500)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: 'var(--text-sm)',
                opacity: loading ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Requesting...' : 'Allow Notifications'}
            </button>
          )}
        </div>
      )}

      {/* Preferences toggles - only show when permission granted */}
      {permission === 'granted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Master toggle */}
          <ToggleRow
            label="Allow Notifications"
            description="Receive reminders and updates"
            checked={prefs.enabled}
            onChange={() => handleToggle('enabled')}
          />

          {prefs.enabled && (
            <>
              <div
                style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1rem',
                }}
              />

              <ToggleRow
                label="Task Reminders"
                description="Get notified about upcoming and due tasks"
                checked={prefs.taskReminders}
                onChange={() => handleToggle('taskReminders')}
              />

              <ToggleRow
                label="Goal Progress"
                description="Updates on your goal achievements"
                checked={prefs.goalReminders}
                onChange={() => handleToggle('goalReminders')}
              />

              <ToggleRow
                label="Flashcard Reviews"
                description="Reminders when cards are due for review"
                checked={prefs.flashcardReminders}
                onChange={() => handleToggle('flashcardReminders')}
              />

              <ToggleRow
                label="Daily Summary"
                description="End of day activity summary"
                checked={prefs.dailySummary}
                onChange={() => handleToggle('dailySummary')}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};

// Toggle row component
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onChange }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
    }}
  >
    <div style={{ flex: 1 }}>
      <p
        style={{
          margin: '0 0 0.1rem',
          fontWeight: '500',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-xs)',
        }}
      >
        {description}
      </p>
    </div>
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked ? 'var(--primary-500)' : 'var(--neutral-200)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  </div>
);

export default NotificationSettings;
