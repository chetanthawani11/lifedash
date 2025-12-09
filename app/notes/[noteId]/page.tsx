'use client';

/**
 * NOTE DETAIL PAGE
 *
 * Displays a single note with:
 * - Note title and metadata
 * - Rendered markdown content
 * - Edit and delete actions
 * - Breadcrumb navigation
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getNote, deleteNote, getFolderPath, toggleNotePin, getNote as getLinkedNote } from '@/lib/note-service';
import { getFlashcardDeck } from '@/lib/flashcard-service';
import { NoteFolder } from '@/types';
import { Button } from '@/components/ui/Button';
import { NoteForm } from '@/components/forms/NoteForm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import toast from 'react-hot-toast';

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const noteId = params.noteId as string;

  const [note, setNote] = useState<any | null>(null);
  const [folderPath, setFolderPath] = useState<NoteFolder[]>([]);
  const [linkedDecks, setLinkedDecks] = useState<any[]>([]);
  const [linkedNotes, setLinkedNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load note data
  useEffect(() => {
    if (!user) return;
    loadNote();
  }, [user, noteId]);

  const loadNote = async () => {
    if (!user) return;

    try {
      const noteData = await getNote(user.uid, noteId);
      if (!noteData) {
        toast.error('Note not found');
        router.push('/notes');
        return;
      }

      setNote(noteData);

      // Load folder path if note is in a folder
      if (noteData.folderId) {
        const path = await getFolderPath(user.uid, noteData.folderId);
        setFolderPath(path);
      }

      // Load linked flashcard decks
      if (noteData.linkedFlashcardDecks && noteData.linkedFlashcardDecks.length > 0) {
        const decksPromises = noteData.linkedFlashcardDecks.map((deckId: string) =>
          getFlashcardDeck(user.uid, deckId)
        );
        const decks = await Promise.all(decksPromises);
        setLinkedDecks(decks.filter((d) => d !== null));
      }

      // Load linked notes
      if (noteData.linkedNotes && noteData.linkedNotes.length > 0) {
        const notesPromises = noteData.linkedNotes.map((noteId: string) =>
          getLinkedNote(user.uid, noteId)
        );
        const notes = await Promise.all(notesPromises);
        setLinkedNotes(notes.filter((n) => n !== null));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Failed to load note');
      router.push('/notes');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user || !note) return;

    try {
      await deleteNote(user.uid, note.id);
      toast.success('Note deleted successfully');
      router.push('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Handle toggle pin
  const handleTogglePin = async () => {
    if (!user || !note) return;

    try {
      await toggleNotePin(user.uid, note.id);
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
      loadNote();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to toggle pin');
    }
  };

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Loading state
  if (loading || authLoading || !note) {
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
          Loading note...
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {/* Back Button & Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <Button
            onClick={() => router.push('/notes')}
            variant="ghost"
            size="sm"
            style={{ marginBottom: '1rem' }}
          >
            &larr; Back to Notes
          </Button>

          {/* Breadcrumb */}
          {folderPath.length > 0 && (
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              <span>📁</span>
              {folderPath.map((folder, index) => (
                <span key={folder.id}>
                  {index > 0 && <span style={{ margin: '0 0.25rem' }}>›</span>}
                  <span>{folder.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Note Header */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
          }}>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              flex: 1,
            }}>
              {note.title}
            </h1>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={handleTogglePin}
                variant="ghost"
                size="sm"
              >
                {note.isPinned ? '📌 Unpin' : '📍 Pin'}
              </Button>
              <Button
                onClick={() => setShowEditModal(true)}
                variant="ghost"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                size="sm"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            flexWrap: 'wrap',
          }}>
            <span>📅 Created: {formatDate(note.createdAt)}</span>
            <span>🔄 Updated: {formatDate(note.updatedAt)}</span>
            {note.tags && note.tags.length > 0 && (
              <span>
                🏷️ Tags: {note.tags.map((tag: string, i: number) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    <span style={{ color: 'var(--primary-500)' }}>{tag}</span>
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          minHeight: '300px',
        }}>
          {note.content.trim() ? (
            <div style={{
              color: 'var(--text-primary)',
              lineHeight: '1.8',
              fontSize: 'var(--text-base)',
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: '700',
                      marginTop: '2rem',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                      borderBottom: '2px solid var(--border-light)',
                      paddingBottom: '0.5rem',
                    }} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: '600',
                      marginTop: '1.5rem',
                      marginBottom: '0.75rem',
                      color: 'var(--text-primary)',
                    }} {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: '600',
                      marginTop: '1rem',
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                    }} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                    }} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul style={{
                      marginBottom: '1rem',
                      paddingLeft: '2rem',
                      listStyleType: 'disc',
                    }} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol style={{
                      marginBottom: '1rem',
                      paddingLeft: '2rem',
                      listStyleType: 'decimal',
                    }} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{
                      marginBottom: '0.5rem',
                    }} {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) => (
                    inline ? (
                      <code style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9em',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        color: 'var(--primary-500)',
                      }} {...props} />
                    ) : (
                      <code style={{
                        display: 'block',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9em',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        overflowX: 'auto',
                        marginBottom: '1rem',
                      }} {...props} />
                    )
                  ),
                  pre: ({ node, ...props }) => (
                    <pre style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      overflowX: 'auto',
                      marginBottom: '1rem',
                    }} {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote style={{
                      borderLeft: '4px solid var(--primary-500)',
                      paddingLeft: '1rem',
                      marginLeft: 0,
                      marginBottom: '1rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                    }} {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a style={{
                      color: 'var(--primary-500)',
                      textDecoration: 'underline',
                    }} target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginBottom: '1rem',
                    }} {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th style={{
                      border: '1px solid var(--border-light)',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      fontWeight: '600',
                      textAlign: 'left',
                    }} {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td style={{
                      border: '1px solid var(--border-light)',
                      padding: '0.75rem',
                    }} {...props} />
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div style={{
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
              textAlign: 'center',
              paddingTop: '4rem',
            }}>
              This note has no content yet.
            </div>
          )}
        </div>

        {/* Linked Resources Section */}
        {(linkedDecks.length > 0 || linkedNotes.length > 0) && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              🔗 Linked Resources
            </h2>

            {/* Linked Flashcard Decks */}
            {linkedDecks.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                }}>
                  📚 Flashcard Decks ({linkedDecks.length})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                }}>
                  {linkedDecks.map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        border: `2px solid ${deck.color}40`,
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = deck.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = `${deck.color}40`;
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                          width: '2.5rem',
                          height: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${deck.color}20`,
                          borderRadius: 'var(--radius-md)',
                        }}>
                          {deck.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem',
                          }}>
                            {deck.name}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-tertiary)',
                          }}>
                            {deck.cardCount} cards
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Notes */}
            {linkedNotes.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                }}>
                  📝 Related Notes ({linkedNotes.length})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem',
                }}>
                  {linkedNotes.map((linkedNote) => (
                    <div
                      key={linkedNote.id}
                      onClick={() => router.push(`/notes/${linkedNote.id}`)}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        border: '2px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--primary-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                      }}
                    >
                      <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {linkedNote.title}
                      </div>
                      {linkedNote.tags && linkedNote.tags.length > 0 && (
                        <div style={{
                          display: 'flex',
                          gap: '0.25rem',
                          flexWrap: 'wrap',
                        }}>
                          {linkedNote.tags.slice(0, 2).map((tag: string, i: number) => (
                            <span
                              key={i}
                              style={{
                                fontSize: 'var(--text-xs)',
                                padding: '0.125rem 0.375rem',
                                backgroundColor: 'var(--primary-100)',
                                color: 'var(--primary-500)',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && user && (
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
          onClick={() => setShowEditModal(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '800px',
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
              Edit Note
            </h2>

            <NoteForm
              userId={user.uid}
              note={note}
              onSuccess={() => {
                setShowEditModal(false);
                loadNote();
              }}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
              Delete Note?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{note.title}&rdquo;</strong>?
              This action cannot be undone.
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
                onClick={handleDelete}
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
