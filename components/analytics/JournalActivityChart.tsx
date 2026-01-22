'use client';

/**
 * JOURNAL ACTIVITY CHART
 *
 * Shows journal writing stats.
 * Displays:
 * - Current and longest writing streaks
 * - Total entries count
 */

import { JournalAnalytics } from '@/lib/analytics-service';

interface JournalActivityChartProps {
  data: JournalAnalytics;
}

export const JournalActivityChart: React.FC<JournalActivityChartProps> = ({ data }) => {
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
              backgroundColor: '#3b82f6',
            }}
          />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            Journal Activity
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
          Your writing progress
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
            {data.totalEntries}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Total Entries
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {data.currentStreak}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Day Streak
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {data.entriesThisWeek}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            This Week
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalActivityChart;
