'use client';

/**
 * JOURNALS WIDGET
 *
 * Displays recent journal entries on the dashboard.
 * Features:
 * - Shows last 3-5 journal entries
 * - Quick link to create new entry
 * - Preview of entry content
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { subscribeToUserJournals } from '@/lib/journal-service';
import { Journal } from '@/types';

interface JournalsWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

export const JournalsWidget: React.FC<JournalsWidgetProps> = ({ size }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine how many entries to show based on size
  const maxEntries = size === 'small' ? 2 : size === 'medium' ? 3 : 5;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserJournals(
      user.uid,
      (data) => {
        setJournals(data.slice(0, maxEntries));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading journals:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, maxEntries]);

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😔';
      case 'terrible': return '😢';
      default: return '📝';
    }
  };

  const truncateContent = (content: string | undefined | null, maxLength: number) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading journals...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Quick Add Button */}
      <button
        onClick={() => router.push('/journals/new')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'var(--primary-50)',
          border: '1px dashed var(--primary-300)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--primary-600)',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          transition: 'all var(--transition-fast)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Entry
      </button>

      {/* Journal Entries List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'auto' }}>
        {journals.length === 0 ? (
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
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>No journal entries yet</p>
          </div>
        ) : (
          journals.map((journal) => (
            <div
              key={journal.id}
              onClick={() => router.push(`/journals/${journal.id}`)}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {formatDate(journal.createdAt)}
                </span>
                <span style={{ fontSize: '1rem' }}>{getMoodEmoji(journal.mood)}</span>
              </div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                {journal.title}
              </h4>
              {size !== 'small' && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                  {truncateContent(journal.content, size === 'medium' ? 60 : 100)}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      <button
        onClick={() => router.push('/journals')}
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
        View all journals →
      </button>
    </div>
  );
};

export default JournalsWidget;
