'use client';

/**
 * INDIVIDUAL JOURNAL PAGE
 *
 * This page shows ONE specific journal and all its entries.
 * URL: /journals/[journalId]
 *
 * Features:
 * - View all entries in this journal
 * - Create new entries
 * - Edit/delete existing entries
 * - See journal info (name, description, color)
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getJournal,
  subscribeToJournalEntries,
  deleteJournalEntry,
} from '@/lib/journal-service';
import { Journal, JournalEntry } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { JournalEntryForm } from '@/components/forms/JournalEntryForm';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function JournalPage() {
  const router = useRouter();
  const params = useParams();
  const journalId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  // State
  const [journal, setJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'updated-newest' | 'updated-oldest'>('newest');

  // Load journal and entries
  useEffect(() => {
    if (!user) return;

    // Load journal info
    const loadJournal = async () => {
      try {
        const journalData = await getJournal(user.uid, journalId);
        if (!journalData) {
          toast.error('Journal not found');
          router.push('/journals');
          return;
        }
        setJournal(journalData);
      } catch (error) {
        console.error('Error loading journal:', error);
        toast.error('Failed to load journal');
      }
    };

    loadJournal();

    // Subscribe to entries (real-time updates!)
    const unsubscribe = subscribeToJournalEntries(
      user.uid,
      journalId,
      (updatedEntries) => {
        setEntries(updatedEntries);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading entries:', error);
        toast.error('Failed to load entries');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, journalId, router]);

  // Redirect if not logged in
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Loading state
  if (loading || authLoading || !journal) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)',
        }}>
          Loading journal...
        </div>
      </div>
    );
  }

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle entry deletion
  const handleDelete = async (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedEntry) return;

    try {
      await deleteJournalEntry(user.uid, selectedEntry.id);
      toast.success('Entry deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'oldest') {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'updated-newest') {
        const dateA = a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
        const dateB = b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      } else {
        const dateA = a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
        const dateB = b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
        return dateA.getTime() - dateB.getTime();
      }
    });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        marginBottom: '2rem',
      }}>
        {/* Back button */}
        <Link href="/journals" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm" style={{ marginBottom: '1rem' }}>
            ← Back to Journals
          </Button>
        </Link>

        {/* Journal Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Journal Icon */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: `${journal.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}>
              {journal.icon}
            </div>

            {/* Journal Name & Description */}
            <div>
              <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
              }}>
                {journal.name}
              </h1>
              {journal.description && (
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                }}>
                  {journal.description}
                </p>
              )}
            </div>
          </div>

          {/* New Entry Button */}
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="lg"
          >
            Create Entry
          </Button>
        </div>

        {/* Stats */}
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          📝 {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Search and Sort */}
      {entries.length > 0 && (
        <div style={{
          maxWidth: '900px',
          margin: '0 auto 1.5rem auto',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-base)',
              outline: 'none',
              transition: 'all var(--transition-base)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-400)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
            }}
          />

          {/* Sort Dropdown */}
          <div style={{ width: '240px', margin: 0 }}>
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              options={[
                { value: 'newest', label: 'Last Written' },
                { value: 'oldest', label: 'First Written' },
                { value: 'updated-newest', label: 'Last Updated' },
                { value: 'updated-oldest', label: 'First Updated' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Entries List */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {filteredEntries.length === 0 && entries.length === 0 ? (
          // Empty state
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
              ✍️
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Entries Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Start writing your first entry in this journal!
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create Entry
            </Button>
          </div>
        ) : filteredEntries.length === 0 ? (
          // No search results
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
              🔍
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Entries Found
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              No entries match "{searchQuery}"
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              variant="ghost"
              size="lg"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          // Entries list
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  border: `2px solid transparent`,
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = journal.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => {
                  setSelectedEntry(entry);
                  setShowReadModal(true);
                }}
              >
                {/* Entry Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}>
                      {entry.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-tertiary)',
                    }}>
                      <span>📅 {formatDate(entry.createdAt)}</span>
                      {entry.mood && <span>{MOOD_EMOJIS[entry.mood]}</span>}
                      {entry.isFavorite && <span>⭐</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                  }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowCreateModal(true);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(entry)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Entry Preview */}
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {entry.content}
                </p>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: `${journal.color}15`,
                          color: journal.color,
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: '500',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Read Mode Modal */}
      {showReadModal && selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => {
            setShowReadModal(false);
            setSelectedEntry(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2.5rem',
            maxWidth: '800px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Entry Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              gap: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  lineHeight: '1.3',
                }}>
                  {selectedEntry.title}
                </h1>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                }}>
                  <span>📅 {formatDate(selectedEntry.createdAt)}</span>
                  {selectedEntry.mood && <span style={{ fontSize: '1.25rem' }}>{MOOD_EMOJIS[selectedEntry.mood]}</span>}
                  {selectedEntry.isFavorite && <span style={{ fontSize: '1.25rem' }}>⭐</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
              }}>
                <Button
                  onClick={() => {
                    setShowReadModal(false);
                    setShowCreateModal(true);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setShowReadModal(false);
                    handleDelete(selectedEntry);
                  }}
                  variant="danger"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Entry Content */}
            <div style={{
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {selectedEntry.content}
              </p>
            </div>

            {/* Tags */}
            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}>
                {selectedEntry.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: `${journal.color}15`,
                      color: journal.color,
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '500',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={() => {
                setShowReadModal(false);
                setSelectedEntry(null);
              }}
              variant="ghost"
              size="lg"
              fullWidth
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              Delete Entry?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>"{selectedEntry.title}"</strong>?
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>This action cannot be undone.</strong>
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="danger"
                size="lg"
                fullWidth
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Entry Modal */}
      {showCreateModal && user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => {
            setShowCreateModal(false);
            setSelectedEntry(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '900px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}>
              {selectedEntry ? 'Edit Entry' : 'New Entry'}
            </h2>

            <JournalEntryForm
              userId={user.uid}
              journalId={journalId}
              entry={selectedEntry}
              onSuccess={() => {
                setShowCreateModal(false);
                setSelectedEntry(null);
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedEntry(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Mood emoji mapping
const MOOD_EMOJIS = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  bad: '😟',
  terrible: '😢',
};
