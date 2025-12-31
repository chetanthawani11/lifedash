'use client';

/**
 * TASK DETAIL PAGE
 *
 * Shows a single task with all its details.
 * Features:
 * - Full task information display
 * - Edit task button opens edit form
 * - Delete task with confirmation
 * - Mark as complete/incomplete
 * - Track time spent (actual minutes)
 * - Navigation back to tasks list
 *
 * HOW IT WORKS:
 * 1. Gets the taskId from the URL (e.g., /tasks/abc123)
 * 2. Fetches the task data from Firebase
 * 3. Displays all task information
 * 4. Provides actions to edit, delete, or complete the task
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTask, completeTask, reopenTask, deleteTask } from '@/lib/task-service';
import {
  Task,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  isTaskOverdue,
  formatMinutes,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskForm } from '@/components/forms/TaskForm';
import toast, { Toaster } from 'react-hot-toast';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;
  const { user, loading: authLoading } = useAuth();

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // State for completion with time tracking
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actualMinutes, setActualMinutes] = useState('');

  // Load task when user and taskId are available
  useEffect(() => {
    if (!user || !taskId) return;
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, taskId]);

  // Function to load task
  const loadTask = async () => {
    if (!user) return;

    try {
      const taskData = await getTask(user.uid, taskId);
      if (taskData) {
        setTask(taskData);
      } else {
        toast.error('Task not found');
        router.push('/tasks');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task');
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle completing a task
  const handleComplete = async () => {
    if (!user || !task) return;

    setIsUpdating(true);
    try {
      await completeTask(user.uid, task.id, {
        actualMinutes: actualMinutes ? parseInt(actualMinutes) : null,
      });
      toast.success('Task completed!');
      setShowCompleteModal(false);
      loadTask();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle reopening a task
  const handleReopen = async () => {
    if (!user || !task) return;

    setIsUpdating(true);
    try {
      await reopenTask(user.uid, task.id);
      toast.success('Task reopened');
      loadTask();
    } catch (error) {
      console.error('Error reopening task:', error);
      toast.error('Failed to reopen task');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting a task
  const handleDelete = async () => {
    if (!user || !task) return;

    try {
      await deleteTask(user.uid, task.id);
      toast.success('Task deleted');
      router.push('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
    setShowDeleteConfirm(false);
  };

  // Get display info
  const priorityInfo = task ? TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority) : null;
  const statusInfo = task ? TASK_STATUS_OPTIONS.find(s => s.value === task.status) : null;
  const overdue = task ? isTaskOverdue(task) : false;

  // Format date for display
  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            Loading task...
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
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
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
          }}>
            Task not found
          </div>
          <Button
            onClick={() => router.push('/tasks')}
            variant="primary"
            size="lg"
            style={{ marginTop: '1rem' }}
          >
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = task.status === 'completed';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      <Toaster position="top-right" />

      {/* Page Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Back Button */}
        <Button
          onClick={() => router.push('/tasks')}
          variant="ghost"
          size="sm"
          style={{ marginBottom: '1.5rem' }}
        >
          ← Back to Tasks
        </Button>

        {/* Main Card */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Header with Title and Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1 }}>
              {/* Title */}
              <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                textDecoration: isCompleted ? 'line-through' : 'none',
                opacity: isCompleted ? 0.7 : 1,
              }}>
                {task.title}
              </h1>

              {/* Badges */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}>
                {/* Status Badge */}
                {statusInfo && (
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${statusInfo.color}20`,
                    color: statusInfo.color,
                  }}>
                    {statusInfo.label}
                  </span>
                )}

                {/* Priority Badge */}
                {priorityInfo && (
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: `${priorityInfo.color}20`,
                    color: priorityInfo.color,
                  }}>
                    {priorityInfo.icon} {priorityInfo.label}
                  </span>
                )}

                {/* Overdue Badge */}
                {overdue && (
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                  }}>
                    Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
            }}>
              <Button
                onClick={() => setShowEditModal(true)}
                variant="ghost"
                size="md"
              >
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                size="md"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Description
              </h3>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}>
                {task.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            {/* Due Date */}
            {task.dueDate && (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Due Date
                </h3>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: overdue ? '#ef4444' : 'var(--text-primary)',
                  fontWeight: overdue ? '600' : 'normal',
                }}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            )}

            {/* Category */}
            {task.category && (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Category
                </h3>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                }}>
                  {task.category}
                </p>
              </div>
            )}

            {/* Estimated Time */}
            {task.estimatedMinutes && (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Estimated Time
                </h3>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                }}>
                  {formatMinutes(task.estimatedMinutes)}
                </p>
              </div>
            )}

            {/* Actual Time (if completed) */}
            {task.actualMinutes && (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Actual Time
                </h3>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-primary)',
                }}>
                  {formatMinutes(task.actualMinutes)}
                </p>
              </div>
            )}

            {/* Created Date */}
            <div>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Created
              </h3>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
              }}>
                {formatDate(task.createdAt)}
              </p>
            </div>

            {/* Completed Date */}
            {task.completedAt && (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Completed
                </h3>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: '#22c55e',
                }}>
                  {formatDate(task.completedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-tertiary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Tags
              </h3>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}>
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 'var(--text-sm)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      fontWeight: '500',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Complete/Reopen Button */}
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.5rem',
            display: 'flex',
            gap: '1rem',
          }}>
            {isCompleted ? (
              <Button
                onClick={handleReopen}
                variant="secondary"
                size="lg"
                disabled={isUpdating}
              >
                {isUpdating ? 'Reopening...' : 'Reopen Task'}
              </Button>
            ) : (
              <Button
                onClick={() => setShowCompleteModal(true)}
                variant="primary"
                size="lg"
                disabled={isUpdating}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
          onClick={() => setShowCompleteModal(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              Complete Task
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}>
              How long did this task actually take? (Optional)
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <input
                  type="number"
                  value={actualMinutes}
                  onChange={(e) => setActualMinutes(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="10080"
                  style={{
                    width: '120px',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--border-light)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-base)',
                  }}
                />
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                }}>
                  minutes
                </span>
              </div>
              {task.estimatedMinutes && (
                <p style={{
                  marginTop: '0.5rem',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                }}>
                  Estimated: {formatMinutes(task.estimatedMinutes)}
                </p>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <Button
                onClick={() => setShowCompleteModal(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                variant="primary"
                size="lg"
                fullWidth
                disabled={isUpdating}
              >
                {isUpdating ? 'Completing...' : 'Complete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              Delete Task?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                size="lg"
                fullWidth
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && user && (
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
          onClick={() => setShowEditModal(false)}
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
              Edit Task
            </h2>

            <TaskForm
              userId={user.uid}
              task={task}
              onSuccess={() => {
                setShowEditModal(false);
                loadTask();
              }}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
