'use client';

/**
 * LEARNING PROGRESS CHART
 *
 * Shows flashcard study progress and statistics.
 * Displays:
 * - Study stats
 * - Mastery progress bar
 */

import { LearningAnalytics } from '@/lib/analytics-service';

interface LearningProgressChartProps {
  data: LearningAnalytics;
}

export const LearningProgressChart: React.FC<LearningProgressChartProps> = ({ data }) => {
  // Calculate mastery percentage
  const masteryPercent = data.totalCards > 0
    ? Math.round((data.masteredCards / data.totalCards) * 100)
    : 0;

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
              backgroundColor: '#a855f7',
            }}
          />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            Flashcard Progress
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
          Your study activity
        </p>
      </div>

      {/* Stats Row */}
      <div
        className="stats-grid"
        style={{
          marginBottom: data.totalCards > 0 ? '1.25rem' : '0',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#a855f7', margin: 0 }}>
            {data.totalCards}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Total Cards
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: data.cardsDue > 0 ? '#f59e0b' : 'var(--text-primary)',
              margin: 0,
            }}
          >
            {data.cardsDue}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Due Today
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {data.studyStreak}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Day Streak
          </p>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      {data.totalCards > 0 && (
        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Mastery ({data.masteredCards} cards)
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {masteryPercent}%
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
                width: `${masteryPercent}%`,
                backgroundColor: '#a855f7',
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

export default LearningProgressChart;
