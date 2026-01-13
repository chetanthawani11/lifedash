'use client';

/**
 * FLASHCARDS WIDGET
 *
 * Displays flashcard decks and study progress on the dashboard.
 * Features:
 * - Shows decks due for review
 * - Study progress indicator
 * - Quick study button
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { subscribeToDecks } from '@/lib/flashcard-service';
import { Deck } from '@/types';

interface FlashcardsWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

export const FlashcardsWidget: React.FC<FlashcardsWidgetProps> = ({ size }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const maxDecks = size === 'small' ? 2 : size === 'medium' ? 3 : 5;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToDecks(
      user.uid,
      (data) => {
        // Sort by cards due for review (most urgent first)
        const sorted = [...data].sort((a, b) => {
          const aDue = a.cardsDue || 0;
          const bDue = b.cardsDue || 0;
          return bDue - aDue;
        });
        setDecks(sorted.slice(0, maxDecks));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading decks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, maxDecks]);

  const getTotalDue = () => {
    return decks.reduce((sum, deck) => sum + (deck.cardsDue || 0), 0);
  };

  const getTotalCards = () => {
    return decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Study Summary */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'var(--warning-50)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Due</p>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              color: getTotalDue() > 0 ? 'var(--warning-600)' : 'var(--success-600)',
              margin: '0.25rem 0 0',
            }}
          >
            {getTotalDue()}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>Total</p>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '700',
              color: 'var(--primary-600)',
              margin: '0.25rem 0 0',
            }}
          >
            {getTotalCards()}
          </p>
        </div>
      </div>

      {/* Quick Study Button */}
      {getTotalDue() > 0 && (
        <button
          onClick={() => {
            const deckWithDue = decks.find(d => (d.cardsDue || 0) > 0);
            if (deckWithDue) {
              router.push(`/flashcards/${deckWithDue.id}/study`);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'var(--primary-500)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            transition: 'all var(--transition-fast)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Studying
        </button>
      )}

      {/* Deck List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'auto' }}>
        {decks.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>No flashcard decks yet</p>
          </div>
        ) : (
          decks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => router.push(`/flashcards/${deck.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {deck.name}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                  {deck.cardCount || 0} cards
                </p>
              </div>
              {(deck.cardsDue || 0) > 0 && (
                <span
                  style={{
                    padding: '0.125rem 0.5rem',
                    backgroundColor: 'var(--warning-100)',
                    color: 'var(--warning-700)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '600',
                  }}
                >
                  {deck.cardsDue} due
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      <button
        onClick={() => router.push('/flashcards')}
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--primary-600)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '0.25rem',
        }}
      >
        View all decks →
      </button>
    </div>
  );
};

export default FlashcardsWidget;
