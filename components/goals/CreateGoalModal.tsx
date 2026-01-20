'use client';

/**
 * CREATE GOAL MODAL
 *
 * Modal for creating new goals with category, metric, period, and target selection.
 * Improved UI with better navigation, accessibility, and visual design.
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import {
  GoalCategory,
  GoalMetric,
  GoalPeriod,
  GoalSuggestion,
  CreateGoalInput,
  getCategoryInfo,
  getMetricLabel,
  getPeriodLabel,
  getMetricsForCategory,
  getDefaultTarget,
} from '@/types/goal';
import { createGoal } from '@/lib/goal-service';
import { generateGoalSuggestions } from '@/lib/goal-progress-calculator';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
}) => {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'choose' | 'suggestions' | 'custom'>('choose');
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Custom goal form state
  const [category, setCategory] = useState<GoalCategory>('journal');
  const [metric, setMetric] = useState<GoalMetric>('entries');
  const [period, setPeriod] = useState<GoalPeriod>('daily');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [title, setTitle] = useState('');

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Load suggestions when switching to suggestions view
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user?.uid || step !== 'suggestions') return;

      setLoading(true);
      try {
        const suggestions = await generateGoalSuggestions(user.uid);
        setSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [user?.uid, step]);

  // Update metric when category changes
  useEffect(() => {
    const metrics = getMetricsForCategory(category);
    setMetric(metrics[0]);
  }, [category]);

  // Update target when metric or period changes
  useEffect(() => {
    setTargetValue(getDefaultTarget(metric, period));
  }, [metric, period]);

  // Generate title
  useEffect(() => {
    const metricLabel = getMetricLabel(metric).toLowerCase();
    const periodLabel = getPeriodLabel(period).toLowerCase();
    setTitle(`${targetValue} ${metricLabel} ${periodLabel}`);
  }, [metric, period, targetValue]);

  const handleCreateFromSuggestion = async (suggestion: GoalSuggestion) => {
    if (!user?.uid) return;

    setCreating(true);
    try {
      const input: CreateGoalInput = {
        title: suggestion.title,
        description: suggestion.reason,
        category: suggestion.category,
        metric: suggestion.metric,
        period: suggestion.period,
        targetValue: suggestion.suggestedTarget,
        isUpperLimit: suggestion.metric === 'budget_limit',
      };

      await createGoal(user.uid, input);
      toast.success('Goal created!');
      onGoalCreated();
      handleClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCustomGoal = async () => {
    if (!user?.uid) return;

    setCreating(true);
    try {
      const input: CreateGoalInput = {
        title,
        category,
        metric,
        period,
        targetValue,
        isUpperLimit: metric === 'budget_limit',
      };

      await createGoal(user.uid, input);
      toast.success('Goal created!');
      onGoalCreated();
      handleClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setStep('choose');
    setCategory('journal');
    setMetric('entries');
    setPeriod('daily');
    setTargetValue(1);
    onClose();
  };

  if (!isOpen) return null;

  const categories: GoalCategory[] = ['journal', 'flashcard', 'expense', 'task'];
  const periods: GoalPeriod[] = ['daily', 'weekly', 'monthly'];
  const availableMetrics = getMetricsForCategory(category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {step !== 'choose' && (
              <button
                onClick={() => setStep('choose')}
                aria-label="Go back"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2
              id="modal-title"
              style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}
            >
              {step === 'choose' && 'Create Goal'}
              {step === 'suggestions' && 'Suggested Goals'}
              {step === 'custom' && 'Custom Goal'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', maxHeight: 'calc(85vh - 160px)', overflowY: 'auto' }}>
          {/* Step 1: Choose path */}
          {step === 'choose' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', textAlign: 'center' }}>
                How would you like to create your goal?
              </p>

              {/* Get Suggestions Option */}
              <button
                onClick={() => setStep('suggestions')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    Get Suggestions
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
                    Personalized goals based on your activity
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Custom Goal Option */}
              <button
                onClick={() => setStep('custom')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    Create Custom Goal
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
                    Set your own target and timeframe
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2a: Suggestions */}
          {step === 'suggestions' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid var(--border-light)',
                      borderTopColor: 'var(--primary-500)',
                      borderRadius: '50%',
                      margin: '0 auto 1rem',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: 0 }}>
                    Analyzing your activity...
                  </p>
                  <style jsx>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : suggestions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0 0 0.5rem' }}>
                    Based on your activity, we recommend:
                  </p>
                  {suggestions.map((suggestion, index) => {
                    const categoryInfo = getCategoryInfo(suggestion.category);
                    return (
                      <button
                        key={index}
                        onClick={() => handleCreateFromSuggestion(suggestion)}
                        disabled={creating}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.875rem',
                          padding: '1rem',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '2px solid var(--border-light)',
                          borderRadius: '12px',
                          cursor: creating ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          opacity: creating ? 0.6 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: categoryInfo.color + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            flexShrink: 0,
                          }}
                        >
                          {categoryInfo.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            {suggestion.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {suggestion.reason}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: categoryInfo.color + '20',
                            color: categoryInfo.color,
                            borderRadius: '6px',
                            flexShrink: 0,
                          }}
                        >
                          {getPeriodLabel(suggestion.period)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                    No suggestions yet
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0 0 1.5rem' }}>
                    Start using LifeDash to get personalized goal suggestions!
                  </p>
                  <Button onClick={() => setStep('custom')}>
                    Create Custom Goal
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Step 2b: Custom Goal Form */}
          {step === 'custom' && (
            <>
              {/* Category Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {categories.map((cat) => {
                    const info = getCategoryInfo(cat);
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        aria-pressed={isSelected}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.75rem 0.5rem',
                          backgroundColor: isSelected ? info.color + '15' : 'var(--bg-secondary)',
                          border: `2px solid ${isSelected ? info.color : 'transparent'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: isSelected ? '600' : '500',
                            color: isSelected ? info.color : 'var(--text-tertiary)',
                          }}
                        >
                          {info.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metric Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  What to track
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {availableMetrics.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      aria-pressed={metric === m}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: metric === m ? 'var(--primary-500)' : 'var(--bg-secondary)',
                        color: metric === m ? 'white' : 'var(--text-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                    >
                      {getMetricLabel(m)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Time period
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {periods.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      aria-pressed={period === p}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: period === p ? 'var(--primary-500)' : 'var(--bg-secondary)',
                        color: period === p ? 'white' : 'var(--text-primary)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                    >
                      {getPeriodLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Value */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="target-value"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Target {metric === 'budget_limit' ? '(maximum)' : metric === 'completion_rate' ? '(percentage)' : ''}
                </label>
                <input
                  id="target-value"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              {/* Preview Card */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: getCategoryInfo(category).color + '10',
                  border: `2px solid ${getCategoryInfo(category).color}30`,
                  borderRadius: '12px',
                }}
              >
                <p style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-tertiary)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your goal
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getCategoryInfo(category).icon}</span>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>
                    {title}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'custom' && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <Button
              onClick={() => setStep('choose')}
              variant="secondary"
              style={{ flex: 1 }}
            >
              Back
            </Button>
            <Button
              onClick={handleCreateCustomGoal}
              disabled={creating}
              style={{ flex: 1 }}
            >
              {creating ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        )}

        {step === 'suggestions' && suggestions.length > 0 && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <Button
              onClick={() => setStep('custom')}
              variant="secondary"
              style={{ width: '100%' }}
            >
              Create Custom Goal Instead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGoalModal;
