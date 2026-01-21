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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      <Toaster position="top-right" />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <Button
            onClick={() => router.push('/tasks')}
            variant="ghost"
            size="sm"
          >
            ← Back to Tasks
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            size="sm"
          >
            Dashboard
          </Button>
        </div>

        {/* Page Header */}
        <div style={{
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            Recurring Tasks
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
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
    </div>
  );
}
