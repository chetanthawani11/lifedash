'use client';

// FlashcardStudyCard - A single flashcard in study mode with flip animation
// This component shows one flashcard at a time and lets you flip it to see the answer

import { useState, useEffect } from 'react';
import { Flashcard } from '@/types';
import { DifficultyRating } from '@/lib/spaced-repetition';
import { Button } from '@/components/ui/Button';

interface FlashcardStudyCardProps {
  flashcard: Flashcard;
  onRate: (rating: DifficultyRating) => void;
  cardNumber: number;
  totalCards: number;
}

export function FlashcardStudyCard({
  flashcard,
  onRate,
  cardNumber,
  totalCards,
}: FlashcardStudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [flashcard.id]);

  // Handle spacebar to flip card
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && !isFlipped) {
      e.preventDefault();
      setIsFlipped(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
      }}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
      }}>
        <span>Card {cardNumber} of {totalCards}</span>
        {flashcard.status !== 'new' && (
          <span>
            Reviewed {flashcard.timesReviewed} times
            {flashcard.timesReviewed > 0 && ` • ${Math.round((flashcard.timesCorrect / flashcard.timesReviewed) * 100)}% correct`}
          </span>
        )}
      </div>

      {/* Flashcard - Flippable */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '400px',
          perspective: '1000px',
          cursor: isFlipped ? 'default' : 'pointer',
        }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {/* Card Container with Flip Animation */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '400px',
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of Card */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              minHeight: '400px',
              backfaceVisibility: 'hidden',
              backgroundColor: 'var(--bg-elevated)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Question
            </div>
            <div style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              fontWeight: '500',
              whiteSpace: 'pre-wrap',
              maxWidth: '100%',
            }}>
              {flashcard.front}
            </div>

            {/* Tags */}
            {flashcard.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '2rem',
                justifyContent: 'center',
              }}>
                {flashcard.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '500',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Click to Flip Hint */}
            {!isFlipped && (
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                Click or press Space to flip
              </div>
            )}
          </div>

          {/* Back of Card */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              minHeight: '400px',
              backfaceVisibility: 'hidden',
              backgroundColor: 'var(--bg-elevated)',
              border: '2px solid var(--primary-500)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transform: 'rotateY(180deg)',
            }}
          >
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Answer
            </div>
            <div style={{
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              fontWeight: '500',
              whiteSpace: 'pre-wrap',
              maxWidth: '100%',
              marginBottom: flashcard.notes ? '1.5rem' : '0',
            }}>
              {flashcard.back}
            </div>

            {/* Notes */}
            {flashcard.notes && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                maxWidth: '100%',
              }}>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                }}>
                  Notes
                </div>
                <div style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {flashcard.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Buttons - Only show after flipping */}
      {isFlipped && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{
            fontSize: 'var(--text-base)',
            fontWeight: '500',
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}>
            How well did you know this?
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}>
            {/* Again Button - Didn't know it */}
            <button
              onClick={() => onRate('again')}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '2px solid #ef4444',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: '#ef4444' }}>
                Again
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                &lt; 1 day
              </span>
            </button>

            {/* Hard Button - Struggled */}
            <button
              onClick={() => onRate('hard')}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '2px solid #f59e0b',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fffbeb';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: '#f59e0b' }}>
                Hard
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                2-3 days
              </span>
            </button>

            {/* Good Button - Got it right */}
            <button
              onClick={() => onRate('good')}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '2px solid #3b82f6',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: '#3b82f6' }}>
                Good
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                7-10 days
              </span>
            </button>

            {/* Easy Button - Knew it instantly */}
            <button
              onClick={() => onRate('easy')}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '2px solid #22c55e',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: '#22c55e' }}>
                Easy
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                2-3 weeks
              </span>
            </button>
          </div>

          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            marginTop: '0.5rem',
          }}>
            💡 Tip: Be honest with your rating - it helps you learn better!
          </div>
        </div>
      )}
    </div>
  );
}
