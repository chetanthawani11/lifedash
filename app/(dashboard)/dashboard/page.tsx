'use client';

/**
 * MAIN DASHBOARD PAGE
 *
 * Dashboard with analytics widgets and goal tracking showing:
 * - Journal activity and writing streaks
 * - Expense tracking and spending patterns
 * - Learning progress and study statistics
 * - Task productivity and completion rates
 * - Goal tracking with progress indicators
 * - Achievement notifications
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import {
  JournalActivityChart,
  ExpenseChart,
  LearningProgressChart,
  TaskCompletionChart,
} from '@/components/analytics';
import {
  GoalsSection,
  AchievementNotifications,
} from '@/components/goals';
import {
  getDashboardAnalytics,
  DashboardAnalytics,
} from '@/lib/analytics-service';

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const data = await getDashboardAnalytics(user.uid);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.uid]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Achievement Notifications */}
      <AchievementNotifications />

      {/* Welcome - Responsive margin */}
      <div style={{ marginBottom: 'var(--spacing-responsive)' }}>
        <h1 style={{ fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          {getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'there'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
          Here&apos;s your activity overview
        </p>
      </div>

      {/* Goals Section - Responsive margin */}
      <div style={{ marginBottom: 'var(--spacing-responsive)' }}>
        <GoalsSection />
      </div>

      {/* Loading State - Uses responsive-grid CSS class */}
      {loading && (
        <div className="responsive-grid">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '12px',
                padding: 'var(--spacing-responsive)',
                height: '200px',
                animation: 'pulse 2s infinite',
              }}
            >
              <div
                style={{
                  height: '16px',
                  width: '40%',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                }}
              />
              <div
                style={{
                  height: '120px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Analytics Grid - Uses responsive-grid CSS class */}
      {/* On mobile: 1 column, On desktop: 2 columns */}
      {!loading && analytics && (
        <div className="responsive-grid">
          <JournalActivityChart data={analytics.journal} />
          <ExpenseChart data={analytics.expense} />
          <LearningProgressChart data={analytics.learning} />
          <TaskCompletionChart data={analytics.task} />
        </div>
      )}

      {/* CSS for loading animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
