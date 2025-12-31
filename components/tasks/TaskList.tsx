'use client';

/**
 * TASK LIST COMPONENT
 *
 * Displays a list of tasks with filtering and sorting options.
 * Features:
 * - Filter by status (All, To Do, In Progress, Completed)
 * - Filter by priority (All, Low, Medium, High, Urgent)
 * - Sort by due date, priority, or creation date
 * - Empty state when no tasks match filters
 * - Uses TaskCard component for each task
 *
 * WHAT THIS DOES:
 * 1. Takes an array of tasks and display options
 * 2. Filters tasks based on current filter settings
 * 3. Sorts tasks based on current sort setting
 * 4. Renders each task using the TaskCard component
 */

import { useState, useMemo } from 'react';
import { Task, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/types';
import { TaskCard } from './TaskCard';
import { Select, SelectOption } from '@/components/ui/Select';

interface TaskListProps {
  tasks: Task[];
  userId: string;
  onEdit: (task: Task) => void;
  onUpdate: () => void;
}

// Sort options for the dropdown
type SortOption = 'order' | 'dueDate' | 'priority' | 'createdAt';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  userId,
  onEdit,
  onUpdate,
}) => {
  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('order');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(task => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter(task => task.priority === filterPriority);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Tasks without due dates go to the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.toDate().getTime() - b.dueDate.toDate().getTime();

        case 'priority':
          // Priority order: urgent (highest) > high > medium > low (lowest)
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];

        case 'createdAt':
          // Newest first
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();

        case 'order':
        default:
          // Custom order (for drag-and-drop)
          return a.order - b.order;
      }
    });

    return result;
  }, [tasks, filterStatus, filterPriority, sortBy]);

  // Status filter options
  const statusFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Statuses' },
    ...TASK_STATUS_OPTIONS.map(s => ({
      value: s.value,
      label: s.label,
    })),
  ];

  // Priority filter options
  const priorityFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Priorities' },
    ...TASK_PRIORITY_OPTIONS.map(p => ({
      value: p.value,
      label: `${p.icon} ${p.label}`,
    })),
  ];

  // Sort options
  const sortOptions: SelectOption[] = [
    { value: 'order', label: 'Custom Order' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'createdAt', label: 'Newest First' },
  ];

  // Calculate stats for current filter
  const stats = useMemo(() => {
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const overdueCount = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false;
      return t.dueDate.toDate() < new Date();
    }).length;

    return { todoCount, inProgressCount, completedCount, overdueCount };
  }, [tasks]);

  return (
    <div>
      {/* Stats Summary */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          flex: '1 1 auto',
          minWidth: '120px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            color: '#78716c',
          }}>
            {stats.todoCount}
          </div>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            To Do
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          flex: '1 1 auto',
          minWidth: '120px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            color: '#3b82f6',
          }}>
            {stats.inProgressCount}
          </div>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            In Progress
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          flex: '1 1 auto',
          minWidth: '120px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            color: '#22c55e',
          }}>
            {stats.completedCount}
          </div>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            Completed
          </div>
        </div>

        {stats.overdueCount > 0 && (
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            flex: '1 1 auto',
            minWidth: '120px',
            textAlign: 'center',
            border: '2px solid rgba(239, 68, 68, 0.3)',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: '#ef4444',
            }}>
              {stats.overdueCount}
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: '#ef4444',
            }}>
              Overdue
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Status Filter */}
        <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusFilterOptions}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            options={priorityFilterOptions}
          />
        </div>

        {/* Sort By */}
        <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
            options={sortOptions}
          />
        </div>

        {/* Clear Filters Button */}
        {(filterStatus !== 'all' || filterPriority !== 'all') && (
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterPriority('all');
            }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: 'var(--text-sm)',
              color: 'var(--primary-600)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Tasks List or Empty State */}
      {tasks.length === 0 ? (
        // No tasks at all
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          padding: '4rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>
            {/* Checkbox icon */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="1.5"
              style={{ margin: '0 auto' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            No Tasks Yet
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
          }}>
            Create your first task to start staying organized!
          </p>
        </div>
      ) : filteredAndSortedTasks.length === 0 ? (
        // No tasks match filters
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {/* Search icon */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="1.5"
              style={{ margin: '0 auto' }}
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            No Tasks Found
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
          }}>
            No tasks match your current filters.
          </p>
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterPriority('all');
            }}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: 'var(--text-base)',
              color: 'var(--primary-600)',
              backgroundColor: 'var(--primary-100)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        // Tasks list
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}>
          {/* Results count */}
          <div style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-light)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </div>

          {/* Task cards */}
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              userId={userId}
              onEdit={onEdit}
              onDelete={onUpdate}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
