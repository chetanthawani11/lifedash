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
            Loading calendar...
          </div>
        </div>
      </div>
    );
  }

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
            Task Calendar
          </h1>

          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setShowCreateModal(true);
            }}
            variant="primary"
            size="sm"
          >
            Add Task
          </Button>
        </div>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          View and manage your tasks by date
        </p>
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
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
      }}>
        <h3 style={{
          fontSize: 'var(--text-xs)',
          fontWeight: '600',
          color: 'var(--text-tertiary)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Priority Colors
        </h3>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#78716c' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Low</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Medium</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Urgent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Completed</span>
          </div>
        </div>
      </div>

      {/* Task Detail/Edit Modal */}
      {showTaskModal && selectedTask && user && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
          onClick={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <h2 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                Edit Task
              </h2>
              <Button
                onClick={() => router.push(`/tasks/${selectedTask.id}`)}
                variant="ghost"
                size="sm"
              >
                Full Details
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
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
          onClick={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              New Task
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
