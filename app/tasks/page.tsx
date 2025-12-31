'use client';

/**
 * TASKS PAGE
 *
 * This is the main page where users view and manage all their tasks.
 * Features:
 * - View all tasks in a list with filtering options
 * - Add new tasks with the "Add Task" button
 * - Edit existing tasks
 * - Delete tasks with confirmation
 * - Filter by status and priority
 * - Sort by different criteria
 * - Real-time updates (tasks update automatically)
 * - Task statistics (To Do, In Progress, Completed, Overdue)
 *
 * HOW IT WORKS:
 * 1. When the page loads, it fetches all tasks from Firebase
 * 2. Tasks are displayed using the TaskList component
 * 3. Users can filter and sort tasks using dropdowns
 * 4. The "Add Task" button opens a modal with a form
 * 5. When a task is created/updated/deleted, the list refreshes
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserTasks, subscribeToUserTasks } from '@/lib/task-service';
import { Task } from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskList, OverdueAlert } from '@/components/tasks';
import { TaskForm } from '@/components/forms/TaskForm';
import toast, { Toaster } from 'react-hot-toast';

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load tasks when user is available
  useEffect(() => {
    if (!user) return;

    // Initial load
    loadTasks();

    // Set up real-time subscription
    // This means tasks will update automatically when changed
    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to tasks:', error);
        toast.error('Failed to sync tasks');
      }
    );

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Function to load tasks (used for initial load and refresh)
  const loadTasks = async () => {
    if (!user) return;

    try {
      const userTasks = await getUserTasks(user.uid);
      setTasks(userTasks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle editing a task
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setShowCreateModal(true);
  };

  // Handle form success (create or update)
  const handleFormSuccess = () => {
    setShowCreateModal(false);
    setSelectedTask(null);
    // Tasks will auto-refresh due to real-time subscription
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowCreateModal(false);
    setSelectedTask(null);
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{
          textAlign: 'center',
        }}>
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
            Loading tasks...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      <Toaster position="top-right" />

      {/* Page Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
      }}>
        {/* Back to Dashboard */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Dashboard
        </Button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
            My Tasks
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={() => router.push('/tasks/recurring')}
              variant="ghost"
              size="lg"
            >
              Recurring
            </Button>
            <Button
              onClick={() => router.push('/tasks/calendar')}
              variant="ghost"
              size="lg"
            >
              Calendar View
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              + Add Task
            </Button>
          </div>
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
        }}>
          Stay organized and track your progress. Create tasks, set priorities, and never miss a deadline.
        </p>
      </div>

      {/* Tasks List */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Overdue Tasks Alert */}
        {user && (
          <OverdueAlert
            tasks={tasks}
            onTaskClick={handleEdit}
          />
        )}

        {/* Task List */}
        {user && (
          <TaskList
            tasks={tasks}
            userId={user.uid}
            onEdit={handleEdit}
            onUpdate={loadTasks}
          />
        )}
      </div>

      {/* Create/Edit Task Modal */}
      {showCreateModal && user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={handleFormCancel}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
            minHeight: 'fit-content',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}>
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </h2>

            <TaskForm
              userId={user.uid}
              task={selectedTask}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
