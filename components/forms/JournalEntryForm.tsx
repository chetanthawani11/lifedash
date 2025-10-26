'use client';

/**
 * SIMPLIFIED JOURNAL ENTRY FORM
 *
 * Clean, simple form for creating and editing journal entries.
 * No markdown - just plain text that works!
 *
 * Features:
 * - Title and content (plain text)
 * - Mood tracking
 * - Tags
 * - Favorite toggle
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CreateJournalEntryInput, JournalEntry, Mood } from '@/types';
import { createJournalEntry, updateJournalEntry } from '@/lib/journal-service';
import toast from 'react-hot-toast';

// Mood options
const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😟' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
];

interface JournalEntryFormProps {
  userId: string;
  journalId: string;
  entry?: JournalEntry | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const JournalEntryForm = ({
  userId,
  journalId,
  entry,
  onSuccess,
  onCancel,
}: JournalEntryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(entry?.mood || null);
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite || false);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateJournalEntryInput>({
    defaultValues: {
      journalId,
      title: entry?.title || '',
      content: entry?.content || '',
      mood: entry?.mood || null,
      tags: entry?.tags || [],
      isFavorite: entry?.isFavorite || false,
    },
  });

  // Add tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      setTags(newTags);
      setValue('tags', newTags);
    }
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Submit form
  const onSubmit = async (data: CreateJournalEntryInput) => {
    setLoading(true);

    try {
      if (entry) {
        // Update
        await updateJournalEntry(userId, entry.id, {
          title: data.title,
          content: data.content,
          mood: selectedMood,
          tags,
          isFavorite,
        });
        toast.success('Entry updated! ✅');
      } else {
        // Create
        await createJournalEntry(userId, {
          journalId,
          title: data.title,
          content: data.content,
          mood: selectedMood,
          tags,
          isFavorite,
        });
        toast.success('Entry created! 🎉');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      toast.error(error.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Entry title..."
          style={{
            width: '100%',
            padding: '0.75rem 0',
            border: 'none',
            borderBottom: errors.title ? '2px solid var(--error)' : '2px solid var(--border-light)',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            outline: 'none',
            transition: 'all var(--transition-base)',
          }}
          {...register('title', {
            required: 'Title is required',
            maxLength: {
              value: 200,
              message: 'Title must be less than 200 characters',
            },
          })}
          onFocus={(e) => {
            e.target.style.borderBottomColor = 'var(--primary-400)';
          }}
          onBlur={(e) => {
            e.target.style.borderBottomColor = errors.title ? 'var(--error)' : 'var(--border-light)';
          }}
        />
        {errors.title && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Mood Selector */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          How are you feeling?
        </label>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
              style={{
                flex: '1 1 calc(20% - 0.75rem)',
                minWidth: '80px',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedMood === mood.value
                  ? 'var(--primary-500)'
                  : 'var(--bg-secondary)',
                border: selectedMood === mood.value
                  ? '2px solid var(--primary-400)'
                  : '2px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{mood.emoji}</span>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: '500',
                color: selectedMood === mood.value ? '#ffffff' : 'var(--text-secondary)',
              }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Simple Textarea */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          What's on your mind?
        </label>
        <textarea
          placeholder="Start writing your thoughts..."
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: errors.content ? '2px solid var(--error)' : '2px solid var(--border-light)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            resize: 'vertical',
            lineHeight: '1.7',
            fontFamily: 'inherit',
            transition: 'all var(--transition-base)',
          }}
          {...register('content', {
            required: 'Content is required',
            maxLength: {
              value: 50000,
              message: 'Content is too long (max 50,000 characters)',
            },
          })}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-400)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errors.content ? 'var(--error)' : 'var(--border-light)';
          }}
        />
        {errors.content && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.content.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Tags (optional)
        </label>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag (press Enter)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-base)',
              outline: 'none',
              transition: 'all var(--transition-base)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-400)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
            }}
          />
          <Button
            type="button"
            onClick={addTag}
            variant="ghost"
          >
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-600)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-600)',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    padding: 0,
                    lineHeight: 1,
                    fontWeight: '700',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Toggle */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        userSelect: 'none',
      }}>
        <input
          type="checkbox"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          style={{
            width: '1.25rem',
            height: '1.25rem',
            cursor: 'pointer',
          }}
        />
        <span style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-primary)',
          fontWeight: '500',
        }}>
          ⭐ Mark as favorite
        </span>
      </label>

      {/* Buttons */}
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
          {loading
            ? (entry ? 'Saving...' : 'Creating...')
            : (entry ? 'Save Entry' : 'Create Entry')
          }
        </Button>
      </div>
    </form>
  );
};
