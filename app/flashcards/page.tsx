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
          Loading flashcards...
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
          &larr; Back to Dashboard
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
            Flashcards
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={() => setShowFolderModal(true)}
              variant="ghost"
              size="lg"
            >
              New Folder
            </Button>
            <Button
              onClick={() => setShowDeckModal(true)}
              variant="primary"
              size="lg"
            >
              New Deck
            </Button>
          </div>
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
        }}>
          Organize your flashcards into folders and decks for efficient studying.
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {folders.length === 0 && decks.length === 0 ? (
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
              &#x1F4DA;
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Flashcards Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Create your first deck or folder to start studying with flashcards.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Button
                onClick={() => setShowFolderModal(true)}
                variant="ghost"
                size="lg"
              >
                Create Folder
              </Button>
              <Button
                onClick={() => setShowDeckModal(true)}
                variant="primary"
                size="lg"
              >
                Create Deck
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Folders Section */}
            {rootFolders.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  📁 Folders
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {rootFolders.map((folder) => (
                    <div
                      key={folder.id}
                      style={{
                        position: 'relative',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all var(--transition-base)',
                        border: `2px solid ${folder.color}40`,
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/flashcards/folder/${folder.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        e.currentTarget.style.borderColor = folder.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.borderColor = `${folder.color}40`;
                      }}
                    >
                      {/* Folder Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-500)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                      }}>
                        📁 FOLDER
                      </div>

                      {/* Folder Icon & Color */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: `${folder.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        marginBottom: '1rem',
                        border: `2px solid ${folder.color}`,
                      }}>
                        {folder.icon}
                      </div>

                {/* Folder Name */}
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}>
                  {folder.name}
                </h3>

                {/* Description */}
                {folder.description && (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    lineHeight: '1.5',
                  }}>
                    {folder.description}
                  </p>
                )}

                {/* Deck Count */}
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  marginBottom: '1rem',
                }}>
                  {folder.deckCount} {folder.deckCount === 1 ? 'deck' : 'decks'}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginTop: 'auto',
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
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  🎴 Decks
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {rootDecks.map((deck) => (
                    <div
                      key={deck.id}
                      style={{
                        position: 'relative',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all var(--transition-base)',
                        border: '2px solid transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        e.currentTarget.style.borderColor = deck.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      {/* Deck Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'var(--success-100)',
                        color: 'var(--success-500)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                      }}>
                        🎴 DECK
                      </div>

                      {/* Deck Icon & Color */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: `${deck.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        marginBottom: '1rem',
                        border: `2px solid ${deck.color}`,
                      }}>
                        {deck.icon}
                      </div>

                {/* Deck Name */}
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}>
                  {deck.name}
                </h3>

                {/* Description */}
                {deck.description && (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    lineHeight: '1.5',
                  }}>
                    {deck.description}
                  </p>
                )}

                {/* Card Count & Progress */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  marginBottom: '1rem',
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
                  marginTop: 'auto',
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => setShowDeleteFolderConfirm(false)}
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
              Delete Folder?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedFolder.name}&rdquo;</strong>?
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>Warning:</strong> This will also delete all subfolders and decks inside this folder. This action cannot be undone.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <Button
                onClick={() => setShowDeleteFolderConfirm(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteFolder}
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

      {/* Delete Deck Confirmation Modal */}
      {showDeleteDeckConfirm && selectedDeck && (
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
          onClick={() => setShowDeleteDeckConfirm(false)}
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
              Delete Deck?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedDeck.name}&rdquo;</strong>?
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>Warning:</strong> This will also delete all {selectedDeck.cardCount} flashcards in this deck. This action cannot be undone.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <Button
                onClick={() => setShowDeleteDeckConfirm(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteDeck}
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

      {/* Create/Edit Folder Modal */}
      {showFolderModal && user && (
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
            setShowFolderModal(false);
            setSelectedFolder(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '500px',
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
              {selectedFolder ? 'Edit Folder' : 'Create New Folder'}
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
            setShowDeckModal(false);
            setSelectedDeck(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '500px',
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
              {selectedDeck ? 'Edit Deck' : 'Create New Deck'}
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
