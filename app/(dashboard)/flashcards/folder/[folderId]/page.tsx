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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
      }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Loading folder...
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
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: `${folder.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              {folder.icon}
            </div>
            <div>
              <h1 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                {folder.name}
              </h1>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedDeck(null);
              setShowCreateDeckModal(true);
            }}
            variant="primary"
            size="sm"
          >
            New Deck
          </Button>
        </div>

        {folder.description && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            {folder.description}
          </p>
        )}
      </div>

      {/* Decks List */}
      {decks.length === 0 ? (
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
            No Decks Yet
          </h2>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: '1.5rem',
          }}>
            Create your first deck in this folder!
          </p>
          <Button
            onClick={() => {
              setSelectedDeck(null);
              setShowCreateDeckModal(true);
            }}
            variant="primary"
            size="sm"
          >
            Create Deck
          </Button>
        </div>
      ) : (
        // Decks grid
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.75rem',
        }}>
          {decks.map((deck) => (
            <div
              key={deck.id}
              onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                border: '1px solid var(--border-light)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = deck.color;
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
              }}
            >
              {/* Deck Icon & Color */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `${deck.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: '0.75rem',
              }}>
                {deck.icon}
              </div>

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
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
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

      {/* Create/Edit Deck Modal */}
      {showCreateDeckModal && user && (
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
            setShowCreateDeckModal(false);
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
    </div>
  );
}
