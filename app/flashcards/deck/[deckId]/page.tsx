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
          Loading deck...
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            Deck Not Found
          </h2>
          <Button onClick={() => router.push('/flashcards')} variant="primary" size="lg">
            Back to Flashcards
          </Button>
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
        {/* Back Button */}
        <Button
          onClick={() => router.push('/flashcards')}
          variant="ghost"
          size="sm"
          style={{ marginBottom: '1rem' }}
        >
          &larr; Back to Flashcards
        </Button>

        {/* Deck Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: `${deck.color}20`,
            border: `2px solid ${deck.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            {deck.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}>
              {deck.name}
            </h1>
            {deck.description && (
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
              }}>
                {deck.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={() => setShowImportModal(true)}
              variant="ghost"
              size="lg"
            >
              Import
            </Button>
            <div style={{ position: 'relative' }}>
              <Button
                onClick={() => {
                  // Simple export menu - could be enhanced with dropdown
                  if (confirm('Export as CSV?')) {
                    handleExportCSV();
                  } else {
                    handleExportJSON();
                  }
                }}
                variant="ghost"
                size="lg"
              >
                Export
              </Button>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              + New Flashcard
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              Total Cards
            </div>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}>
              {flashcards.length}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              Mastered
            </div>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--success)',
            }}>
              {deck.masteredCount}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              Progress
            </div>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: deck.cardCount > 0 ? 'var(--primary-500)' : 'var(--text-tertiary)',
            }}>
              {deck.cardCount > 0
                ? `${Math.round((deck.masteredCount / deck.cardCount) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Study Now Button */}
        {flashcards.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Button
              onClick={() => router.push(`/flashcards/deck/${deckId}/study`)}
              variant="primary"
              size="lg"
              style={{
                fontSize: 'var(--text-lg)',
                padding: '1rem 2rem',
                minWidth: '200px',
              }}
            >
              📚 Study Now
            </Button>
          </div>
        )}

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Filter by tag:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: selectedTag === null ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
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
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedTag === tag ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {filteredCards.length === 0 ? (
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
              {selectedTag ? `No flashcards with tag "${selectedTag}"` : 'No Flashcards Yet'}
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              {selectedTag
                ? 'Try selecting a different tag or create new flashcards.'
                : 'Create your first flashcard to start studying!'}
            </p>
            {!selectedTag && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="lg"
              >
                Create First Flashcard
              </Button>
            )}
          </div>
        ) : (
          // Flashcards grid
          <div style={{
            display: 'grid',
            gap: '1rem',
          }}>
            {filteredCards.map((card) => (
              <div
                key={card.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all var(--transition-base)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = deck.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Card Content */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  marginBottom: '1rem',
                }}>
                  {/* Front */}
                  <div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                    }}>
                      FRONT
                    </div>
                    <div style={{
                      fontSize: 'var(--text-base)',
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
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                    }}>
                      BACK
                    </div>
                    <div style={{
                      fontSize: 'var(--text-base)',
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
                    marginBottom: '1rem',
                    padding: '0.75rem',
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
                    gap: '0.5rem',
                  }}>
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          borderRadius: 'var(--radius-md)',
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
              Delete Flashcard?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete this flashcard? This action cannot be undone.
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

      {/* Create/Edit Flashcard Modal */}
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
            setSelectedCard(null);
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
              {selectedCard ? 'Edit Flashcard' : 'Create New Flashcard'}
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => setShowImportModal(false)}
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
              marginBottom: '1rem',
            }}>
              Import Flashcards
            </h2>

            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
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
                padding: '0.75rem',
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                cursor: importing ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--bg-secondary)',
              }}
            />

            {importing && (
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                }}>
                  Importing flashcards...
                </div>
              </div>
            )}

            {/* Template Downloads */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
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
                  Download CSV Template
                </Button>
                <Button
                  onClick={() => handleDownloadTemplate('json')}
                  variant="ghost"
                  size="sm"
                  disabled={importing}
                >
                  Download JSON Template
                </Button>
              </div>
            </div>

            {/* Format Info */}
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              <strong>CSV Format:</strong> front,back,notes,tags<br />
              <strong>JSON Format:</strong> Array of objects with front, back, notes, and tags fields
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowImportModal(false)}
              variant="ghost"
              size="lg"
              fullWidth
              disabled={importing}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
