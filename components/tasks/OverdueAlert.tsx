'use client';

/**
 * OVERDUE ALERT COMPONENT
 *
 * Displays a warning banner when there are overdue tasks.
 * Features:
 * - Shows count of overdue tasks
 * - Lists the overdue tasks with due dates
 * - Click to navigate to the task
 * - Can be dismissed temporarily
 * - Eye-catching red/orange design
 *
 * WHAT IT DOES:
 * - Filters tasks to find overdue ones
 * - Shows an alert banner at the top of the page
 * - Helps users see what needs immediate attention
 */

import { useState } from 'react';
import { Task, isTaskOverdue, TASK_PRIORITY_OPTIONS } from '@/types';
import { Button } from '@/components/ui/Button';

interface OverdueAlertProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const OverdueAlert: React.FC<OverdueAlertProps> = ({
  tasks,
  onTaskClick,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => isTaskOverdue(task));

  // Don't render if no overdue tasks or dismissed
  if (overdueTasks.length === 0 || isDismissed) {
    return null;
  }

  // Calculate how overdue each task is
  const getOverdueDays = (task: Task): number => {
    if (!task.dueDate) return 0;
    const now = new Date();
    const dueDate = task.dueDate.toDate();
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Sort by most overdue first
  const sortedOverdueTasks = [...overdueTasks].sort((a, b) => {
    return getOverdueDays(b) - getOverdueDays(a);
  });

  // Format overdue text
  const formatOverdue = (days: number): string => {
    if (days === 1) return '1 day overdue';
    if (days < 7) return `${days} days overdue`;
    if (days < 14) return '1 week overdue';
    if (days < 30) return `${Math.floor(days / 7)} weeks overdue`;
    return `${Math.floor(days / 30)} month(s) overdue`;
  };

  return (
    <div style={{
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '2px solid rgba(239, 68, 68, 0.3)',
      borderRadius: 'var(--radius-xl)',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      {/* Alert Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          {/* Warning Icon */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
          }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div>
            <h3 style={{
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              color: '#ef4444',
              marginBottom: '0.125rem',
            }}>
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              {overdueTasks.length === 1
                ? 'This task needs your attention!'
                : 'These tasks need your attention!'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
        }}>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
          >
            {isExpanded ? 'Hide' : 'Show'} Tasks
          </Button>
          <Button
            onClick={() => setIsDismissed(true)}
            variant="ghost"
            size="sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Dismiss
          </Button>
        </div>
      </div>

      {/* Expanded Task List */}
      {isExpanded && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {sortedOverdueTasks.map(task => {
              const overdueDays = getOverdueDays(task);
              const priorityInfo = TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority);

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    {/* Priority Dot */}
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: priorityInfo?.color || '#78716c',
                    }} />

                    <div>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                      }}>
                        {task.title}
                      </div>
                      {task.category && (
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}>
                          {task.category}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                    }}>
                      {formatOverdue(overdueDays)}
                    </span>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-tertiary)"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
