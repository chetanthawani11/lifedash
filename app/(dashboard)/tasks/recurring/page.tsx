'use client';

/**
 * RECURRING TASKS PAGE
 *
 * Displays and manages all recurring task series.
 * Features:
 * - View all recurring task series
 * - Pause/Resume series
 * - View completion statistics
 * - Delete series
 *
 * HOW TO ACCESS:
 * Navigate to /tasks/recurring from the tasks list
 */

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { RecurringTaskManager } from '@/components/tasks';
import { Toaster } from 'react-hot-toast';

export default function RecurringTasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Loading state
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 0.75rem',
          }} />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Recurring Tasks
          </h1>
        </div>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Manage your repeating tasks and view their completion history.
        </p>
      </div>

      {/* Recurring Task Manager */}
      {user && (
        <RecurringTaskManager
          userId={user.uid}
          onTaskClick={handleTaskClick}
        />
      )}
    </div>
  );
}
