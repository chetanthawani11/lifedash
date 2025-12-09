'use client';

// Flashcard Form - Create or edit flashcards with front/back content and tags

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import {
  createFlashcard,
  updateFlashcard,
} from '@/lib/flashcard-service';
import { Flashcard } from '@/types';
import toast from 'react-hot-toast';

interface FlashcardFormProps {
  userId: string;
  deckId: string;
  flashcard?: Flashcard | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FlashcardForm({ userId, deckId, flashcard, onSuccess, onCancel }: FlashcardFormProps) {
  const [front, setFront] = useState(flashcard?.front || '');
  const [back, setBack] = useState(flashcard?.back || '');
  const [notes, setNotes] = useState(flashcard?.notes || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(flashcard?.tags || []);
  const [loading, setLoading] = useState(false);

  // Add a tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!front.trim()) {
      toast.error('Please enter the front of the flashcard');
      return;
    }

    if (!back.trim()) {
      toast.error('Please enter the back of the flashcard');
      return;
    }

    setLoading(true);

    try {
      if (flashcard) {
        // Update existing flashcard
        const updateData: any = {
          front: front.trim(),
          back: back.trim(),
          tags,
        };

        // Only include notes if it has a value
        if (notes.trim()) {
          updateData.notes = notes.trim();
        }

        await updateFlashcard(userId, flashcard.id, updateData);
        toast.success('Flashcard updated successfully!');
      } else {
        // Create new flashcard
        const createData: any = {
          deckId,
          front: front.trim(),
          back: back.trim(),
          tags,
        };

        // Only include notes if it has a value
        if (notes.trim()) {
          createData.notes = notes.trim();
        }

        await createFlashcard(userId, createData);
        toast.success('Flashcard created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving flashcard:', error);
      toast.error('Failed to save flashcard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Front of Card */}
        <Textarea
          label="Front (Question/Prompt)"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="e.g., What is the capital of France?"
          rows={3}
          required
          disabled={loading}
        />

        {/* Back of Card */}
        <Textarea
          label="Back (Answer)"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="e.g., Paris"
          rows={3}
          required
          disabled={loading}
        />

        {/* Notes (Optional) */}
        <Textarea
          label="Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes or hints..."
          rows={2}
          disabled={loading}
        />

        {/* Tags */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Tags (Optional)
          </label>

          {/* Tag Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag..."
              disabled={loading}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="ghost"
              size="md"
              disabled={loading || !tagInput.trim()}
            >
              Add Tag
            </Button>
          </div>

          {/* Display Tags */}
          {tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                  }}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-700)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      padding: '0',
                      fontSize: '1rem',
                      lineHeight: '1',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: '0.75rem',
          }}>
            Preview:
          </p>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: '0.25rem',
            }}>
              FRONT
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}>
              {front || 'Question will appear here...'}
            </div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginBottom: '0.25rem',
            }}>
              BACK
            </div>
            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}>
              {back || 'Answer will appear here...'}
            </div>
          </div>
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
            {flashcard ? 'Update Flashcard' : 'Create Flashcard'}
          </Button>
        </div>
      </div>
    </form>
  );
}
