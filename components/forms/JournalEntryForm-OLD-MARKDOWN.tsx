'use client';

/**
 * JOURNAL ENTRY FORM COMPONENT
 *
 * This form is used for creating NEW entries and EDITING existing ones.
 * Features:
 * - Title and content fields
 * - Markdown editor with live preview
 * - Mood tracking (😄 😐 😢)
 * - Tags input
 * - Favorite toggle
 * - Preview/Edit mode toggle
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/Button';
import { CreateJournalEntryInput, JournalEntry, Mood } from '@/types';
import { createJournalEntry, updateJournalEntry } from '@/lib/journal-service';
import toast from 'react-hot-toast';

// Mood options with emojis
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
  entry?: JournalEntry | null; // If provided, we're editing
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
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(entry?.mood || null);
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite || false);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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

  const content = watch('content');

  // Handle tag addition
  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase().replace(/^#/, ''); // Remove # if present
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

  // Formatting helper functions
  const insertFormatting = (before: string, after: string = before, placeholder: string = 'text') => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = textareaRef.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText =
      textareaRef.value.substring(0, start) +
      before + textToInsert + after +
      textareaRef.value.substring(end);

    setValue('content', newText);

    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = start + before.length + textToInsert.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const formatBold = () => insertFormatting('**', '**', 'bold text');
  const formatItalic = () => insertFormatting('*', '*', 'italic text');
  const formatStrikethrough = () => insertFormatting('~~', '~~', 'strikethrough');
  const formatCode = () => insertFormatting('`', '`', 'code');
  const formatHeading = (level: number) => {
    const hashes = '#'.repeat(level);
    insertFormatting(`${hashes} `, '', 'Heading');
  };
  const formatLink = () => insertFormatting('[', '](https://example.com)', 'link text');
  const formatQuote = () => insertFormatting('> ', '', 'quote');
  const formatBulletList = () => insertFormatting('- ', '', 'list item');
  const formatNumberedList = () => insertFormatting('1. ', '', 'list item');

  // Handle form submission
  const onSubmit = async (data: CreateJournalEntryInput) => {
    setLoading(true);

    try {
      if (entry) {
        // UPDATE existing entry
        await updateJournalEntry(userId, entry.id, {
          title: data.title,
          content: data.content,
          mood: selectedMood,
          tags,
          isFavorite,
        });
        toast.success('Entry updated successfully! ✅');
      } else {
        // CREATE new entry
        await createJournalEntry(userId, {
          journalId,
          title: data.title,
          content: data.content,
          mood: selectedMood,
          tags,
          isFavorite,
        });
        toast.success('Entry created successfully! 🎉');
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
        }}>
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelectedMood(mood.value)}
              style={{
                flex: 1,
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

      {/* Preview Toggle */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.25rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            backgroundColor: !showPreview ? 'var(--bg-elevated)' : 'transparent',
            color: !showPreview ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: !showPreview ? 'var(--shadow-sm)' : 'none',
          }}
        >
          ✏️ Write
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            backgroundColor: showPreview ? 'var(--bg-elevated)' : 'transparent',
            color: showPreview ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: showPreview ? 'var(--shadow-sm)' : 'none',
          }}
        >
          👁️ Preview
        </button>
      </div>

      {/* Content Editor / Preview */}
      <div style={{
        minHeight: '300px',
        maxHeight: '500px',
        overflow: 'auto',
      }}>
        {showPreview ? (
          // Preview Mode
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-light)',
            minHeight: '300px',
          }}>
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 style={{
                      fontSize: 'var(--text-3xl)',
                      fontWeight: '700',
                      marginBottom: '1rem',
                      color: 'var(--text-primary)',
                    }} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      marginTop: '1.5rem',
                      color: 'var(--text-primary)',
                    }} {...props} />
                  ),
                  h3: ({ node, ...props}) => (
                    <h3 style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      marginTop: '1rem',
                      color: 'var(--text-primary)',
                    }} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{
                      marginBottom: '1rem',
                      lineHeight: '1.7',
                      color: 'var(--text-secondary)',
                    }} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul style={{
                      marginLeft: '1.5rem',
                      marginBottom: '1rem',
                      listStyle: 'disc',
                      color: 'var(--text-secondary)',
                    }} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol style={{
                      marginLeft: '1.5rem',
                      marginBottom: '1rem',
                      listStyle: 'decimal',
                      color: 'var(--text-secondary)',
                    }} {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code style={{
                      backgroundColor: 'var(--bg-elevated)',
                      padding: '0.2rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9em',
                      fontFamily: 'monospace',
                      color: 'var(--primary-500)',
                    }} {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote style={{
                      borderLeft: '4px solid var(--primary-400)',
                      paddingLeft: '1rem',
                      marginLeft: 0,
                      marginBottom: '1rem',
                      fontStyle: 'italic',
                      color: 'var(--text-tertiary)',
                    }} {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p style={{
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
              }}>
                Nothing to preview yet. Start writing to see your content rendered!
              </p>
            )}
          </div>
        ) : (
          // Edit Mode
          <div>
            {/* Formatting Toolbar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              border: '2px solid var(--border-light)',
              borderBottom: 'none',
            }}>
              {/* Bold */}
              <button
                type="button"
                onClick={formatBold}
                title="Bold (Ctrl+B)"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <strong>B</strong>
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={formatItalic}
                title="Italic (Ctrl+I)"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontStyle: 'italic',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                I
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={formatStrikethrough}
                title="Strikethrough"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  textDecoration: 'line-through',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                S
              </button>

              <div style={{
                width: '1px',
                backgroundColor: 'var(--border-light)',
                margin: '0 0.25rem',
              }} />

              {/* Heading 1 */}
              <button
                type="button"
                onClick={() => formatHeading(1)}
                title="Heading 1"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                H1
              </button>

              {/* Heading 2 */}
              <button
                type="button"
                onClick={() => formatHeading(2)}
                title="Heading 2"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                H2
              </button>

              {/* Heading 3 */}
              <button
                type="button"
                onClick={() => formatHeading(3)}
                title="Heading 3"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                H3
              </button>

              <div style={{
                width: '1px',
                backgroundColor: 'var(--border-light)',
                margin: '0 0.25rem',
              }} />

              {/* Bullet List */}
              <button
                type="button"
                onClick={formatBulletList}
                title="Bullet List"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                • List
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onClick={formatNumberedList}
                title="Numbered List"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                1. List
              </button>

              <div style={{
                width: '1px',
                backgroundColor: 'var(--border-light)',
                margin: '0 0.25rem',
              }} />

              {/* Quote */}
              <button
                type="button"
                onClick={formatQuote}
                title="Quote"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                " Quote
              </button>

              {/* Code */}
              <button
                type="button"
                onClick={formatCode}
                title="Inline Code"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                {'</>'}
              </button>

              {/* Link */}
              <button
                type="button"
                onClick={formatLink}
                title="Link"
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                  e.currentTarget.style.borderColor = 'var(--primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                🔗 Link
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={(ref) => {
                setTextareaRef(ref);
                register('content').ref(ref);
              }}
              placeholder="Start writing your thoughts..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1.5rem',
                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                border: errors.content ? '2px solid var(--error)' : '2px solid var(--border-light)',
                borderTop: 'none',
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
        )}
      </div>

      {/* Tags Input */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Tags
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
                    fontSize: '1rem',
                    padding: 0,
                    lineHeight: 1,
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
          {loading
            ? (entry ? 'Saving...' : 'Creating...')
            : (entry ? 'Save Entry' : 'Create Entry')
          }
        </Button>
      </div>
    </form>
  );
};
