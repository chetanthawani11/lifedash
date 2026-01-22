'use client';

/**
 * TASK COMPLETION CHART
 *
 * Shows task productivity metrics and completion rates.
 * Displays:
 * - Completion stats
 * - Completion rate progress bar
 */

import { TaskAnalytics } from '@/lib/analytics-service';

interface TaskCompletionChartProps {
  data: TaskAnalytics;
}

export const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
            }}
          />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            Task Productivity
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
          Your task completion metrics
        </p>
      </div>

      {/* Stats Row */}
      <div
        className="stats-grid"
        style={{
          marginBottom: data.totalTasks > 0 ? '1.25rem' : '0',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
            {data.completedTasks}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Completed
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {data.pendingTasks}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Pending
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: data.overdueTasks > 0 ? '#ef4444' : 'var(--text-primary)',
              margin: 0,
            }}
          >
            {data.overdueTasks}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Overdue
          </p>
        </div>
      </div>

      {/* Completion Rate Progress Bar */}
      {data.totalTasks > 0 && (
        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completion Rate</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {data.completionRate}%
            </span>
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${data.completionRate}%`,
                backgroundColor: data.completionRate >= 70 ? '#22c55e' : data.completionRate >= 40 ? '#f59e0b' : '#ef4444',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCompletionChart;
