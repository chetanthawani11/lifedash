'use client';

/**
 * FOLDER DETAIL PAGE
 *
 * Shows all notes in a specific folder
 * Features:
 * - Display folder info
 * - List all notes in folder
 * - Create new note in this folder
 * - Edit/delete notes
 * - Breadcrumb navigation
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getNoteFolder,
  getFolderNotes,
  getFolderPath,
  deleteNote,
  toggleNotePin,
  sortNotesWithPinned,
} from '@/lib/note-service';
import { NoteFolder } from '@/types';
import { Button } from '@/components/ui/Button';
import { NoteForm } from '@/components/forms/NoteForm';
import toast from 'react-hot-toast';

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const folderId = params.folderId as string;

  const [folder, setFolder] = useState<NoteFolder | null>(null);
  const [folderPath, setFolderPath] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load folder and notes
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, folderId]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [folderData, notesData, pathData] = await Promise.all([
        getNoteFolder(user.uid, folderId),
        getFolderNotes(user.uid, folderId),
        getFolderPath(user.uid, folderId),
      ]);

      if (!folderData) {
        toast.error('Folder not found');
        router.push('/notes');
        return;
      }

      setFolder(folderData);
      const sortedNotes = sortNotesWithPinned(notesData);
      setNotes(sortedNotes);
      setFolderPath(pathData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading folder:', error);
      toast.error('Failed to load folder');
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (note: any) => {
    setSelectedNote(note);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedNote) return;

    try {
      await deleteNote(user.uid, selectedNote.id);
      toast.success('Note deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedNote(null);
      loadData();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Handle toggle pin
  const handleTogglePin = async (note: any, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!user) return;

    try {
      await toggleNotePin(user.uid, note.id);
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
      loadData();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to toggle pin');
    }
  };

  // Helper to strip markdown and get plain text preview
  const getPlainTextPreview = (markdown: string, maxLength: number = 150): string => {
    if (!markdown) return '';

    let text = markdown
      .replace(/#{1,6}\s+/g, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
      .replace(/^\s*>\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    if (text.length > maxLength) {
      return text.substring(0, maxLength).trim() + '...';
    }

    return text || 'No content';
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
              {folderPath.map((f, index) => (
                <span key={f.id}>
                  {index > 0 && <span style={{ margin: '0 0.25rem' }}>›</span>}
                  <span>{f.icon} {f.name}</span>
                </span>
              ))}
            </div>
          )}
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
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <Button
            onClick={() => {
              setSelectedNote(null);
              setShowCreateNoteModal(true);
            }}
            variant="primary"
            size="lg"
          >
            New Note
          </Button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
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
              📝
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Notes Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Create your first note in this folder!
            </p>
            <Button
              onClick={() => {
                setSelectedNote(null);
                setShowCreateNoteModal(true);
              }}
              variant="primary"
              size="lg"
            >
              Create Note
            </Button>
          </div>
        ) : (
          // Notes grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                style={{
                  position: 'relative',
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
                  e.currentTarget.style.borderColor = 'var(--primary-500)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Pin indicator */}
                {note.isPinned && (
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    fontSize: 'var(--text-xl)',
                    opacity: 0.7,
                  }}>
                    📌
                  </div>
                )}

                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: note.isPinned ? '2rem' : 0,
                }}>
                  {note.title}
                </h3>

                {note.content && (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.5',
                  }}>
                    {getPlainTextPreview(note.content, 150)}
                  </p>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                  }}>
                    {note.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 'var(--text-xs)',
                          padding: '0.25rem 0.5rem',
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

                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: 'auto',
                  }}
                >
                  <Button
                    onClick={(e) => handleTogglePin(note, e)}
                    variant="ghost"
                    size="sm"
                    style={{
                      fontSize: 'var(--text-base)',
                      padding: '0.5rem',
                    }}
                  >
                    {note.isPinned ? '📌' : '📍'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedNote(note);
                      setShowCreateNoteModal(true);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(note)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Note Modal */}
      {showCreateNoteModal && user && (
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
            setShowCreateNoteModal(false);
            setSelectedNote(null);
          }}
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
              {selectedNote ? 'Edit Note' : 'Create New Note'}
            </h2>

            <NoteForm
              userId={user.uid}
              note={selectedNote}
              folderId={folderId}
              onSuccess={() => {
                setShowCreateNoteModal(false);
                setSelectedNote(null);
                loadData();
              }}
              onCancel={() => {
                setShowCreateNoteModal(false);
                setSelectedNote(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedNote && (
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
              Are you sure you want to delete <strong>&ldquo;{selectedNote.title}&rdquo;</strong>?
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
