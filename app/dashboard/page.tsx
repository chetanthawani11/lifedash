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
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
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

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Toaster position="top-right" />

      {/* Achievement Notifications */}
      <AchievementNotifications />

      {/* Header with Navigation */}
      <header
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                }}
              >
                L
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                LifeDash
              </span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link href="/journals">
              <Button variant="ghost" size="sm">Journals</Button>
            </Link>
            <Link href="/expenses">
              <Button variant="ghost" size="sm">Expenses</Button>
            </Link>
            <Link href="/flashcards">
              <Button variant="ghost" size="sm">Flashcards</Button>
            </Link>
            <Link href="/tasks">
              <Button variant="ghost" size="sm">Tasks</Button>
            </Link>
          </nav>

          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Button>
            </Link>
            <Button onClick={handleSignOut} variant="secondary" size="sm">Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
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
                  height: '300px',
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
                    height: '200px',
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
            {/* Journal Activity */}
            <JournalActivityChart data={analytics.journal} />

            {/* Expense Tracking */}
            <ExpenseChart data={analytics.expense} />

            {/* Learning Progress */}
            <LearningProgressChart data={analytics.learning} />

            {/* Task Productivity */}
            <TaskCompletionChart data={analytics.task} />
          </div>
        )}
      </main>

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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
