'use client';

/**
 * RECENT ACTIVITY WIDGET
 *
 * Displays recent activity across all modules.
 * Features:
 * - Shows latest journal entries, expenses, tasks, etc.
 * - Unified timeline view
 * - Quick navigation to items
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { subscribeToJournals } from '@/lib/journal-service';
import { subscribeToExpenses } from '@/lib/expense-service';
import { subscribeToTasks } from '@/lib/task-service';
import { Journal, Expense, Task } from '@/types';

interface RecentActivityWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

interface ActivityItem {
  id: string;
  type: 'journal' | 'expense' | 'task';
  title: string;
  subtitle: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ size }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const maxItems = size === 'small' ? 3 : size === 'medium' ? 5 : size === 'large' ? 8 : 12;

  useEffect(() => {
    if (!user) return;

    let journals: Journal[] = [];
    let expenses: Expense[] = [];
    let tasks: Task[] = [];

    const updateActivities = () => {
      const allActivities: ActivityItem[] = [];

      // Add journals
      journals.forEach((j) => {
        const date = j.createdAt instanceof Date ? j.createdAt : j.createdAt.toDate();
        allActivities.push({
          id: `journal-${j.id}`,
          type: 'journal',
          title: j.title,
          subtitle: 'Journal entry',
          timestamp: date,
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          color: '#3b82f6',
          href: `/journals/${j.id}`,
        });
      });

      // Add expenses
      expenses.forEach((e) => {
        const date = e.date instanceof Date ? e.date : e.date.toDate();
        allActivities.push({
          id: `expense-${e.id}`,
          type: 'expense',
          title: e.description,
          subtitle: `$${e.amount.toFixed(2)} - ${e.category}`,
          timestamp: date,
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: '#22c55e',
          href: `/expenses/${e.id}`,
        });
      });

      // Add completed tasks
      tasks.filter(t => t.status === 'completed').forEach((t) => {
        const date = t.completedAt
          ? (t.completedAt instanceof Date ? t.completedAt : t.completedAt.toDate())
          : (t.updatedAt instanceof Date ? t.updatedAt : t.updatedAt.toDate());
        allActivities.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          subtitle: 'Task completed',
          timestamp: date,
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          color: '#f26419',
          href: `/tasks/${t.id}`,
        });
      });

      // Sort by timestamp and limit
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(allActivities.slice(0, maxItems));
      setLoading(false);
    };

    const unsubJournals = subscribeToJournals(
      user.uid,
      (data) => {
        journals = data.slice(0, 10);
        updateActivities();
      },
      console.error
    );

    const unsubExpenses = subscribeToExpenses(
      user.uid,
      (data) => {
        expenses = data.slice(0, 10);
        updateActivities();
      },
      console.error
    );

    const unsubTasks = subscribeToTasks(
      user.uid,
      (data) => {
        tasks = data.slice(0, 10);
        updateActivities();
      },
      console.error
    );

    return () => {
      unsubJournals();
      unsubExpenses();
      unsubTasks();
    };
  }, [user, maxItems]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading activity...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', overflow: 'auto' }}>
      {activities.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            padding: '1rem',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>No recent activity</p>
        </div>
      ) : (
        activities.map((activity, index) => (
          <div
            key={activity.id}
            onClick={() => router.push(activity.href)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              position: 'relative',
            }}
          >
            {/* Timeline dot and line */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `${activity.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activity.color,
                }}
              >
                {activity.icon}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activity.title}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                {activity.subtitle}
              </p>
            </div>

            {/* Timestamp */}
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatTimestamp(activity.timestamp)}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentActivityWidget;
