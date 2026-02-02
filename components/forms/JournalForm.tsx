'use client';

/**
 * JOURNAL FORM COMPONENT
 *
 * This form is used for both creating NEW journals and EDITING existing ones.
 * Features:
 * - Name and description fields
 * - Color picker for journal color
 * - Validation with helpful error messages
 * - Loading states
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateJournalInput, Journal } from '@/types';
import { createJournal, updateJournal } from '@/lib/journal-service';
import toast from 'react-hot-toast';

// Predefined color options for journals
const COLOR_OPTIONS = [
  { name: 'Teal', value: '#0d9488' },
  { name: 'Purple', value: '#7209b7' },
  { name: 'Blue', value: '#4361ee' },
  { name: 'Green', value: '#52b788' },
  { name: 'Pink', value: '#ff006e' },
  { name: 'Orange', value: '#fb8500' },
  { name: 'Cyan', value: '#06aed5' },
  { name: 'Red', value: '#ef476f' },
];

interface JournalFormProps {
  userId: string;
  journal?: Journal | null; // If provided, we're editing; otherwise creating
  onSuccess: () => void;     // Called when form submits successfully
  onCancel: () => void;      // Called when user cancels
}

export const JournalForm = ({
  userId,
  journal,
  onSuccess,
  onCancel,
}: JournalFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(journal?.color || COLOR_OPTIONS[0].value);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateJournalInput>({
    defaultValues: {
      name: journal?.name || '',
      description: journal?.description || '',
      color: journal?.color || COLOR_OPTIONS[0].value,
    },
  });

  // Update form values when color selection changes
  useEffect(() => {
    setValue('color', selectedColor);
  }, [selectedColor, setValue]);

  const onSubmit = async (data: CreateJournalInput) => {
    setLoading(true);

    try {
      if (journal) {
        // UPDATE existing journal
        await updateJournal(userId, journal.id, {
          name: data.name,
          description: data.description || null,
          color: selectedColor,
        });
        toast.success(`"${data.name}" updated successfully`);
      } else {
        // CREATE new journal
        await createJournal(userId, {
          name: data.name,
          description: data.description || null,
          color: selectedColor,
        });
        toast.success(`"${data.name}" created successfully`);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving journal:', error);
      toast.error(error.message || 'Failed to save journal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Journal Name */}
      <Input
        label="Journal Name"
        type="text"
        placeholder="e.g., Personal Journal, Dev Diary, Travel Log"
        error={errors.name?.message}
        helperText="Choose a descriptive name for your journal"
        {...register('name', {
          required: 'Journal name is required',
          maxLength: {
            value: 50,
            message: 'Journal name must be less than 50 characters',
          },
        })}
      />

      {/* Journal Description (Optional) */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Description (Optional)
        </label>
        <textarea
          placeholder="What will you write about in this journal?"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: errors.description
              ? '2px solid var(--error)'
              : '1.5px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            resize: 'vertical',
            minHeight: '100px',
            lineHeight: '1.6',
            transition: 'all var(--transition-base)',
          }}
          {...register('description', {
            maxLength: {
              value: 200,
              message: 'Description must be less than 200 characters',
            },
          })}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-400)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-light)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {errors.description && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.description.message}
          </p>
        )}
        <p style={{
          marginTop: '0.5rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          paddingLeft: '0.25rem',
          lineHeight: '1.6',
        }}>
          Add a brief description to help you remember what this journal is for
        </p>
      </div>

      {/* Color Picker */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Color Theme
        </label>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              style={{
                width: '28px',
                height: '28px',
                minWidth: '28px',
                minHeight: '28px',
                maxWidth: '28px',
                maxHeight: '28px',
                borderRadius: '50%',
                backgroundColor: color.value,
                border: selectedColor === color.value
                  ? '2.5px solid var(--text-primary)'
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                flexShrink: 0,
                flexGrow: 0,
                padding: 0,
                boxSizing: 'border-box',
                aspectRatio: '1 / 1',
              }}
              title={color.name}
            />
          ))}
        </div>
        <p style={{
          marginTop: '0.5rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          paddingLeft: '0.25rem',
          lineHeight: '1.5',
        }}>
          Pick a color to identify this journal
        </p>
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
          {loading
            ? (journal ? 'Saving...' : 'Creating...')
            : (journal ? 'Save Changes' : 'Create Journal')
          }
        </Button>
      </div>
    </form>
  );
};
