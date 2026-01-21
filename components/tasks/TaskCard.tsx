'use client';

/**
 * TASK CARD COMPONENT
 *
 * Displays a single task with all its information.
 * Features:
 * - Shows title, description, due date, priority, and status
 * - Quick complete/incomplete toggle
 * - Edit and delete buttons
 * - Visual indicators for priority and overdue status
 * - Tags display
 *
 * WHAT EACH PART DOES:
 * - The checkbox lets you quickly mark a task as done/undone
 * - The priority badge shows how important the task is (with colors)
 * - The due date shows when it's due (red if overdue)
 * - Tags are displayed as small colorful pills
 */

import { useState } from 'react';
import { Task, TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, isTaskOverdue, formatMinutes } from '@/types';
import { completeTask, reopenTask, deleteTask } from '@/lib/task-service';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  userId: string;
  onEdit: (task: Task) => void;
  onDelete: () => void;
  onUpdate: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userId,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if task is overdue
  const overdue = isTaskOverdue(task);

  // Get priority info for styling
  const priorityInfo = TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority);
  const statusInfo = TASK_STATUS_OPTIONS.find(s => s.value === task.status);

  // Format due date for display
  const formatDueDate = () => {
    if (!task.dueDate) return null;

    const dueDate = task.dueDate.toDate();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset times for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const dueDateNormalized = new Date(dueDate);
    dueDateNormalized.setHours(0, 0, 0, 0);

    if (dueDateNormalized.getTime() === today.getTime()) {
      return 'Today';
    } else if (dueDateNormalized.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: dueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Handle completing/reopening a task
  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      if (task.status === 'completed') {
        await reopenTask(userId, task.id);
        toast.success('Task reopened');
      } else {
        await completeTask(userId, task.id);
        toast.success('Task completed!');
      }
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting a task
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(userId, task.id);
      toast.success('Task deleted');
      onDelete();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <>
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          transition: 'background-color var(--transition-base)',
          opacity: isCompleted ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}>
          {/* Checkbox for quick complete toggle */}
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isCompleted ? 'var(--success)' : 'var(--border-medium)'}`,
              backgroundColor: isCompleted ? 'var(--success)' : 'transparent',
              cursor: isUpdating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
              transition: 'all var(--transition-base)',
            }}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          {/* Task Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title and Priority Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap',
            }}>
              {/* Task Title */}
              <h3 style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                margin: 0,
              }}>
                {task.title}
              </h3>

              {/* Priority Badge */}
              {priorityInfo && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: '600',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: `${priorityInfo.color}20`,
                  color: priorityInfo.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  {priorityInfo.icon} {priorityInfo.label}
                </span>
              )}

              {/* Recurring Badge */}
              {task.isRecurring && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: '600',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  🔄 Recurring
                </span>
              )}

              {/* Overdue Badge */}
              {overdue && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: '600',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                }}>
                  Overdue
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                margin: '0 0 0.5rem 0',
                lineHeight: '1.5',
              }}>
                {task.description}
              </p>
            )}

            {/* Meta Info Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              flexWrap: 'wrap',
            }}>
              {/* Due Date */}
              {task.dueDate && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: overdue ? '#ef4444' : 'var(--text-tertiary)',
                  fontWeight: overdue ? '500' : 'normal',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {formatDueDate()}
                </span>
              )}

              {/* Category */}
              {task.category && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  {task.category}
                </span>
              )}

              {/* Estimated Time */}
              {task.estimatedMinutes && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {formatMinutes(task.estimatedMinutes)}
                </span>
              )}

              {/* Status (if not completed) */}
              {statusInfo && task.status !== 'completed' && task.status !== 'todo' && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: statusInfo.color,
                  fontWeight: '500',
                }}>
                  {statusInfo.label}
                </span>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.75rem',
                flexWrap: 'wrap',
              }}>
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 'var(--text-xs)',
                      padding: '0.125rem 0.5rem',
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
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexShrink: 0,
          }}>
            <Button
              onClick={() => onEdit(task)}
              variant="ghost"
              size="sm"
            >
              Edit
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="danger"
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={<>Are you sure you want to delete <strong>&ldquo;{task.title}&rdquo;</strong>? This action cannot be undone.</>}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
};
