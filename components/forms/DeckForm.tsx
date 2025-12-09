'use client';

// Deck Form - Create or edit flashcard decks

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import {
  createFlashcardDeck,
  updateFlashcardDeck,
  getUserFlashcardFolders,
} from '@/lib/flashcard-service';
import { FlashcardDeck, FlashcardFolder } from '@/types';
import toast from 'react-hot-toast';

// Default colors for decks
const DEFAULT_DECK_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

// Default icons for decks (using Unicode escapes to avoid encoding issues)
const DEFAULT_DECK_ICONS = [
  '\uD83C\uDFB4', // flower playing card
  '\uD83D\uDCDA', // books
  '\uD83D\uDCD6', // open book
  '\uD83D\uDCDD', // memo
  '\uD83C\uDFAF', // target
  '\uD83E\uDDE0', // brain
  '\uD83D\uDCA1', // lightbulb
  '\uD83C\uDF93', // graduation cap
  '\uD83D\uDCCB', // clipboard
  '\uD83D\uDD2C', // microscope
  '\uD83C\uDFA8', // palette
  '\uD83C\uDFB5', // music
  '\uD83C\uDF0D', // globe
  '\uD83D\uDCBB', // laptop
  '\uD83C\uDFC3', // runner
  '\u2B50', // star
];

interface DeckFormProps {
  userId: string;
  deck?: FlashcardDeck | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeckForm({ userId, deck, onSuccess, onCancel }: DeckFormProps) {
  const [name, setName] = useState(deck?.name || '');
  const [description, setDescription] = useState(deck?.description || '');
  const [color, setColor] = useState(deck?.color || DEFAULT_DECK_COLORS[0]);
  const [icon, setIcon] = useState(deck?.icon || DEFAULT_DECK_ICONS[0]);
  const [folderId, setFolderId] = useState<string | null>(deck?.folderId || null);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FlashcardFolder[]>([]);

  // Load folders for folder selection
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const allFolders = await getUserFlashcardFolders(userId);
        setFolders(allFolders);
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    };

    loadFolders();
  }, [userId]);

  // Folder options
  const folderOptions: SelectOption[] = [
    { value: 'root', label: 'No Folder (Root)', icon: '\uD83D\uDCC1' },
    ...folders.map(f => ({
      value: f.id,
      label: f.name,
      icon: f.icon,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    setLoading(true);

    try {
      if (deck) {
        await updateFlashcardDeck(userId, deck.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          icon,
          folderId: folderId === 'root' ? null : folderId,
        });
        toast.success('Deck updated successfully!');
      } else {
        await createFlashcardDeck(userId, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          icon,
          folderId: folderId === 'root' ? null : folderId,
        });
        toast.success('Deck created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error('Failed to save deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Deck Name */}
        <Input
          label="Deck Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Spanish Verbs, Biology Terms"
          required
          disabled={loading}
        />

        {/* Description */}
        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will you learn in this deck?"
          rows={3}
          disabled={loading}
        />

        {/* Folder Selection */}
        <Select
          label="Folder"
          value={folderId || 'root'}
          onChange={(value) => setFolderId(value === 'root' ? null : value)}
          options={folderOptions}
          disabled={loading}
        />

        {/* Icon Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Icon
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '0.5rem',
          }}>
            {DEFAULT_DECK_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                disabled={loading}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: icon === ic ? 'var(--primary-100)' : 'var(--bg-secondary)',
                  border: icon === ic ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-base)',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && icon !== ic) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (icon !== ic) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Color
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '0.5rem',
          }}>
            {DEFAULT_DECK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                disabled={loading}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: c,
                  border: color === c ? '3px solid var(--text-primary)' : '2px solid var(--border-light)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            ))}
          </div>
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
            marginBottom: '0.5rem',
          }}>
            Preview:
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: `${color}20`,
              border: `2px solid ${color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              {icon}
            </div>
            <div>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                {name || 'Deck Name'}
              </div>
              {description && (
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                }}>
                  {description}
                </div>
              )}
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
            {deck ? 'Update Deck' : 'Create Deck'}
          </Button>
        </div>
      </div>
    </form>
  );
}
