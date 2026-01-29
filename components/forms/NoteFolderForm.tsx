'use client';

// Note Folder Form - Create or edit note folders
// This component lets you create folders to organize your notes

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createNoteFolder, updateNoteFolder } from '@/lib/note-service';
import { NoteFolder } from '@/types';
import toast from 'react-hot-toast';

interface NoteFolderFormProps {
  userId: string;
  folder?: NoteFolder | null;  // If editing existing folder
  parentId?: string | null;     // If creating subfolder
  onSuccess: () => void;
  onCancel: () => void;
}

// Preset colors to choose from
const FOLDER_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

export function NoteFolderForm({ userId, folder, parentId, onSuccess, onCancel }: NoteFolderFormProps) {
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [color, setColor] = useState(folder?.color || '#3b82f6');
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
        await updateNoteFolder(userId, folder.id, {
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
        toast.success('Folder updated successfully');
      } else {
        // Create new folder
        await createNoteFolder(userId, {
          name: name.trim(),
          description: description.trim() || null,
          color,
          parentId: parentId || null,
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
          placeholder="e.g., Web Development"
          required
          disabled={loading}
        />

        {/* Description */}
        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this folder contains..."
          rows={2}
          disabled={loading}
        />

        {/* Color Picker */}
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
            {FOLDER_COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                disabled={loading}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: colorOption.value,
                  border: color === colorOption.value ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
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
