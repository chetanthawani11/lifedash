'use client';

/**
 * FLASHCARDS PAGE
 *
 * Main page for managing flashcard folders and decks.
 * Features:
 * - View all folders and decks in a grid layout
 * - Create new folders and decks
 * - Edit existing folders and decks
 * - Delete folders and decks (with cascade delete)
 * - Hierarchical organization (folders within folders)
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getUserFlashcardFolders,
  getUserFlashcardDecks,
  deleteFlashcardFolder,
  deleteFlashcardDeck,
} from '@/lib/flashcard-service';
import { FlashcardFolder, FlashcardDeck } from '@/types';
import { Button } from '@/components/ui/Button';
import { FolderForm } from '@/components/forms/FolderForm';
import { DeckForm } from '@/components/forms/DeckForm';
import toast from 'react-hot-toast';

export default function FlashcardsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State for folders and decks
  const [folders, setFolders] = useState<FlashcardFolder[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  // State for modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FlashcardFolder | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  // State for delete confirmations
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [showDeleteDeckConfirm, setShowDeleteDeckConfirm] = useState(false);

  // Load folders and decks when component mounts
  useEffect(() => {
    if (!user) return;

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [foldersData, decksData] = await Promise.all([
        getUserFlashcardFolders(user.uid),
        getUserFlashcardDecks(user.uid),
      ]);
      setFolders(foldersData);
      setDecks(decksData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast.error('Failed to load flashcards');
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle folder deletion
  const handleDeleteFolder = async (folder: FlashcardFolder) => {
    setSelectedFolder(folder);
    setShowDeleteFolderConfirm(true);
  };

  const confirmDeleteFolder = async () => {
    if (!user || !selectedFolder) return;

    try {
      await deleteFlashcardFolder(user.uid, selectedFolder.id);
      toast.success(`"${selectedFolder.name}" deleted successfully`);
      setShowDeleteFolderConfirm(false);
      setSelectedFolder(null);
      loadData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder. Please try again.');
    }
  };

  // Handle deck deletion
  const handleDeleteDeck = async (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setShowDeleteDeckConfirm(true);
  };

  const confirmDeleteDeck = async () => {
    if (!user || !selectedDeck) return;

    try {
      await deleteFlashcardDeck(user.uid, selectedDeck.id);
      toast.success(`"${selectedDeck.name}" deleted successfully`);
      setShowDeleteDeckConfirm(false);
      setSelectedDeck(null);
      loadData();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck. Please try again.');
    }
  };

  // Filter root folders and decks (not in any folder)
  const rootFolders = folders.filter(f => !f.parentId);
  const rootDecks = decks.filter(d => !d.folderId);

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
          Loading flashcards...
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
            Flashcards
          </h1>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={() => setShowFolderModal(true)}
              variant="ghost"
              size="sm"
            >
              New Folder
            </Button>
            <Button
              onClick={() => setShowDeckModal(true)}
              variant="primary"
              size="sm"
            >
              New Deck
            </Button>
          </div>
        </div>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Organize your flashcards into folders and decks for efficient studying.
        </p>
      </div>

      {/* Main Content */}
      <div>
        {folders.length === 0 && decks.length === 0 ? (
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
              No Flashcards Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
            }}>
              Create your first deck or folder to start studying with flashcards.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Button
                onClick={() => setShowFolderModal(true)}
                variant="ghost"
                size="sm"
              >
                Create Folder
              </Button>
              <Button
                onClick={() => setShowDeckModal(true)}
                variant="primary"
                size="sm"
              >
                Create Deck
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Folders Section */}
            {rootFolders.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Folders
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {rootFolders.map((folder) => (
                    <div
                      key={folder.id}
                      style={{
                        position: 'relative',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        transition: 'all var(--transition-base)',
                        border: '1px solid var(--border-light)',
                        borderLeft: `4px solid ${folder.color}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/flashcards/folder/${folder.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                      }}
                    >
                      {/* Folder Name */}
                      <h3 style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                      }}>
                        {folder.name}
                      </h3>

                      {/* Description */}
                      {folder.description && (
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem',
                          lineHeight: '1.5',
                        }}>
                          {folder.description}
                        </p>
                      )}

                      {/* Deck Count */}
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        marginBottom: '0.75rem',
                      }}>
                        {folder.deckCount} {folder.deckCount === 1 ? 'deck' : 'decks'}
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                      }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          onClick={() => {
                            setSelectedFolder(folder);
                            setShowFolderModal(true);
                          }}
                          variant="ghost"
                          size="sm"
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteFolder(folder)}
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
              </div>
            )}

            {/* Decks Section */}
            {rootDecks.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Decks
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {rootDecks.map((deck) => (
                    <div
                      key={deck.id}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        transition: 'all var(--transition-base)',
                        border: '1px solid var(--border-light)',
                        borderLeft: `4px solid ${deck.color}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                      }}
                    >
                      {/* Deck Name */}
                      <h3 style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                      }}>
                        {deck.name}
                      </h3>

                      {/* Description */}
                      {deck.description && (
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem',
                          lineHeight: '1.5',
                        }}>
                          {deck.description}
                        </p>
                      )}

                      {/* Card Count & Progress */}
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-tertiary)',
                        marginBottom: '0.75rem',
                      }}>
                        <span>{deck.cardCount} cards</span>
                        {deck.cardCount > 0 && (
                          <span>{Math.round((deck.masteredCount / deck.cardCount) * 100)}% mastered</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                      }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          onClick={() => {
                            setSelectedDeck(deck);
                            setShowDeckModal(true);
                          }}
                          variant="ghost"
                          size="sm"
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteDeck(deck)}
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Folder Confirmation Modal */}
      {showDeleteFolderConfirm && selectedFolder && (
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
          onClick={() => setShowDeleteFolderConfirm(false)}
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
              Delete Folder?
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedFolder.name}&rdquo;</strong>?
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>Warning:</strong> This will also delete all subfolders and decks inside this folder. This action cannot be undone.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}>
              <Button
                onClick={() => setShowDeleteFolderConfirm(false)}
                variant="ghost"
                size="sm"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteFolder}
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

      {/* Delete Deck Confirmation Modal */}
      {showDeleteDeckConfirm && selectedDeck && (
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
          onClick={() => setShowDeleteDeckConfirm(false)}
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
              Delete Deck?
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedDeck.name}&rdquo;</strong>?
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>Warning:</strong> This will also delete all {selectedDeck.cardCount} flashcards in this deck. This action cannot be undone.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}>
              <Button
                onClick={() => setShowDeleteDeckConfirm(false)}
                variant="ghost"
                size="sm"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteDeck}
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

      {/* Create/Edit Folder Modal */}
      {showFolderModal && user && (
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
            setShowFolderModal(false);
            setSelectedFolder(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '500px',
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
              {selectedFolder ? 'Edit Folder' : 'New Folder'}
            </h2>

            <FolderForm
              userId={user.uid}
              folder={selectedFolder}
              onSuccess={() => {
                setShowFolderModal(false);
                setSelectedFolder(null);
                loadData();
              }}
              onCancel={() => {
                setShowFolderModal(false);
                setSelectedFolder(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Create/Edit Deck Modal */}
      {showDeckModal && user && (
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
            setShowDeckModal(false);
            setSelectedDeck(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '500px',
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
              {selectedDeck ? 'Edit Deck' : 'New Deck'}
            </h2>

            <DeckForm
              userId={user.uid}
              deck={selectedDeck}
              onSuccess={() => {
                setShowDeckModal(false);
                setSelectedDeck(null);
                loadData();
              }}
              onCancel={() => {
                setShowDeckModal(false);
                setSelectedDeck(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
