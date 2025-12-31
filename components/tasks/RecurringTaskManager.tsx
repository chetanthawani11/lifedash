'use client';

/**
 * RECURRING TASK MANAGER COMPONENT
 *
 * Displays and manages all recurring task series.
 * Features:
 * - View all recurring task series
 * - Pause/Resume series
 * - View completion statistics
 * - Edit series configuration
 * - Delete series
 * - View all tasks from a series
 *
 * HOW IT WORKS:
 * 1. Subscribes to real-time updates of recurring series
 * 2. Shows each series as a card with stats
 * 3. Provides controls to manage each series
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RecurringTaskSeries,
  Task,
  formatRecurringPattern,
} from '@/types';
import {
  subscribeToRecurringSeries,
  pauseRecurringSeries,
  resumeRecurringSeries,
  deleteRecurringSeries,
  getTasksFromSeries,
  getRecurringSeriesStats,
} from '@/lib/task-service';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface RecurringTaskManagerProps {
  userId: string;
  onTaskClick?: (taskId: string) => void;
}

export const RecurringTaskManager: React.FC<RecurringTaskManagerProps> = ({
  userId,
  onTaskClick,
}) => {
  const [series, setSeries] = useState<RecurringTaskSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [seriesTasks, setSeriesTasks] = useState<Record<string, Task[]>>({});
  const [stats, setStats] = useState<{
    totalSeries: number;
    activeSeries: number;
    pausedSeries: number;
    totalTasksGenerated: number;
    totalTasksCompleted: number;
    overallCompletionRate: number;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Load overall statistics
  const loadStats = useCallback(async () => {
    try {
      const seriesStats = await getRecurringSeriesStats(userId);
      setStats(seriesStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userId]);

  // Subscribe to recurring series
  useEffect(() => {
    const unsubscribe = subscribeToRecurringSeries(
      userId,
      (updatedSeries) => {
        setSeries(updatedSeries);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to recurring series:', error);
        toast.error('Failed to load recurring tasks');
        setLoading(false);
      }
    );

    // Load stats
    loadStats();

    return () => unsubscribe();
  }, [userId, loadStats]);

  // Handle pause/resume
  const handleTogglePause = async (s: RecurringTaskSeries) => {
    try {
      if (s.isActive) {
        await pauseRecurringSeries(userId, s.id);
        toast.success('Recurring task paused');
      } else {
        await resumeRecurringSeries(userId, s.id);
        toast.success('Recurring task resumed');
      }
      loadStats();
    } catch (error) {
      console.error('Error toggling pause:', error);
      toast.error('Failed to update recurring task');
    }
  };

  // Handle delete
  const handleDelete = async (seriesId: string, deleteInstances: boolean) => {
    try {
      await deleteRecurringSeries(userId, seriesId, deleteInstances);
      toast.success('Recurring task deleted');
      setConfirmDelete(null);
      loadStats();
    } catch (error) {
      console.error('Error deleting series:', error);
      toast.error('Failed to delete recurring task');
    }
  };

  // Load tasks for expanded series
  const handleExpand = async (seriesId: string) => {
    if (expandedSeries === seriesId) {
      setExpandedSeries(null);
      return;
    }

    setExpandedSeries(seriesId);

    if (!seriesTasks[seriesId]) {
      try {
        const tasks = await getTasksFromSeries(userId, seriesId);
        setSeriesTasks((prev) => ({ ...prev, [seriesId]: tasks }));
      } catch (error) {
        console.error('Error loading series tasks:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (timestamp: { toDate?: () => Date } | Date | null | undefined) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp && timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp as Date);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
      }}>
        Loading recurring tasks...
      </div>
    );
  }

  return (
    <div>
      {/* Stats Header */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}>
              {stats.totalSeries}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              Total Series
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: '#22c55e',
            }}>
              {stats.activeSeries}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              Active
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}>
              {stats.totalTasksGenerated}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              Tasks Generated
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--primary-500)',
            }}>
              {stats.overallCompletionRate}%
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              Completion Rate
            </div>
          </div>
        </div>
      )}

      {/* Series List */}
      {series.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}>
            🔄
          </div>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            No Recurring Tasks Yet
          </h3>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            Create a task and enable &quot;Recurring&quot; to set up repeating tasks.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {series.map((s) => {
            const completionRate = s.totalGenerated > 0
              ? Math.round((s.totalCompleted / s.totalGenerated) * 100)
              : 0;
            const isExpanded = expandedSeries === s.id;
            const tasks = seriesTasks[s.id] || [];

            return (
              <div
                key={s.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-sm)',
                  border: s.isActive
                    ? '2px solid var(--primary-200)'
                    : '2px solid var(--border-light)',
                  overflow: 'hidden',
                }}
              >
                {/* Series Header */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleExpand(s.id)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      {/* Title and Status */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>🔄</span>
                        <h3 style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                        }}>
                          {s.title}
                        </h3>
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: '600',
                          backgroundColor: s.isActive
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(107, 114, 128, 0.1)',
                          color: s.isActive ? '#22c55e' : '#6b7280',
                        }}>
                          {s.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>

                      {/* Pattern Info */}
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                      }}>
                        {formatRecurringPattern(s.recurringConfig)}
                      </div>

                      {/* Stats Row */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                      }}>
                        <span>
                          <strong style={{ color: 'var(--text-secondary)' }}>
                            {s.totalGenerated}
                          </strong>{' '}
                          generated
                        </span>
                        <span>
                          <strong style={{ color: '#22c55e' }}>
                            {s.totalCompleted}
                          </strong>{' '}
                          completed
                        </span>
                        <span>
                          <strong style={{ color: 'var(--primary-500)' }}>
                            {completionRate}%
                          </strong>{' '}
                          rate
                        </span>
                      </div>

                      {/* Next Due */}
                      {s.isActive && s.nextDueDate && (
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                        }}>
                          Next: {formatDate(s.nextDueDate)}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                    }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        onClick={() => handleTogglePause(s)}
                        variant="ghost"
                        size="sm"
                      >
                        {s.isActive ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        onClick={() => setConfirmDelete(s.id)}
                        variant="ghost"
                        size="sm"
                        style={{ color: '#ef4444' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '0.5rem',
                    color: 'var(--text-tertiary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {isExpanded ? '▲ Hide history' : '▼ Show history'}
                  </div>
                </div>

                {/* Expanded Content - Task History */}
                {isExpanded && (
                  <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-secondary)',
                  }}>
                    <h4 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem',
                    }}>
                      Task History ({tasks.length} tasks)
                    </h4>

                    {tasks.length === 0 ? (
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                      }}>
                        Loading tasks...
                      </p>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        maxHeight: '300px',
                        overflowY: 'auto',
                      }}>
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => onTaskClick?.(task.id)}
                            style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: 'var(--bg-elevated)',
                              borderRadius: 'var(--radius-lg)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}>
                              <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: task.status === 'completed'
                                  ? '#22c55e'
                                  : task.status === 'in_progress'
                                    ? '#3b82f6'
                                    : '#78716c',
                              }} />
                              <span style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-primary)',
                                textDecoration: task.status === 'completed'
                                  ? 'line-through'
                                  : 'none',
                              }}>
                                {task.title}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-tertiary)',
                            }}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                {confirmDelete === s.id && (
                  <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-light)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  }}>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      marginBottom: '0.75rem',
                    }}>
                      <strong>Delete this recurring task?</strong>
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}>
                      <Button
                        onClick={() => handleDelete(s.id, false)}
                        variant="ghost"
                        size="sm"
                      >
                        Delete Series Only
                      </Button>
                      <Button
                        onClick={() => handleDelete(s.id, true)}
                        variant="ghost"
                        size="sm"
                        style={{ color: '#ef4444' }}
                      >
                        Delete All Tasks Too
                      </Button>
                      <Button
                        onClick={() => setConfirmDelete(null)}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
