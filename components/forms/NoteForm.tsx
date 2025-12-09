'use client';

/**
 * NOTE FORM COMPONENT
 *
 * Form for creating and editing notes.
 * Features:
 * - Title input
 * - Folder selection
 * - Markdown editor for content
 * - Tags input
 * - Save and cancel actions
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/notes/MarkdownEditor';
import { createNote, updateNote, getUserNoteFolders, getUserNotes } from '@/lib/note-service';
import { getUserFlashcardDecks } from '@/lib/flashcard-service';
import { NoteFolder } from '@/types';
import toast from 'react-hot-toast';

interface NoteFormProps {
  userId: string;
  note?: any | null;  // If editing existing note
  folderId?: string | null;  // Pre-selected folder
  onSuccess: () => void;
  onCancel: () => void;
}

export function NoteForm({
  userId,
  note,
  folderId: initialFolderId,
  onSuccess,
  onCancel
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [folderId, setFolderId] = useState<string | null>(
    note?.folderId || initialFolderId || null
  );
  const [tags, setTags] = useState<string>(
    note?.tags ? note.tags.join(', ') : ''
  );
  const [linkedDeckIds, setLinkedDeckIds] = useState<string[]>(
    note?.linkedFlashcardDecks || []
  );
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>(
    note?.linkedNotes || []
  );
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load folders, flashcard decks, and other notes for dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        const [foldersData, decksData, notesData] = await Promise.all([
          getUserNoteFolders(userId),
          getUserFlashcardDecks(userId),
          getUserNotes(userId),
        ]);
        setFolders(foldersData);
        setFlashcardDecks(decksData);
        // Filter out current note from the list
        const otherNotes = notesData.filter((n: any) => n.id !== note?.id);
        setAllNotes(otherNotes);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [userId, note?.id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      // Parse tags (split by comma, trim whitespace, remove empty strings)
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (note) {
        // Update existing note
        await updateNote(userId, note.id, {
          title: title.trim(),
          content: content.trim(),
          folderId: folderId || null,
          tags: tagArray,
          linkedFlashcardDecks: linkedDeckIds,
          linkedNotes: linkedNoteIds,
        });
        toast.success('Note updated successfully!');
      } else {
        // Create new note
        await createNote(userId, {
          title: title.trim(),
          content: content.trim(),
          folderId: folderId || null,
          tags: tagArray,
          linkedFlashcardDecks: linkedDeckIds,
          linkedNotes: linkedNoteIds,
        });
        toast.success('Note created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <Input
          label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          required
          disabled={loading}
        />

        {/* Folder Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Folder (Optional)
          </label>
          <select
            value={folderId || ''}
            onChange={(e) => setFolderId(e.target.value || null)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <option value="">No Folder (Root Level)</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.icon} {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <Input
          label="Tags (Optional)"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., react, hooks, tutorial (comma separated)"
          disabled={loading}
        />

        {/* Linked Flashcard Decks */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Link to Flashcard Decks (Optional)
          </label>
          <div style={{
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-elevated)',
          }}>
            {flashcardDecks.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                No flashcard decks found. Create a deck first!
              </div>
            ) : (
              flashcardDecks.map((deck) => (
                <label
                  key={deck.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={linkedDeckIds.includes(deck.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLinkedDeckIds([...linkedDeckIds, deck.id]);
                      } else {
                        setLinkedDeckIds(linkedDeckIds.filter(id => id !== deck.id));
                      }
                    }}
                    disabled={loading}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  />
                  <span style={{ fontSize: 'var(--text-base)' }}>
                    {deck.icon} {deck.name}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                  }}>
                    {deck.cardCount} cards
                  </span>
                </label>
              ))
            )}
          </div>
          {linkedDeckIds.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              {linkedDeckIds.length} deck{linkedDeckIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Linked Notes */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Link to Other Notes (Optional)
          </label>
          <div style={{
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-elevated)',
          }}>
            {allNotes.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                No other notes available
              </div>
            ) : (
              allNotes.map((otherNote) => (
                <label
                  key={otherNote.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color var(--transition-base)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={linkedNoteIds.includes(otherNote.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLinkedNoteIds([...linkedNoteIds, otherNote.id]);
                      } else {
                        setLinkedNoteIds(linkedNoteIds.filter(id => id !== otherNote.id));
                      }
                    }}
                    disabled={loading}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {otherNote.title}
                  </span>
                </label>
              ))
            )}
          </div>
          {linkedNoteIds.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              {linkedNoteIds.length} note{linkedNoteIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Markdown Editor */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Content
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing your note in Markdown..."
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '0.5rem',
        }}>
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            size="lg"
            fullWidth
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {note ? 'Update Note' : 'Create Note'}
          </Button>
        </div>
      </div>
    </form>
  );
}
