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

      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          {getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'there'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
          Here&apos;s your activity overview
        </p>
      </div>

      {/* Goals Section */}
      <div style={{ marginBottom: '2rem' }}>
        <GoalsSection />
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '12px',
                padding: '1.5rem',
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

      {/* Analytics Grid */}
      {!loading && analytics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
          }}
        >
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
