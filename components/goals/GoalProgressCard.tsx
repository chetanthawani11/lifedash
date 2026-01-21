'use client';

/**
 * GOAL PROGRESS CARD
 *
 * Displays a single goal with its progress, streak, and actions.
 * Shows visual progress bar and motivational feedback.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import {
  Goal,
  getCategoryInfo,
  getMetricLabel,
  getPeriodLabel,
  calculateProgress,
  isGoalCompleted,
} from '@/types/goal';
import { getMotivationalMessage } from '@/lib/goal-progress-calculator';
import { pauseGoal, deleteGoal } from '@/lib/goal-service';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface GoalProgressCardProps {
  goal: Goal;
  currentValue: number;
  onUpdate: () => void;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  goal,
  currentValue,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categoryInfo = getCategoryInfo(goal.category);
  const progress = calculateProgress(currentValue, goal.targetValue, goal.isUpperLimit);
  const completed = goal.isUpperLimit
    ? currentValue <= goal.targetValue
    : currentValue >= goal.targetValue;
  const motivational = getMotivationalMessage(progress, goal.isUpperLimit);

  const handlePause = async () => {
    if (!user?.uid) return;
    try {
      await pauseGoal(user.uid, goal.id);
      toast.success('Goal paused');
      onUpdate();
    } catch (error) {
      toast.error('Failed to pause goal');
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!user?.uid) return;
    setDeleting(true);
    try {
      await deleteGoal(user.uid, goal.id);
      toast.success('Goal deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete goal');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
    setShowMenu(false);
  };

  const formatValue = (value: number): string => {
    if (goal.metric === 'budget_limit' || goal.metric === 'savings_target') {
      return `$${value.toLocaleString()}`;
    }
    if (goal.metric === 'completion_rate') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '12px',
        padding: '1.25rem',
        border: completed ? `2px solid ${categoryInfo.color}` : '1px solid var(--border-light)',
        position: 'relative',
      }}
    >
      {/* Completed Badge */}
      {completed && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '12px',
            backgroundColor: categoryInfo.color,
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: '600',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
          }}
        >
          Completed!
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{categoryInfo.icon}</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            {goal.title}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
            {getPeriodLabel(goal.period)} goal
          </p>
        </div>

        {/* Menu Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
                minWidth: '120px',
              }}
            >
              <button
                onClick={handlePause}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              >
                Pause Goal
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                disabled={deleting}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                }}
              >
                Delete Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {formatValue(currentValue)} / {formatValue(goal.targetValue)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            {goal.isUpperLimit ? (progress <= 100 ? 'Under budget' : 'Over budget') : `${Math.min(progress, 100)}%`}
          </span>
        </div>
        <div
          style={{
            height: '10px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '5px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: goal.isUpperLimit
                ? progress > 100
                  ? '#ef4444'
                  : progress > 80
                  ? '#f59e0b'
                  : categoryInfo.color
                : completed
                ? '#22c55e'
                : categoryInfo.color,
              borderRadius: '5px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        {goal.currentStreak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem' }}>🔥</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {goal.currentStreak} streak
            </span>
          </div>
        )}
        {goal.completedPeriods > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem' }}>🏆</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {goal.completedPeriods}/{goal.totalPeriods} completed
            </span>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div
        style={{
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{motivational.emoji}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {motivational.message}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message={<>Are you sure you want to delete <strong>&ldquo;{goal.title}&rdquo;</strong>? This action cannot be undone.</>}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default GoalProgressCard;
