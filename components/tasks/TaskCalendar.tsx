'use client';

/**
 * TASK CALENDAR COMPONENT
 *
 * Displays tasks in a monthly calendar view.
 * Features:
 * - Monthly navigation (previous/next month)
 * - Tasks shown on their due dates
 * - Color-coded by priority
 * - Click on a day to see tasks for that day
 * - Click on a task to view/edit it
 * - Today is highlighted
 * - Overdue tasks are marked in red
 *
 * HOW IT WORKS:
 * 1. Generates a grid of days for the current month
 * 2. Places tasks on their due date cells
 * 3. Users can navigate between months
 * 4. Clicking a task opens a detail modal
 */

import { useState, useMemo } from 'react';
import { Task, TASK_PRIORITY_OPTIONS, isTaskOverdue } from '@/types';
import { Button } from '@/components/ui/Button';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

// Days of the week header
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onTaskClick,
  onDateClick,
}) => {
  // Current viewing month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // First day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Add empty slots for days before the first day of the month
    const startingDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    // Add empty slots to complete the last week (optional, for visual consistency)
    const remainingSlots = 7 - (days.length % 7);
    if (remainingSlots < 7) {
      for (let i = 0; i < remainingSlots; i++) {
        days.push(null);
      }
    }

    return days;
  }, [currentMonth, currentYear]);

  // Group tasks by date (YYYY-MM-DD format)
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach(task => {
      if (task.dueDate) {
        const date = task.dueDate.toDate();
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return tasksByDate[dateKey] || [];
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  // Get priority color for a task
  const getPriorityColor = (priority: string) => {
    const priorityInfo = TASK_PRIORITY_OPTIONS.find(p => p.value === priority);
    return priorityInfo?.color || '#78716c';
  };

  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div style={{
      backgroundColor: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      {/* Calendar Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Month/Year Title */}
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: '700',
          color: 'var(--text-primary)',
        }}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
        }}>
          <Button onClick={goToPreviousMonth} variant="ghost" size="sm">
            ← Prev
          </Button>
          <Button onClick={goToToday} variant="ghost" size="sm">
            Today
          </Button>
          <Button onClick={goToNextMonth} variant="ghost" size="sm">
            Next →
          </Button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {DAYS_OF_WEEK.map(day => (
          <div
            key={day}
            style={{
              padding: '0.75rem',
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
      }}>
        {calendarDays.map((date, index) => {
          if (!date) {
            // Empty cell for days outside the month
            return (
              <div
                key={`empty-${index}`}
                style={{
                  minHeight: '100px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--border-light)' : 'none',
                  borderBottom: '1px solid var(--border-light)',
                }}
              />
            );
          }

          const dayTasks = getTasksForDate(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              style={{
                minHeight: '100px',
                padding: '0.5rem',
                backgroundColor: selected
                  ? 'var(--primary-50)'
                  : today
                    ? 'rgba(242, 100, 25, 0.05)'
                    : 'var(--bg-primary)',
                borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--border-light)' : 'none',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.backgroundColor = today
                    ? 'rgba(242, 100, 25, 0.05)'
                    : 'var(--bg-primary)';
                }
              }}
            >
              {/* Day Number */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '0.25rem',
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: 'var(--text-sm)',
                  fontWeight: today ? '700' : '500',
                  color: today ? 'white' : 'var(--text-primary)',
                  backgroundColor: today ? 'var(--primary-500)' : 'transparent',
                }}>
                  {date.getDate()}
                </span>
              </div>

              {/* Tasks for this day (show up to 3) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}>
                {dayTasks.slice(0, 3).map(task => {
                  const overdue = isTaskOverdue(task);
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: overdue && !isCompleted
                          ? 'rgba(239, 68, 68, 0.15)'
                          : `${getPriorityColor(task.priority)}15`,
                        color: overdue && !isCompleted
                          ? '#ef4444'
                          : getPriorityColor(task.priority),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.6 : 1,
                        cursor: 'pointer',
                        transition: 'transform var(--transition-base)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {task.title}
                    </div>
                  );
                })}

                {/* Show "+X more" if there are more than 3 tasks */}
                {dayTasks.length > 3 && (
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    paddingLeft: '6px',
                  }}>
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Tasks Panel */}
      {selectedDate && (
        <div style={{
          padding: '1.5rem',
          borderTop: '2px solid var(--border-light)',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}>
            Tasks for {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>

          {selectedDateTasks.length === 0 ? (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              No tasks scheduled for this day.
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              {selectedDateTasks.map(task => {
                const overdue = isTaskOverdue(task);
                const isCompleted = task.status === 'completed';
                const priorityInfo = TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      border: overdue && !isCompleted
                        ? '2px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}>
                      {/* Completion indicator */}
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted
                          ? '#22c55e'
                          : priorityInfo?.color || '#78716c',
                      }} />

                      <div>
                        <div style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          opacity: isCompleted ? 0.7 : 1,
                        }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-tertiary)',
                            marginTop: '2px',
                          }}>
                            {task.description.substring(0, 50)}
                            {task.description.length > 50 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      {overdue && !isCompleted && (
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
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: '600',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: `${priorityInfo?.color}20`,
                        color: priorityInfo?.color,
                      }}>
                        {priorityInfo?.icon} {priorityInfo?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
