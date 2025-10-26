'use client';

/**
 * JOURNALS PAGE
 *
 * This is where users manage all their journals.
 * Features:
 * - View all journals in a beautiful grid
 * - Create new journals
 * - Edit existing journals
 * - Delete journals with confirmation
 * - Real-time updates (journals update automatically)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getUserJournals,
  deleteJournal,
  subscribeToUserJournals
} from '@/lib/journal-service';
import { Journal } from '@/types';
import { Button } from '@/components/ui/Button';
import { JournalForm } from '@/components/forms/JournalForm';
import toast from 'react-hot-toast';

export default function JournalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State to store all journals
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load journals when component mounts
  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time journal updates
    const unsubscribe = subscribeToUserJournals(
      user.uid,
      (updatedJournals) => {
        setJournals(updatedJournals);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading journals:', error);
        toast.error('Failed to load journals');
        setLoading(false);
      }
    );

    // Cleanup: Unsubscribe when component unmounts
    return () => unsubscribe();
  }, [user]);

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle journal deletion
  const handleDelete = async (journal: Journal) => {
    setSelectedJournal(journal);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedJournal) return;

    try {
      await deleteJournal(user.uid, selectedJournal.id);
      toast.success(`"${selectedJournal.name}" deleted successfully`);
      setShowDeleteConfirm(false);
      setSelectedJournal(null);
    } catch (error) {
      console.error('Error deleting journal:', error);
      toast.error('Failed to delete journal');
    }
  };

  // Loading state
  if (loading || authLoading) {
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
          Loading journals...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      {/* Page Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
      }}>
        {/* Back to Dashboard */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Dashboard
        </Button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
              My Journals
          </h1>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="lg"
          >
            Create Journal
          </Button>
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
        }}>
          Manage your personal journals. Create, edit, or delete journals to organize your thoughts.
        </p>
      </div>

      {/* Journals Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {journals.length === 0 ? (
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
              📔
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Journals Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Create your first journal to start writing your thoughts, ideas, and memories.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create Your First Journal
            </Button>
          </div>
        ) : (
          // Journal cards grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {journals.map((journal) => (
              <div
                key={journal.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = journal.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => router.push(`/journals/${journal.id}`)}
              >
                {/* Journal Icon & Color */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: `${journal.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '1rem',
                }}>
                  {journal.icon}
                </div>

                {/* Journal Name */}
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}>
                  {journal.name}
                </h3>

                {/* Journal Description */}
                {journal.description && (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    lineHeight: '1.6',
                  }}>
                    {journal.description}
                  </p>
                )}

                {/* Journal Stats */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                }}>
                  <span>📝 {journal.entryCount} {journal.entryCount === 1 ? 'entry' : 'entries'}</span>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
                >
                  <Button
                    onClick={() => {
                      setSelectedJournal(journal);
                      setShowCreateModal(true);
                    }}
                    variant="ghost"
                    size="sm"
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(journal)}
                    variant="danger"
                    size="sm"
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedJournal && (
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
            minHeight: 'fit-content',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              Delete Journal?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>"{selectedJournal.name}"</strong>?
              This will also delete all {selectedJournal.entryCount} {selectedJournal.entryCount === 1 ? 'entry' : 'entries'} in this journal.
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

      {/* Create/Edit Journal Modal */}
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
            setSelectedJournal(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
            minHeight: 'fit-content',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}>
              {selectedJournal ? 'Edit Journal' : 'Create New Journal'}
            </h2>

            <JournalForm
              userId={user.uid}
              journal={selectedJournal}
              onSuccess={() => {
                setShowCreateModal(false);
                setSelectedJournal(null);
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedJournal(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
