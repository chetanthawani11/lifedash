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
import { NoteFolder } from '@/types';
import { Button } from '@/components/ui/Button';
import { NoteFolderForm } from '@/components/forms/NoteFolderForm';
import { NoteForm } from '@/components/forms/NoteForm';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<any[]>([]); // Store all notes for search
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | null>(null);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
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

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Helper function to strip markdown and get plain text preview
  const getPlainTextPreview = (markdown: string, maxLength: number = 150): string => {
    if (!markdown) return '';

    // Remove markdown syntax
    let text = markdown
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
  const handleDeleteNote = async (note: any) => {
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
          Loading notes...
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
            📚 Notes
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              onClick={() => {
                setSelectedFolder(null);
                setShowCreateFolderModal(true);
              }}
              variant="ghost"
              size="lg"
            >
              New Folder
            </Button>
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
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
        }}>
          Organize your learning notes in folders
        </p>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '500px',
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="🔍 Search notes by title, content, or tags..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-elevated)',
              border: '2px solid var(--border-light)',
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
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {folders.length === 0 && notes.length === 0 ? (
          // Empty state - no folders or notes
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
              Create your first note or folder to get started!
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
            }}>
              <Button
                onClick={() => {
                  setSelectedFolder(null);
                  setShowCreateFolderModal(true);
                }}
                variant="ghost"
                size="lg"
              >
                Create Folder
              </Button>
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
          </div>
        ) : (
          <div>
            {/* Folders Section */}
            {folders.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                }}>
                  📁 Folders
                </h2>
                <div>
                  {renderFolderTree(null)}
                </div>
              </div>
            )}

            {/* Recent Notes Section */}
            {notes.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                }}>
                  {searchQuery ? `🔍 Search Results (${notes.length})` : '📄 Recent Notes'}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem',
                }}>
                  {notes.slice(0, 10).map((note) => (
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
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
              Are you sure you want to delete <strong>{selectedFolder.name}</strong>?
              This will also delete all subfolders and notes inside. This action cannot be undone.
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

      {/* Create/Edit Folder Modal */}
      {showCreateFolderModal && user && (
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
            setShowCreateFolderModal(false);
            setSelectedFolder(null);
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
              {selectedFolder ? 'Edit Folder' : 'Create New Folder'}
            </h2>

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
          </div>
        </div>
      )}

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

      {/* Delete Note Confirmation Modal */}
      {showDeleteNoteConfirm && selectedNote && (
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
          onClick={() => setShowDeleteNoteConfirm(false)}
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
                onClick={() => setShowDeleteNoteConfirm(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteNote}
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
