'use client';

// Folder Form - Create or edit flashcard folders

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import {
  createFlashcardFolder,
  updateFlashcardFolder,
  getUserFlashcardFolders,
} from '@/lib/flashcard-service';
import { FlashcardFolder } from '@/types';
import toast from 'react-hot-toast';

// Default colors for folders
const DEFAULT_FOLDER_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

// Default icons for folders (using Unicode escapes to avoid encoding issues)
const DEFAULT_FOLDER_ICONS = [
  '\uD83D\uDCC1', // folder
  '\uD83D\uDCC2', // open folder
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
];

interface FolderFormProps {
  userId: string;
  folder?: FlashcardFolder | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FolderForm({ userId, folder, onSuccess, onCancel }: FolderFormProps) {
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [color, setColor] = useState(folder?.color || DEFAULT_FOLDER_COLORS[0]);
  const [icon, setIcon] = useState(folder?.icon || DEFAULT_FOLDER_ICONS[0]);
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setLoading(true);

    try {
      if (folder) {
        // Update existing folder
        await updateFlashcardFolder(userId, folder.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          icon,
        });
        toast.success('Folder updated successfully!');
      } else {
        // Create new folder
        await createFlashcardFolder(userId, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          icon,
        });
        toast.success('Folder created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving folder:', error);
      toast.error('Failed to save folder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Folder Name */}
        <Input
          label="Folder Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Math, Science, Languages"
          required
          disabled={loading}
        />

        {/* Description */}
        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will you study in this folder?"
          rows={3}
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
            {DEFAULT_FOLDER_ICONS.map((ic) => (
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
            {DEFAULT_FOLDER_COLORS.map((c) => (
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
                {name || 'Folder Name'}
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
            {folder ? 'Update Folder' : 'Create Folder'}
          </Button>
        </div>
      </div>
    </form>
  );
}
