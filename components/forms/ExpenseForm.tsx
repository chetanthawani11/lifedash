'use client';

/**
 * EXPENSE FORM COMPONENT
 *
 * Form for creating and editing expenses.
 * Features:
 * - Amount input (converts dollars to cents)
 * - Category selection dropdown
 * - Description and notes
 * - Date picker
 * - Payment method selection
 * - Tags for organization
 * - Recurring expense toggle
 * - Validation with Zod
 */

import { useState, useEffect } from 'react';
import { Expense, CreateExpenseInput, centsToDollars, dollarsToCents, PAYMENT_METHOD_OPTIONS } from '@/types';
import { createExpense, updateExpense, getUserExpenseCategories } from '@/lib/expense-service';
import { ExpenseCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface ExpenseFormProps {
  userId: string;
  expense?: Expense | null; // If editing
  onSuccess: () => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  userId,
  expense,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!expense;

  // Form state
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryId, setCategoryId] = useState(expense?.categoryId || '');
  const [amountDollars, setAmountDollars] = useState(
    expense ? centsToDollars(expense.amount).toString() : ''
  );
  const [currency] = useState(expense?.currency || 'USD');
  const [description, setDescription] = useState(expense?.description || '');
  const [notes, setNotes] = useState(expense?.notes || '');
  const [date, setDate] = useState(
    expense?.date ? new Date(expense.date.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || 'card');
  const [isRecurring, setIsRecurring] = useState(expense?.isRecurring || false);
  const [tags, setTags] = useState<string[]>(expense?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadCategories = async () => {
    try {
      const userCategories = await getUserExpenseCategories(userId);
      setCategories(userCategories);

      // If no category selected and we have categories, select the first one
      if (!categoryId && userCategories.length > 0) {
        setCategoryId(userCategories[0].id);
      }

      setLoadingCategories(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Prepare input data - handle empty notes properly
      const trimmedNotes = notes.trim();
      const input: CreateExpenseInput = {
        categoryId,
        amount: dollarsToCents(parseFloat(amountDollars)),
        currency,
        description: description.trim(),
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        date: new Date(date),
        paymentMethod: paymentMethod as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other',
        isRecurring,
        tags,
      };

      if (isEditing) {
        // For updates, explicitly set notes to null if empty to clear it
        const updateInput = trimmedNotes ? input : { ...input, notes: null };
        await updateExpense(userId, expense.id, updateInput);
        toast.success('Expense updated successfully');
      } else {
        // Create new expense
        await createExpense(userId, input);
        toast.success('Expense created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);

      // Handle validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const fieldErrors: Record<string, string> = {};
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        zodError.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save expense';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Convert categories to select options
  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
  }));

  // Payment method options
  const paymentOptions: SelectOption[] = PAYMENT_METHOD_OPTIONS.map(pm => ({
    value: pm.value,
    label: pm.label,
    icon: pm.icon,
  }));

  if (loadingCategories) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
      }}>
        Loading categories...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
        }}>
          You need to create at least one category before adding expenses.
        </p>
        <Button onClick={onCancel} variant="primary" size="lg">
          Go to Categories
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Amount Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Amount *
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-tertiary)',
            fontWeight: '600',
          }}>
            $
          </span>
          <input
            type="number"
            value={amountDollars}
            onChange={(e) => setAmountDollars(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: 'var(--radius-lg)',
              border: errors.amount ? '2px solid var(--error)' : '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              if (!errors.amount) {
                e.currentTarget.style.borderColor = 'var(--primary-400)';
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.amount ? 'var(--error)' : 'var(--border-light)';
            }}
          />
        </div>
        {errors.amount && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.amount}
          </p>
        )}
      </div>

      {/* Category Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Select
          label="Category *"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
          placeholder="Select a category"
          error={errors.categoryId}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Description *
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Grocery shopping at Whole Foods"
          maxLength={100}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: errors.description ? '2px solid var(--error)' : '2px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            transition: 'border-color var(--transition-base)',
          }}
          onFocus={(e) => {
            if (!errors.description) {
              e.currentTarget.style.borderColor = 'var(--primary-400)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors.description ? 'var(--error)' : 'var(--border-light)';
          }}
        />
        {errors.description && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.description}
          </p>
        )}
      </div>

      {/* Date and Payment Method Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Date Picker */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--text-secondary)',
          }}>
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-base)',
              transition: 'border-color var(--transition-base)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-400)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
          />
        </div>

        {/* Payment Method */}
        <div>
          <style jsx>{`
            div :global(.mb-4) {
              margin-bottom: 0 !important;
            }
          `}</style>
          <Select
            label="Payment Method *"
            value={paymentMethod}
            onChange={setPaymentMethod}
            options={paymentOptions}
          />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional details..."
          maxLength={500}
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-base)',
            transition: 'border-color var(--transition-base)',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-400)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
          }}
        />
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          Tags (Optional, max 5)
        </label>

        {/* Tag input */}
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
                handleAddTag();
              }
            }}
            placeholder="Add a tag..."
            disabled={tags.length >= 5}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="ghost"
            size="sm"
            disabled={!tagInput.trim() || tags.length >= 5}
          >
            Add
          </Button>
        </div>

        {/* Display tags */}
        {tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-600)',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 'var(--text-base)',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Expense Toggle */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-secondary)',
        border: '2px solid var(--border-light)',
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            style={{
              width: '1.25rem',
              height: '1.25rem',
              cursor: 'pointer',
            }}
          />
          <div>
            <div style={{
              fontSize: 'var(--text-base)',
              fontWeight: '500',
              color: 'var(--text-primary)',
            }}>
              Recurring Expense
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}>
              Mark this as a recurring monthly expense (e.g., rent, subscriptions)
            </div>
          </div>
        </label>
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
          disabled={loading || !amountDollars || !categoryId || !description.trim()}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};
