'use client';

/**
 * NOTES PAGE
 *
 * This page shows all your note folders organized in a hierarchy.
 * Features:
 * - View all folders (root level and nested)
 * - Create new folders
 * - Edit existing folders
 * - Delete folders (with confirmation)
 * - Navigate into folders
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getUserNoteFolders,
  deleteNoteFolder,
  getUserNotes,
  deleteNote,
  searchNotes,
  toggleNotePin,
  sortNotesWithPinned,
} from '@/lib/note-service';
import { NoteFolder, Note } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { NoteFolderForm } from '@/components/forms/NoteFolderForm';
import { NoteForm } from '@/components/forms/NoteForm';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]); // Store all notes for search
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false);

  // Load folders and notes
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [foldersData, notesData] = await Promise.all([
        getUserNoteFolders(user.uid),
        getUserNotes(user.uid),
      ]);
      setFolders(foldersData);
      const sortedNotes = sortNotesWithPinned(notesData);
      setNotes(sortedNotes);
      setAllNotes(sortedNotes); // Store all notes
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!user) return;

    if (!query.trim()) {
      // If search is cleared, show all notes (sorted with pinned first)
      setNotes(allNotes);
      return;
    }

    try {
      const searchResults = await searchNotes(user.uid, query);
      const sortedResults = sortNotesWithPinned(searchResults);
      setNotes(sortedResults);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
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

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Helper function to strip markdown and get plain text preview
  const getPlainTextPreview = (markdown: string, maxLength: number = 150): string => {
    if (!markdown) return '';

    // Remove markdown syntax
    const text = markdown
      // Remove headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
      // Remove blockquotes
      .replace(/^\s*>\s+/gm, '')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove extra whitespace
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Truncate and add ellipsis
    if (text.length > maxLength) {
      return text.substring(0, maxLength).trim() + '...';
    }

    return text || 'No content';
  };

  // Handle folder delete
  const handleDeleteFolder = async (folder: NoteFolder) => {
    setSelectedFolder(folder);
    setShowDeleteFolderConfirm(true);
  };

  const confirmDeleteFolder = async () => {
    if (!user || !selectedFolder) return;

    try {
      await deleteNoteFolder(user.uid, selectedFolder.id);
      toast.success('Folder deleted successfully');
      setShowDeleteFolderConfirm(false);
      setSelectedFolder(null);
      loadData();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Handle note delete
  const handleDeleteNote = async (note: Note) => {
    setSelectedNote(note);
    setShowDeleteNoteConfirm(true);
  };

  const confirmDeleteNote = async () => {
    if (!user || !selectedNote) return;

    try {
      await deleteNote(user.uid, selectedNote.id);
      toast.success('Note deleted successfully');
      setShowDeleteNoteConfirm(false);
      setSelectedNote(null);
      loadData();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Build folder hierarchy for display
  const buildFolderTree = () => {
    // Group folders by parentId
    const folderMap = new Map<string | null, NoteFolder[]>();

    folders.forEach(folder => {
      const parentId = folder.parentId;
      if (!folderMap.has(parentId)) {
        folderMap.set(parentId, []);
      }
      folderMap.get(parentId)!.push(folder);
    });

    return folderMap;
  };

  // Render folder tree recursively
  const renderFolderTree = (parentId: string | null, level: number = 0): JSX.Element[] => {
    const folderMap = buildFolderTree();
    const childFolders = folderMap.get(parentId) || [];

    return childFolders.map(folder => (
      <div key={folder.id} style={{ marginLeft: `${level * 1.5}rem` }}>
        {/* Folder Item */}
        <div
          onClick={() => router.push(`/notes/folder/${folder.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: `2px solid ${folder.color}40`,
            marginBottom: '0.75rem',
            transition: 'all var(--transition-base)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.borderColor = folder.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.borderColor = `${folder.color}40`;
          }}
        >
          {/* Icon */}
          <div style={{
            fontSize: '2rem',
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${folder.color}20`,
            borderRadius: 'var(--radius-md)',
          }}>
            {folder.icon}
          </div>

          {/* Folder Info */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              {folder.name}
            </div>
            {folder.description && (
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
              }}>
                {folder.description}
              </div>
            )}
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginTop: '0.25rem',
            }}>
              {folder.noteCount} {folder.noteCount === 1 ? 'note' : 'notes'}
            </div>
          </div>

          {/* Actions */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <Button
              onClick={() => {
                setSelectedFolder(folder);
                setShowCreateFolderModal(true);
              }}
              variant="ghost"
              size="sm"
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDeleteFolder(folder)}
              variant="danger"
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Render subfolders recursively */}
        {renderFolderTree(folder.id, level + 1)}
      </div>
    ));
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
          Loading notes...
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
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Notes
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={() => {
                setSelectedFolder(null);
                setShowCreateFolderModal(true);
              }}
              variant="ghost"
              size="sm"
            >
              New Folder
            </Button>
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
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '400px',
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-primary)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              outline: 'none',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.25rem 0.5rem',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {folders.length === 0 && notes.length === 0 ? (
          // Empty state - no folders or notes
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
              Create your first note or folder to get started
            </p>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
            }}>
              <Button
                onClick={() => {
                  setSelectedFolder(null);
                  setShowCreateFolderModal(true);
                }}
                variant="ghost"
                size="sm"
              >
                Create Folder
              </Button>
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
          </div>
        ) : (
          <div>
            {/* Folders Section */}
            {folders.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}>
                  Folders
                </h2>
                <div>
                  {renderFolderTree(null)}
                </div>
              </div>
            )}

            {/* Quick Notes Section - notes not in any folder */}
            {(() => {
              const quickNotes = searchQuery
                ? notes // When searching, show all matching notes
                : notes.filter((note) => !note.folderId); // Otherwise, only root-level notes

              if (quickNotes.length === 0) return null;

              return (
                <div>
                  <h2 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '600',
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                  }}>
                    {searchQuery ? `Search Results (${notes.length})` : 'Notes'}
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '0.75rem',
                  }}>
                    {quickNotes.map((note) => (
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
                          top: '0.5rem',
                          right: '0.5rem',
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
                          onClick={() => handleDeleteNote(note)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Delete Folder Confirmation Modal */}
      <Modal
        isOpen={showDeleteFolderConfirm && !!selectedFolder}
        onClose={() => setShowDeleteFolderConfirm(false)}
        title="Delete Folder?"
        maxWidth="400px"
      >
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          lineHeight: '1.6',
        }}>
          Are you sure you want to delete <strong>{selectedFolder?.name}</strong>?
          This will also delete all subfolders and notes inside. This action cannot be undone.
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
      </Modal>

      {/* Create/Edit Folder Modal */}
      {user && (
        <Modal
          isOpen={showCreateFolderModal}
          onClose={() => {
            setShowCreateFolderModal(false);
            setSelectedFolder(null);
          }}
          title={selectedFolder ? 'Edit Folder' : 'Create New Folder'}
          maxWidth="600px"
        >
          <NoteFolderForm
            userId={user.uid}
            folder={selectedFolder}
            onSuccess={() => {
              setShowCreateFolderModal(false);
              setSelectedFolder(null);
              loadData();
            }}
            onCancel={() => {
              setShowCreateFolderModal(false);
              setSelectedFolder(null);
            }}
          />
        </Modal>
      )}

      {/* Create/Edit Note Modal */}
      {user && (
        <Modal
          isOpen={showCreateNoteModal}
          onClose={() => {
            setShowCreateNoteModal(false);
            setSelectedNote(null);
          }}
          title={selectedNote ? 'Edit Note' : 'Create New Note'}
          maxWidth="800px"
        >
          <NoteForm
            userId={user.uid}
            note={selectedNote}
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
        </Modal>
      )}

      {/* Delete Note Confirmation Modal */}
      <Modal
        isOpen={showDeleteNoteConfirm && !!selectedNote}
        onClose={() => setShowDeleteNoteConfirm(false)}
        title="Delete Note?"
        maxWidth="400px"
      >
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          lineHeight: '1.6',
        }}>
          Are you sure you want to delete <strong>&ldquo;{selectedNote?.title}&rdquo;</strong>?
          This action cannot be undone.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}>
          <Button
            onClick={() => setShowDeleteNoteConfirm(false)}
            variant="ghost"
            size="sm"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteNote}
            variant="danger"
            size="sm"
            fullWidth
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
