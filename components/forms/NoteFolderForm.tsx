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

// Common folder icons
const FOLDER_ICONS = ['📁', '📂', '📚', '📖', '📓', '📔', '📕', '📗', '📘', '📙', '🗂️', '🗃️'];

export function NoteFolderForm({ userId, folder, parentId, onSuccess, onCancel }: NoteFolderFormProps) {
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [color, setColor] = useState(folder?.color || '#3b82f6');
  const [icon, setIcon] = useState(folder?.icon || '📁');
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
          icon,
        });
        toast.success('Folder updated successfully!');
      } else {
        // Create new folder
        await createNoteFolder(userId, {
          name: name.trim(),
          description: description.trim() || null,
          color,
          icon,
          parentId: parentId || null,
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

        {/* Icon Picker */}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))',
            gap: '0.5rem',
          }}>
            {FOLDER_ICONS.map((iconOption) => (
              <button
                key={iconOption}
                type="button"
                onClick={() => setIcon(iconOption)}
                disabled={loading}
                style={{
                  padding: '0.75rem',
                  fontSize: '1.5rem',
                  border: icon === iconOption ? '2px solid var(--primary-500)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: icon === iconOption ? 'var(--primary-100)' : 'var(--bg-elevated)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
                }}
              >
                {iconOption}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(5rem, 1fr))',
            gap: '0.5rem',
          }}>
            {FOLDER_COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                disabled={loading}
                style={{
                  padding: '0.75rem',
                  border: color === colorOption.value ? '2px solid var(--text-primary)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: colorOption.value,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: '500',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}>
                  {colorOption.name}
                </span>
              </button>
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
            marginBottom: '0.75rem',
          }}>
            Preview:
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${color}`,
          }}>
            <div style={{
              fontSize: '2rem',
              width: '3rem',
              height: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${color}20`,
              borderRadius: 'var(--radius-md)',
            }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
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
