'use client';

/**
 * TASKS WIDGET
 *
 * Displays task summary and upcoming tasks on the dashboard.
 * Features:
 * - Shows tasks due today/overdue
 * - Quick task completion
 * - Priority indicators
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { subscribeToTasks, updateTask } from '@/lib/task-service';
import { Task, TaskPriority } from '@/types';

interface TasksWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ size }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const maxTasks = size === 'small' ? 3 : size === 'medium' ? 5 : 8;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTasks(
      user.uid,
      (data) => {
        // Filter for incomplete tasks, sort by priority and due date
        const incomplete = data
          .filter(t => t.status !== 'completed')
          .sort((a, b) => {
            // Sort by priority first
            const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Then by due date
            if (a.dueDate && b.dueDate) {
              const aDate = a.dueDate instanceof Date ? a.dueDate : a.dueDate.toDate();
              const bDate = b.dueDate instanceof Date ? b.dueDate : b.dueDate.toDate();
              return aDate.getTime() - bDate.getTime();
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
          });
        setTasks(incomplete.slice(0, maxTasks));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading tasks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, maxTasks]);

  const handleToggleComplete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await updateTask(user.uid, task.id, {
        status: task.status === 'completed' ? 'todo' : 'completed',
        completedAt: task.status === 'completed' ? undefined : new Date(),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const formatDueDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', isOverdue: true };
    if (diffDays === 0) return { text: 'Today', isOverdue: false };
    if (diffDays === 1) return { text: 'Tomorrow', isOverdue: false };
    return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isOverdue: false };
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'var(--error)';
      case 'high': return 'var(--warning-500)';
      case 'medium': return 'var(--primary-500)';
      case 'low': return 'var(--text-tertiary)';
    }
  };

  const getOverdueCount = () => {
    const now = new Date();
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = t.dueDate instanceof Date ? t.dueDate : t.dueDate.toDate();
      return d < now && t.status !== 'completed';
    }).length;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading tasks...</div>
      </div>
    );
  }

  const overdueCount = getOverdueCount();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Task Summary */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: overdueCount > 0 ? 'var(--error-50)' : 'var(--success-50)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Pending</p>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              color: overdueCount > 0 ? 'var(--error)' : 'var(--success-600)',
              margin: '0.25rem 0 0',
            }}
          >
            {tasks.length}
          </p>
        </div>
        {overdueCount > 0 && (
          <div
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'var(--error-50)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Overdue</p>
            <p
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '700',
                color: 'var(--error)',
                margin: '0.25rem 0 0',
              }}
            >
              {overdueCount}
            </p>
          </div>
        )}
      </div>

      {/* Quick Add Button */}
      <button
        onClick={() => router.push('/tasks/new')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'var(--primary-50)',
          border: '1px dashed var(--primary-300)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--primary-600)',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          transition: 'all var(--transition-fast)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Task
      </button>

      {/* Task List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'auto' }}>
        {tasks.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>All caught up!</p>
          </div>
        ) : (
          tasks.map((task) => {
            const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
            return (
              <div
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => handleToggleComplete(task, e)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: `2px solid ${getPriorityColor(task.priority)}`,
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {task.status === 'completed' && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={getPriorityColor(task.priority)} stroke={getPriorityColor(task.priority)} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* Task Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.title}
                  </p>
                  {dueInfo && (
                    <p
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: dueInfo.isOverdue ? 'var(--error)' : 'var(--text-tertiary)',
                        margin: 0,
                        fontWeight: dueInfo.isOverdue ? '600' : '400',
                      }}
                    >
                      {dueInfo.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Link */}
      <button
        onClick={() => router.push('/tasks')}
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--primary-600)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '0.25rem',
        }}
      >
        View all tasks →
      </button>
    </div>
  );
};

export default TasksWidget;
