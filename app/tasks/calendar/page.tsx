'use client';

/**
 * TASKS CALENDAR PAGE
 *
 * Shows tasks in a calendar view for better scheduling.
 * Features:
 * - Monthly calendar with tasks on due dates
 * - Click on a day to see all tasks for that day
 * - Click on a task to view/edit it
 * - Navigate between months
 * - Quick add task for selected date
 * - Overdue task highlighting
 *
 * HOW TO USE:
 * 1. Navigate with "Prev" and "Next" buttons
 * 2. Click on a day to see tasks
 * 3. Click on a task to open detail/edit modal
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserTasks, subscribeToUserTasks } from '@/lib/task-service';
import { Task } from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskCalendar, OverdueAlert } from '@/components/tasks';
import { TaskForm } from '@/components/forms/TaskForm';
import toast, { Toaster } from 'react-hot-toast';

export default function TasksCalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load tasks
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to tasks:', error);
        toast.error('Failed to sync tasks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Handle date click (to create task on that date)
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
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
            Loading calendar...
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

      <div style={{
        maxWidth: '1400px',
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
            ← Back to List View
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              Task Calendar
            </h1>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
            }}>
              View and manage your tasks by date
            </p>
          </div>

          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setShowCreateModal(true);
            }}
            variant="primary"
            size="lg"
          >
            + Add Task
          </Button>
        </div>

        {/* Overdue Tasks Alert */}
        <OverdueAlert
          tasks={tasks}
          onTaskClick={handleTaskClick}
        />

        {/* Calendar */}
        <TaskCalendar
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onDateClick={handleDateClick}
        />

        {/* Legend */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
          }}>
            Priority Colors
          </h3>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#78716c' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Low</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Medium</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f97316' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>High</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Urgent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail/Edit Modal */}
      {showTaskModal && selectedTask && user && (
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
          onClick={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
              }}>
                Edit Task
              </h2>
              <Button
                onClick={() => router.push(`/tasks/${selectedTask.id}`)}
                variant="ghost"
                size="sm"
              >
                View Full Details →
              </Button>
            </div>

            <TaskForm
              userId={user.uid}
              task={selectedTask}
              onSuccess={() => {
                setShowTaskModal(false);
                setSelectedTask(null);
                toast.success('Task updated!');
              }}
              onCancel={() => {
                setShowTaskModal(false);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Create Task Modal */}
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
          onClick={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}>
              Create New Task
              {selectedDate && (
                <span style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'normal',
                  color: 'var(--text-secondary)',
                  marginTop: '0.25rem',
                }}>
                  Due: {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </h2>

            <TaskForm
              userId={user.uid}
              onSuccess={() => {
                setShowCreateModal(false);
                setSelectedDate(null);
                toast.success('Task created!');
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedDate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
