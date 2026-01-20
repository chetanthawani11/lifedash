'use client';

/**
 * GOALS SECTION
 *
 * Main goals display for the dashboard.
 * Shows all active goals with progress and ability to add new goals.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Goal } from '@/types/goal';
import { getActiveGoals, resetGoalsForNewPeriod } from '@/lib/goal-service';
import { calculateAllGoalProgress } from '@/lib/goal-progress-calculator';
import { useAuth } from '@/lib/auth-context';
import { GoalProgressCard } from './GoalProgressCard';
import { CreateGoalModal } from './CreateGoalModal';

export const GoalsSection: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadGoals = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Check for period resets
      await resetGoalsForNewPeriod(user.uid);

      // Load goals
      const activeGoals = await getActiveGoals(user.uid);
      setGoals(activeGoals);

      // Calculate current progress
      if (activeGoals.length > 0) {
        const progress = await calculateAllGoalProgress(user.uid, activeGoals);
        setProgressMap(progress);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleGoalCreated = () => {
    loadGoals();
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            height: '20px',
            width: '30%',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '4px',
            marginBottom: '1rem',
            animation: 'pulse 2s infinite',
          }}
        />
        <div
          style={{
            height: '100px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            animation: 'pulse 2s infinite',
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary-500)"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                Your Goals
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Track your progress and build habits
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            + Add Goal
          </Button>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="1.5"
                style={{ margin: '0 auto' }}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
              No goals yet
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0 0 1rem' }}>
              Set goals to track your journaling, learning, spending, and productivity
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Set Your First Goal
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {goals.map((goal) => (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                currentValue={progressMap.get(goal.id) || 0}
                onUpdate={loadGoals}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {goals.length > 0 && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-500)', margin: 0 }}>
                {goals.length}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Active Goals
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#22c55e', margin: 0 }}>
                {goals.filter((g) => {
                  const current = progressMap.get(g.id) || 0;
                  return g.isUpperLimit
                    ? current <= g.targetValue
                    : current >= g.targetValue;
                }).length}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Completed
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
                {Math.max(...goals.map((g) => g.currentStreak), 0)}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Best Streak
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGoalCreated={handleGoalCreated}
      />
    </>
  );
};

export default GoalsSection;
