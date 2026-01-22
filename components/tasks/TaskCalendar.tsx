'use client';

/**
 * TASK CALENDAR COMPONENT (Mobile Responsive)
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
 * Mobile Optimizations:
 * - Compact cell heights on mobile
 * - Shorter day names (S M T W T F S)
 * - Touch-friendly tap targets
 * - Horizontal scrolling if needed
 * - Selected date panel at bottom
 */

import { useState, useMemo, useEffect } from 'react';
import { Task, TASK_PRIORITY_OPTIONS, isTaskOverdue } from '@/types';
import { Button } from '@/components/ui/Button';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

// Days of the week - full names for desktop
const DAYS_OF_WEEK_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Days of the week - short names for mobile
const DAYS_OF_WEEK_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Short month names for mobile
const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onTaskClick,
  onDateClick,
}) => {
  // Current viewing month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Day names based on screen size
  const dayNames = isMobile ? DAYS_OF_WEEK_SHORT : DAYS_OF_WEEK_FULL;
  const monthName = isMobile ? MONTH_NAMES_SHORT[currentMonth] : MONTH_NAMES[currentMonth];

  return (
    <div style={{
      backgroundColor: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      {/* Calendar Header - Responsive */}
      <div style={{
        padding: isMobile ? '1rem' : '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '0.75rem',
      }}>
        {/* Month/Year Title */}
        <h2 style={{
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          fontWeight: '700',
          color: 'var(--text-primary)',
          textAlign: isMobile ? 'center' : 'left',
        }}>
          {monthName} {currentYear}
        </h2>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
        }}>
          <Button onClick={goToPreviousMonth} variant="ghost" size="sm">
            {isMobile ? '←' : '← Prev'}
          </Button>
          <Button onClick={goToToday} variant="ghost" size="sm">
            Today
          </Button>
          <Button onClick={goToNextMonth} variant="ghost" size="sm">
            {isMobile ? '→' : 'Next →'}
          </Button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {dayNames.map((day, index) => (
          <div
            key={`${day}-${index}`}
            style={{
              padding: isMobile ? '0.5rem' : '0.75rem',
              textAlign: 'center',
              fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-sm)',
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
                  minHeight: isMobile ? '60px' : '100px',
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
          const hasOverdue = dayTasks.some(t => isTaskOverdue(t) && t.status !== 'completed');

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              style={{
                minHeight: isMobile ? '60px' : '100px',
                padding: isMobile ? '0.25rem' : '0.5rem',
                backgroundColor: selected
                  ? 'var(--primary-50)'
                  : today
                    ? 'rgba(242, 100, 25, 0.05)'
                    : 'var(--bg-primary)',
                borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--border-light)' : 'none',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-base)',
                position: 'relative',
              }}
            >
              {/* Day Number */}
              <div style={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                marginBottom: '0.125rem',
              }}>
                <span style={{
                  width: isMobile ? '24px' : '28px',
                  height: isMobile ? '24px' : '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-sm)',
                  fontWeight: today ? '700' : '500',
                  color: today ? 'white' : 'var(--text-primary)',
                  backgroundColor: today ? 'var(--primary-500)' : 'transparent',
                }}>
                  {date.getDate()}
                </span>
              </div>

              {/* Task indicators for mobile (dots) */}
              {isMobile && dayTasks.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2px',
                  flexWrap: 'wrap',
                  marginTop: '2px',
                }}>
                  {dayTasks.slice(0, 3).map(task => {
                    const overdue = isTaskOverdue(task);
                    const isCompleted = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted
                            ? '#22c55e'
                            : overdue
                              ? '#ef4444'
                              : getPriorityColor(task.priority),
                        }}
                      />
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span style={{
                      fontSize: '8px',
                      color: 'var(--text-tertiary)',
                    }}>
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Tasks for this day - Desktop only (show up to 3) */}
              {!isMobile && (
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
              )}

              {/* Overdue indicator */}
              {hasOverdue && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Tasks Panel */}
      {selectedDate && (
        <div style={{
          padding: isMobile ? '1rem' : '1.5rem',
          borderTop: '2px solid var(--border-light)',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: isMobile ? 'short' : 'long',
              month: isMobile ? 'short' : 'long',
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
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      border: overdue && !isCompleted
                        ? '2px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
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
                        flexShrink: 0,
                        marginTop: '4px',
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          opacity: isCompleted ? 0.7 : 1,
                        }}>
                          {task.title}
                        </div>

                        {/* Status badges */}
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          flexWrap: 'wrap',
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
                            {priorityInfo?.label}
                          </span>
                        </div>
                      </div>
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
