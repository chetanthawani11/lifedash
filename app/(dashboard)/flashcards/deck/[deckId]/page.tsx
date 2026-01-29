'use client';

/**
 * DECK VIEW PAGE
 *
 * This page shows all flashcards inside a specific deck.
 * Features:
 * - View all flashcards in the deck
 * - Create new flashcards
 * - Edit existing flashcards
 * - Delete flashcards
 * - Filter by tags
 * - See deck statistics
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getFlashcardDeck,
  getDeckFlashcards,
  getDeckTags,
  deleteFlashcard,
  createFlashcard,
} from '@/lib/flashcard-service';
import { FlashcardDeck, Flashcard } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FlashcardForm } from '@/components/forms/FlashcardForm';
import {
  exportToCSV,
  exportToJSON,
  parseCSV,
  parseJSON,
  downloadFile,
  readFileAsText,
  getCSVTemplate,
  getJSONTemplate,
} from '@/lib/flashcard-import-export';
import toast from 'react-hot-toast';

export default function DeckViewPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params?.deckId as string;
  const { user, loading: authLoading } = useAuth();

  // State
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load deck and flashcards
  useEffect(() => {
    if (!user || !deckId) return;

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, deckId]);

  const loadData = async () => {
    if (!user || !deckId) return;

    try {
      const [deckData, cardsData, tagsData] = await Promise.all([
        getFlashcardDeck(user.uid, deckId),
        getDeckFlashcards(user.uid, deckId),
        getDeckTags(user.uid, deckId),
      ]);

      setDeck(deckData);
      setFlashcards(cardsData);
      setTags(tagsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading deck:', error);
      toast.error('Failed to load deck');
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle delete
  const handleDelete = async (card: Flashcard) => {
    setSelectedCard(card);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedCard) return;

    try {
      await deleteFlashcard(user.uid, selectedCard.id);
      toast.success('Flashcard deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedCard(null);
      loadData();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (flashcards.length === 0) {
      toast.error('No flashcards to export');
      return;
    }

    const csv = exportToCSV(flashcards);
    downloadFile(csv, `${deck?.name || 'flashcards'}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast.success(`Exported ${flashcards.length} flashcards to CSV`);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (flashcards.length === 0) {
      toast.error('No flashcards to export');
      return;
    }

    const json = exportToJSON(flashcards);
    downloadFile(json, `${deck?.name || 'flashcards'}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    toast.success(`Exported ${flashcards.length} flashcards to JSON`);
  };

  // Handle file import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);

    try {
      const text = await readFileAsText(file);
      let flashcardsData;

      // Determine file type by extension
      if (file.name.endsWith('.csv')) {
        flashcardsData = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        flashcardsData = parseJSON(text);
      } else {
        throw new Error('Unsupported file type. Please upload a .csv or .json file');
      }

      if (flashcardsData.length === 0) {
        throw new Error('No valid flashcards found in file');
      }

      // Import each flashcard
      let successCount = 0;
      let errorCount = 0;

      for (const cardData of flashcardsData) {
        try {
          await createFlashcard(user.uid, {
            ...cardData,
            deckId,
          });
          successCount++;
        } catch (error) {
          console.error('Error importing flashcard:', error);
          errorCount++;
        }
      }

      toast.success(`Successfully imported ${successCount} flashcards${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      loadData();
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import file');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Download template
  const handleDownloadTemplate = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const template = getCSVTemplate();
      downloadFile(template, 'flashcard_template.csv', 'text/csv');
      toast.success('Downloaded CSV template');
    } else {
      const template = getJSONTemplate();
      downloadFile(template, 'flashcard_template.json', 'application/json');
      toast.success('Downloaded JSON template');
    }
  };

  // Filter flashcards by selected tag
  const filteredCards = selectedTag
    ? flashcards.filter(card => card.tags.includes(selectedTag))
    : flashcards;

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
          Loading deck...
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            Deck Not Found
          </h2>
          <Button onClick={() => router.push('/flashcards')} variant="primary" size="sm">
            Back to Flashcards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Deck Info */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{
            paddingLeft: '1rem',
            borderLeft: `4px solid ${deck.color}`,
          }}>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              {deck.name}
            </h1>
            {deck.description && (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
              }}>
                {deck.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={() => setShowImportModal(true)}
              variant="ghost"
              size="sm"
            >
              Import
            </Button>
            <Button
              onClick={() => setShowExportModal(true)}
              variant="ghost"
              size="sm"
            >
              Export
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
            >
              New Flashcard
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Total Cards
            </div>
            <div style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              {flashcards.length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Mastered
            </div>
            <div style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--success)',
            }}>
              {deck.masteredCount}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Progress
            </div>
            <div style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: deck.cardCount > 0 ? 'var(--primary-500)' : 'var(--text-tertiary)',
            }}>
              {deck.cardCount > 0
                ? `${Math.round((deck.masteredCount / deck.cardCount) * 100)}%`
                : '0%'}
            </div>
          </div>
          {/* Study Now Button */}
          {flashcards.length > 0 && (
            <div style={{ alignSelf: 'center' }}>
              <Button
                onClick={() => router.push(`/flashcards/deck/${deckId}/study`)}
                variant="primary"
                size="sm"
              >
                Study Now
              </Button>
            </div>
          )}
        </div>

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: '0.5rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Filter by tag
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.375rem',
            }}>
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: selectedTag === null ? '1px solid var(--primary-500)' : '1px solid var(--border-light)',
                  backgroundColor: selectedTag === null ? 'var(--primary-100)' : 'var(--bg-elevated)',
                  color: selectedTag === null ? 'var(--primary-700)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  transition: 'all var(--transition-base)',
                }}
              >
                All ({flashcards.length})
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedTag === tag ? '1px solid var(--primary-500)' : '1px solid var(--border-light)',
                    backgroundColor: selectedTag === tag ? 'var(--primary-100)' : 'var(--bg-elevated)',
                    color: selectedTag === tag ? 'var(--primary-700)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  {tag} ({flashcards.filter(c => c.tags.includes(tag)).length})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flashcards List */}
      <div>
        {filteredCards.length === 0 ? (
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
              {selectedTag ? `No flashcards with tag "${selectedTag}"` : 'No Flashcards Yet'}
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
            }}>
              {selectedTag
                ? 'Try selecting a different tag or create new flashcards.'
                : 'Create your first flashcard to start studying!'}
            </p>
            {!selectedTag && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="sm"
              >
                Create First Flashcard
              </Button>
            )}
          </div>
        ) : (
          // Flashcards grid
          <div style={{
            display: 'grid',
            gap: '0.75rem',
          }}>
            {filteredCards.map((card) => (
              <div
                key={card.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
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
                {/* Card Content */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '0.75rem',
                }}>
                  {/* Front */}
                  <div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      marginBottom: '0.25rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Front
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {card.front}
                    </div>
                  </div>

                  {/* Back */}
                  <div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      marginBottom: '0.25rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Back
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {card.back}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {card.notes && (
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    marginBottom: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <strong>Notes:</strong> {card.notes}
                  </div>
                )}

                {/* Tags and Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {/* Tags */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.375rem',
                  }}>
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.125rem 0.5rem',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                  }}>
                    <Button
                      onClick={() => {
                        setSelectedCard(card);
                        setShowCreateModal(true);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(card)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCard && (
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
              Delete Flashcard?
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete this flashcard? This action cannot be undone.
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

      {/* Create/Edit Flashcard Modal */}
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
            setSelectedCard(null);
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
              {selectedCard ? 'Edit Flashcard' : 'New Flashcard'}
            </h2>

            <FlashcardForm
              userId={user.uid}
              deckId={deckId}
              flashcard={selectedCard}
              onSuccess={() => {
                setShowCreateModal(false);
                setSelectedCard(null);
                loadData();
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedCard(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
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
          onClick={() => setShowImportModal(false)}
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
              marginBottom: '0.75rem',
            }}>
              Import Flashcards
            </h2>

            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}>
              Upload a CSV or JSON file to import flashcards into this deck.
            </p>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleImport}
              disabled={importing}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px dashed var(--border-light)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                cursor: importing ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: 'var(--text-sm)',
              }}
            />

            {importing && (
              <div style={{
                textAlign: 'center',
                padding: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                }}>
                  Importing flashcards...
                </div>
              </div>
            )}

            {/* Template Downloads */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>
                Need a template?
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
              }}>
                <Button
                  onClick={() => handleDownloadTemplate('csv')}
                  variant="ghost"
                  size="sm"
                  disabled={importing}
                >
                  CSV Template
                </Button>
                <Button
                  onClick={() => handleDownloadTemplate('json')}
                  variant="ghost"
                  size="sm"
                  disabled={importing}
                >
                  JSON Template
                </Button>
              </div>
            </div>

            {/* Format Info */}
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: '1rem',
              lineHeight: '1.6',
            }}>
              <strong>CSV:</strong> front,back,notes,tags<br />
              <strong>JSON:</strong> Array of objects with front, back, notes, tags
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowImportModal(false)}
              variant="ghost"
              size="sm"
              fullWidth
              disabled={importing}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Flashcards"
        maxWidth="400px"
      >
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          lineHeight: '1.6',
        }}>
          Choose your preferred export format:
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <Button
            onClick={() => {
              handleExportCSV();
              setShowExportModal(false);
            }}
            variant="primary"
            size="sm"
            fullWidth
          >
            Export as CSV
          </Button>
          <Button
            onClick={() => {
              handleExportJSON();
              setShowExportModal(false);
            }}
            variant="ghost"
            size="sm"
            fullWidth
          >
            Export as JSON
          </Button>
        </div>
      </Modal>
    </div>
  );
}
