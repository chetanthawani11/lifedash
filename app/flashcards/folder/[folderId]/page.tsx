'use client';

/**
 * FLASHCARD FOLDER DETAIL PAGE
 *
 * Shows all decks in a specific flashcard folder
 * Features:
 * - Display folder info
 * - List all decks in folder
 * - Create new deck in this folder
 * - Edit/delete decks
 * - Breadcrumb navigation
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getFlashcardFolder,
  getDecksInFolder,
  deleteFlashcardDeck,
} from '@/lib/flashcard-service';
import { FlashcardFolder, FlashcardDeck } from '@/types';
import { Button } from '@/components/ui/Button';
import { DeckForm } from '@/components/forms/DeckForm';
import toast from 'react-hot-toast';

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const folderId = params.folderId as string;

  const [folder, setFolder] = useState<FlashcardFolder | null>(null);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load folder and decks
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, folderId]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [folderData, decksData] = await Promise.all([
        getFlashcardFolder(user.uid, folderId),
        getDecksInFolder(user.uid, folderId),
      ]);

      if (!folderData) {
        toast.error('Folder not found');
        router.push('/flashcards');
        return;
      }

      setFolder(folderData);
      setDecks(decksData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading folder:', error);
      toast.error('Failed to load folder');
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedDeck) return;

    try {
      await deleteFlashcardDeck(user.uid, selectedDeck.id);
      toast.success('Deck deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedDeck(null);
      loadData();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    }
  };

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Loading state
  if (loading || authLoading || !folder) {
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
          Loading folder...
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Back Button */}
        <div style={{ marginBottom: '2rem' }}>
          <Button
            onClick={() => router.push('/flashcards')}
            variant="ghost"
            size="sm"
            style={{ marginBottom: '1rem' }}
          >
            &larr; Back to Flashcards
          </Button>
        </div>

        {/* Folder Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          border: `2px solid ${folder.color}40`,
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            fontSize: '3rem',
            width: '4rem',
            height: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${folder.color}20`,
            borderRadius: 'var(--radius-lg)',
            border: `2px solid ${folder.color}`,
          }}>
            {folder.icon}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              {folder.name}
            </h1>
            {folder.description && (
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
              }}>
                {folder.description}
              </p>
            )}
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </p>
          </div>

          <Button
            onClick={() => {
              setSelectedDeck(null);
              setShowCreateDeckModal(true);
            }}
            variant="primary"
            size="lg"
          >
            New Deck
          </Button>
        </div>

        {/* Decks List */}
        {decks.length === 0 ? (
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
              📚
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Decks Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Create your first deck in this folder!
            </p>
            <Button
              onClick={() => {
                setSelectedDeck(null);
                setShowCreateDeckModal(true);
              }}
              variant="primary"
              size="lg"
            >
              Create Deck
            </Button>
          </div>
        ) : (
          // Decks grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
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
                  e.currentTarget.style.borderColor = deck.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
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
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginTop: 'auto',
                  }}
                >
                  <Button
                    onClick={() => {
                      setSelectedDeck(deck);
                      setShowCreateDeckModal(true);
                    }}
                    variant="ghost"
                    size="sm"
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(deck)}
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

      {/* Create/Edit Deck Modal */}
      {showCreateDeckModal && user && (
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
            setShowCreateDeckModal(false);
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
              folderId={folderId}
              onSuccess={() => {
                setShowCreateDeckModal(false);
                setSelectedDeck(null);
                loadData();
              }}
              onCancel={() => {
                setShowCreateDeckModal(false);
                setSelectedDeck(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedDeck && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
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
    </div>
  );
}
