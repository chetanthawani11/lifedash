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
import { Modal } from '@/components/ui/Modal';
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
      }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Loading journals...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Journals
          </h1>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="sm"
          >
            New Journal
          </Button>
        </div>
      </div>

      {/* Journals Grid */}
      <div>
        {journals.length === 0 ? (
          // Empty state
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Journals Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
            }}>
              Create your first journal to start writing
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
            >
              Create Journal
            </Button>
          </div>
        ) : (
          // Journal cards grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.75rem',
          }}>
            {journals.map((journal) => (
              <div
                key={journal.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  border: '1px solid var(--border-light)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = journal.color;
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                }}
                onClick={() => router.push(`/journals/${journal.id}`)}
              >
                {/* Journal Icon & Color */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `${journal.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '0.75rem',
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
                  <span>{journal.entryCount} {journal.entryCount === 1 ? 'entry' : 'entries'}</span>
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
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
            }}>
              Delete Journal?
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedJournal.name}&rdquo;</strong>?
              This will also delete all {selectedJournal.entryCount} {selectedJournal.entryCount === 1 ? 'entry' : 'entries'} in this journal.
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>This action cannot be undone.</strong>
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="sm"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="danger"
                size="sm"
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
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
          onClick={() => {
            setShowCreateModal(false);
            setSelectedJournal(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              {selectedJournal ? 'Edit Journal' : 'New Journal'}
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
