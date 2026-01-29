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
import { NoteFolder, Note } from '@/types';
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
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
  const handleDelete = async (note: Note) => {
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
  const handleTogglePin = async (note: Note, event: React.MouseEvent) => {
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

    const text = markdown
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
      {/* Breadcrumb */}
      {folderPath.length > 0 && (
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}>
          {folderPath.map((f, index) => (
            <span key={f.id}>
              {index > 0 && <span style={{ margin: '0 0.25rem' }}>/</span>}
              <span>{f.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Folder Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        borderLeft: `4px solid ${folder.color}`,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}>
            {folder.name}
          </h1>
          {folder.description && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              {folder.description}
            </p>
          )}
          <p style={{
            fontSize: 'var(--text-xs)',
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
          size="sm"
        >
          New Note
        </Button>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
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
            No Notes Yet
          </h2>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: '1.5rem',
          }}>
            Create your first note in this folder!
          </p>
          <Button
            onClick={() => {
              setSelectedNote(null);
              setShowCreateNoteModal(true);
            }}
            variant="primary"
            size="sm"
          >
            Create Note
          </Button>
        </div>
      ) : (
        // Notes grid
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.75rem',
        }}>
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              style={{
                position: 'relative',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                border: '1px solid var(--border-light)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-400)';
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
              }}
            >
                {/* Pin icon */}
                <div
                  onClick={(e) => handleTogglePin(note, e)}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-base)',
                    opacity: note.isPinned ? 1 : 0.3,
                    color: note.isPinned ? 'var(--primary-500)' : 'var(--text-tertiary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = note.isPinned ? '1' : '0.3';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 17v5" />
                    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                  </svg>
                </div>

              <h3 style={{
                fontSize: 'var(--text-base)',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: '1.5rem',
              }}>
                {note.title}
              </h3>

              {note.content && (
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4',
                }}>
                  {getPlainTextPreview(note.content, 100)}
                </p>
              )}

              {note.tags && note.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem',
                }}>
                  {note.tags.slice(0, 3).map((tag: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.65rem',
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

              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: 'auto',
                }}
              >
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

      {/* Create/Edit Note Modal */}
      {showCreateNoteModal && user && (
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
            setShowCreateNoteModal(false);
            setSelectedNote(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            maxWidth: '800px',
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
              {selectedNote ? 'Edit Note' : 'New Note'}
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
              Delete Note?
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedNote.title}&rdquo;</strong>?
              This action cannot be undone.
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
