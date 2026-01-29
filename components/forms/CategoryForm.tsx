'use client';

/**
 * CATEGORY FORM COMPONENT
 *
 * Form for creating and editing expense categories.
 * Features:
 * - Name input
 * - Color picker
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
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
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
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Color *
        </label>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          {COLOR_OPTIONS.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => setColor(colorOption.value)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: colorOption.value,
                border: color === colorOption.value ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Budget Input */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
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

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
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
          disabled={loading || !name.trim()}
        >
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
