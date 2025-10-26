'use client';

/**
 * JOURNAL FORM COMPONENT
 *
 * This form is used for both creating NEW journals and EDITING existing ones.
 * Features:
 * - Name and description fields
 * - Color picker for journal color
 * - Icon/emoji picker
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
  { name: 'Orange', value: '#f26419' },
  { name: 'Purple', value: '#7209b7' },
  { name: 'Blue', value: '#4361ee' },
  { name: 'Green', value: '#52b788' },
  { name: 'Pink', value: '#ff006e' },
  { name: 'Yellow', value: '#fb8500' },
  { name: 'Teal', value: '#06aed5' },
  { name: 'Red', value: '#ef476f' },
];

// Predefined icon/emoji options
const ICON_OPTIONS = [
  '📔', '📓', '📕', '📗', '📘', '📙',
  '📖', '📚', '✍️', '📝', '🖊️', '✏️',
  '💭', '💡', '🎨', '🌟', '✨', '🔥',
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
  const [selectedIcon, setSelectedIcon] = useState(journal?.icon || ICON_OPTIONS[0]);

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
      icon: journal?.icon || ICON_OPTIONS[0],
    },
  });

  // Update form values when color/icon selection changes
  useEffect(() => {
    setValue('color', selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    setValue('icon', selectedIcon);
  }, [selectedIcon, setValue]);

  const onSubmit = async (data: CreateJournalInput) => {
    setLoading(true);

    try {
      if (journal) {
        // UPDATE existing journal
        await updateJournal(userId, journal.id, {
          name: data.name,
          description: data.description || null,
          color: selectedColor,
          icon: selectedIcon,
        });
        toast.success(`"${data.name}" updated successfully! ✅`);
      } else {
        // CREATE new journal
        await createJournal(userId, {
          name: data.name,
          description: data.description || null,
          color: selectedColor,
          icon: selectedIcon,
        });
        toast.success(`"${data.name}" created successfully! 🎉`);
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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          marginBottom: '0.5rem',
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
          marginBottom: '0.75rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Color Theme
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
          gap: '0.75rem',
        }}>
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: color.value,
                border: selectedColor === color.value
                  ? '3px solid var(--text-primary)'
                  : '2px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                position: 'relative',
              }}
              title={color.name}
            >
              {selectedColor === color.value && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.5rem',
                }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
        <p style={{
          marginTop: '0.75rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          paddingLeft: '0.25rem',
          lineHeight: '1.6',
        }}>
          Pick a color to help you identify this journal
        </p>
      </div>

      {/* Icon Picker */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Icon
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
          gap: '0.75rem',
        }}>
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setSelectedIcon(icon)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedIcon === icon
                  ? `${selectedColor}30`
                  : 'var(--bg-secondary)',
                border: selectedIcon === icon
                  ? `3px solid ${selectedColor}`
                  : '2px solid var(--border-light)',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-base)',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
        <p style={{
          marginTop: '0.75rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          paddingLeft: '0.25rem',
          lineHeight: '1.6',
        }}>
          Choose an icon that represents this journal
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
      }}>
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          size="lg"
          style={{ flex: 1 }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
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
