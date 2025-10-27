'use client';

/**
 * CATEGORY FORM COMPONENT
 *
 * Form for creating and editing expense categories.
 * Features:
 * - Name input
 * - Color picker
 * - Icon selector (emoji)
 * - Budget input (optional)
 * - Validation with Zod
 * - Success/error handling
 */

import { useState } from 'react';
import { ExpenseCategory, CreateExpenseCategoryInput, centsToDollars, dollarsToCents } from '@/types';
import { createExpenseCategory, updateExpenseCategory } from '@/lib/expense-service';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  userId: string;
  category?: ExpenseCategory | null; // If editing
  onSuccess: () => void;
  onCancel: () => void;
}

// Predefined color options
const COLOR_OPTIONS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#78716c' },
];

// Predefined icon options
const ICON_OPTIONS = [
  '🍔', '🚗', '🛍️', '🎮', '💡', '🏥', '📚', '📦',
  '🏠', '✈️', '🎬', '💪', '🐕', '☕', '🍕', '🎵',
  '💼', '🎨', '⚽', '📱', '💰', '🎁', '🔧', '🌟',
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  userId,
  category,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!category;

  // Form state
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#3b82f6');
  const [icon, setIcon] = useState(category?.icon || '📦');
  const [budgetDollars, setBudgetDollars] = useState(
    category?.budget ? centsToDollars(category.budget).toString() : ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Prepare input data
      const input: CreateExpenseCategoryInput = {
        name: name.trim(),
        color,
        icon,
        budget: budgetDollars.trim() ? dollarsToCents(parseFloat(budgetDollars)) : undefined,
      };

      if (isEditing) {
        // Update existing category
        await updateExpenseCategory(userId, category.id, input);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await createExpenseCategory(userId, input);
        toast.success('Category created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);

      // Handle validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const fieldErrors: Record<string, string> = {};
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        zodError.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save category';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Category Name */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Category Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Food & Dining"
          maxLength={30}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: errors.name ? '2px solid var(--error)' : '2px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            transition: 'border-color var(--transition-base)',
          }}
          onFocus={(e) => {
            if (!errors.name) {
              e.currentTarget.style.borderColor = 'var(--primary-400)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.name ? 'var(--error)' : 'var(--border-light)';
          }}
        />
        {errors.name && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Color Picker */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Color *
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.75rem',
        }}>
          {COLOR_OPTIONS.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => setColor(colorOption.value)}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                backgroundColor: colorOption.value,
                border: color === colorOption.value ? `3px solid var(--text-primary)` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {color === colorOption.value && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.25rem',
                }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Icon *
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '0.5rem',
        }}>
          {ICON_OPTIONS.map((iconOption) => (
            <button
              key={iconOption}
              type="button"
              onClick={() => setIcon(iconOption)}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                backgroundColor: icon === iconOption ? `${color}20` : 'var(--bg-secondary)',
                border: icon === iconOption ? `2px solid ${color}` : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                if (icon !== iconOption) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                if (icon !== iconOption) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {iconOption}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Monthly Budget (Optional)
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-tertiary)',
            fontWeight: '500',
          }}>
            $
          </span>
          <input
            type="number"
            value={budgetDollars}
            onChange={(e) => setBudgetDollars(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2rem',
              borderRadius: 'var(--radius-lg)',
              border: errors.budget ? '2px solid var(--error)' : '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-base)',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              if (!errors.budget) {
                e.currentTarget.style.borderColor = 'var(--primary-400)';
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.budget ? 'var(--error)' : 'var(--border-light)';
            }}
          />
        </div>
        <p style={{
          marginTop: '0.5rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
        }}>
          Set a monthly spending limit for this category
        </p>
        {errors.budget && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.budget}
          </p>
        )}
      </div>

      {/* Preview */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-secondary)',
        border: '2px solid var(--border-light)',
      }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          fontWeight: '500',
          color: 'var(--text-tertiary)',
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Preview
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
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
              marginBottom: '0.25rem',
            }}>
              {name || 'Category Name'}
            </div>
            {budgetDollars && (
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
              }}>
                Budget: ${parseFloat(budgetDollars || '0').toFixed(2)}/month
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
          disabled={loading || !name.trim()}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};
