'use client';

// Folder Form - Create or edit flashcard folders

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import {
  createFlashcardFolder,
  updateFlashcardFolder,
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
        });
        toast.success('Folder updated successfully');
      } else {
        // Create new folder
        await createFlashcardFolder(userId, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        toast.success('Folder created successfully');
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

        {/* Color Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.375rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Color
          </label>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            {DEFAULT_FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                disabled={loading}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: c,
                  border: color === c ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
                  opacity: loading ? 0.5 : 1,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginTop: '0.25rem',
        }}>
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            size="sm"
            fullWidth
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
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
