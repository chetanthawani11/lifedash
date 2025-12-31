'use client';

/**
 * TASK FORM COMPONENT
 *
 * Form for creating and editing tasks.
 * Features:
 * - Title input (required)
 * - Description textarea (optional)
 * - Due date picker (optional)
 * - Priority selection (Low, Medium, High, Urgent)
 * - Status selection (To Do, In Progress, Completed, Cancelled)
 * - Category input (optional)
 * - Tags input (optional, max 10)
 * - Estimated time input (optional)
 * - Validation with Zod
 *
 * WHAT EACH FIELD DOES:
 * - Title: The main task name (e.g., "Finish homework")
 * - Description: More details about the task
 * - Due Date: When the task should be completed by
 * - Priority: How important/urgent the task is
 * - Status: Current state of the task
 * - Category: Group tasks together (e.g., "Work", "Personal")
 * - Tags: Labels for better organization (e.g., "urgent", "project-x")
 * - Estimated Time: How long you think it will take
 */

import { useState } from 'react';
import {
  Task,
  CreateTaskInput,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  RECURRING_PATTERN_OPTIONS,
  DAYS_OF_WEEK_OPTIONS,
  RecurringPattern,
  DayOfWeek,
  CreateRecurringSeriesInput,
} from '@/types';
import { createTask, updateTask, createRecurringSeries } from '@/lib/task-service';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface TaskFormProps {
  userId: string;
  task?: Task | null; // If editing an existing task
  onSuccess: () => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  userId,
  task,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!task;

  // Form state - each useState holds one field's value
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate
      ? new Date(task.dueDate.toDate()).toISOString().split('T')[0]
      : ''
  );
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [category, setCategory] = useState(task?.category || '');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task?.estimatedMinutes?.toString() || ''
  );

  // Recurring task state
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>(
    task?.recurringPattern || 'daily'
  );
  const [recurringInterval, setRecurringInterval] = useState('1');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [maxOccurrences, setMaxOccurrences] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // If creating a new recurring task, create a recurring series
      if (!isEditing && isRecurring) {
        // Validate due date is required for recurring tasks
        if (!dueDate) {
          setErrors({ dueDate: 'Start date is required for recurring tasks' });
          setLoading(false);
          return;
        }

        // Prepare recurring series input
        const seriesInput: CreateRecurringSeriesInput = {
          title: title.trim(),
          description: description.trim() || null,
          priority: priority as 'low' | 'medium' | 'high' | 'urgent',
          category: category.trim() || null,
          tags,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
          startDate: new Date(dueDate),
          recurringConfig: {
            pattern: recurringPattern,
            interval: parseInt(recurringInterval) || 1,
            daysOfWeek: recurringPattern === 'weekly' && selectedDaysOfWeek.length > 0
              ? selectedDaysOfWeek
              : undefined,
            dayOfMonth: recurringPattern === 'monthly' && dayOfMonth
              ? parseInt(dayOfMonth)
              : undefined,
            endDate: recurringEndDate ? new Date(recurringEndDate) : null,
            maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : null,
          },
        };

        await createRecurringSeries(userId, seriesInput);
        toast.success('Recurring task created successfully!');
        onSuccess();
        return;
      }

      // Prepare input data for regular task
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority as 'low' | 'medium' | 'high' | 'urgent',
        status: status as 'todo' | 'in_progress' | 'completed' | 'cancelled',
        category: category.trim() || null,
        tags,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        isRecurring: false,
        recurringPattern: null,
        recurringSeriesId: null,
        parentTaskId: null,
      };

      if (isEditing && task) {
        // Update existing task
        await updateTask(userId, task.id, input);
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await createTask(userId, input);
        toast.success('Task created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving task:', error);

      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const fieldErrors: Record<string, string> = {};
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        zodError.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save task';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Handle toggling a day of week for recurring
  const handleToggleDayOfWeek = (day: DayOfWeek) => {
    if (selectedDaysOfWeek.includes(day)) {
      setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== day));
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, day]);
    }
  };

  // Convert options to Select format
  const priorityOptions: SelectOption[] = TASK_PRIORITY_OPTIONS.map(p => ({
    value: p.value,
    label: `${p.icon} ${p.label}`,
  }));

  const statusOptions: SelectOption[] = TASK_STATUS_OPTIONS.map(s => ({
    value: s.value,
    label: s.label,
  }));

  const patternOptions: SelectOption[] = RECURRING_PATTERN_OPTIONS.map(p => ({
    value: p.value,
    label: p.label,
  }));

  // Common input styles
  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-lg)',
    border: '2px solid var(--border-light)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 'var(--text-base)',
    transition: 'border-color var(--transition-base)',
  };

  const inputFocusStyle = (hasError: boolean) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!hasError) {
        e.currentTarget.style.borderColor = 'var(--primary-400)';
      }
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = hasError ? 'var(--error)' : 'var(--border-light)';
    },
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: 'var(--text-sm)',
    fontWeight: '500' as const,
    color: 'var(--text-secondary)',
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          Task Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          style={{
            ...inputStyle,
            border: errors.title ? '2px solid var(--error)' : '2px solid var(--border-light)',
          }}
          {...inputFocusStyle(!!errors.title)}
        />
        {errors.title && (
          <p style={{
            marginTop: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--error)',
          }}>
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about this task..."
          maxLength={2000}
          rows={3}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          {...inputFocusStyle(false)}
        />
      </div>

      {/* Due Date and Priority Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Due Date */}
        <div>
          <label style={labelStyle}>
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
            {...inputFocusStyle(false)}
          />
        </div>

        {/* Priority */}
        <div>
          <Select
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={priorityOptions}
          />
        </div>
      </div>

      {/* Status and Category Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Status */}
        <div>
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>
            Category (Optional)
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Work, Personal, Health"
            maxLength={30}
            style={inputStyle}
            {...inputFocusStyle(false)}
          />
        </div>
      </div>

      {/* Estimated Time */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          Estimated Time (Optional)
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="30"
            min="1"
            max="10080"
            style={{
              ...inputStyle,
              width: '120px',
            }}
            {...inputFocusStyle(false)}
          />
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            minutes
          </span>
          {estimatedMinutes && parseInt(estimatedMinutes) >= 60 && (
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              ({Math.floor(parseInt(estimatedMinutes) / 60)}h {parseInt(estimatedMinutes) % 60}m)
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>
          Tags (Optional, max 10)
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
            disabled={tags.length >= 10}
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
            disabled={!tagInput.trim() || tags.length >= 10}
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
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Task Section - Only show when creating new task */}
      {!isEditing && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--border-light)',
          backgroundColor: isRecurring ? 'var(--primary-50)' : 'var(--bg-secondary)',
        }}>
          {/* Recurring Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isRecurring ? '1rem' : 0,
          }}>
            <div>
              <label style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                Recurring Task
              </label>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                marginTop: '2px',
              }}>
                Automatically repeat this task
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: isRecurring ? 'var(--primary-500)' : 'var(--bg-tertiary)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color var(--transition-base)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: isRecurring ? '22px' : '2px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)',
                transition: 'left var(--transition-base)',
              }} />
            </button>
          </div>

          {/* Recurring Configuration */}
          {isRecurring && (
            <div style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1rem',
            }}>
              {/* Pattern and Interval Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                {/* Pattern Selection */}
                <div>
                  <Select
                    label="Repeat"
                    value={recurringPattern}
                    onChange={(value) => setRecurringPattern(value as RecurringPattern)}
                    options={patternOptions}
                  />
                </div>

                {/* Interval */}
                <div>
                  <label style={labelStyle}>
                    Every
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <input
                      type="number"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(e.target.value)}
                      min="1"
                      max="365"
                      style={{
                        ...inputStyle,
                        width: '80px',
                      }}
                    />
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                    }}>
                      {recurringPattern === 'daily' && (parseInt(recurringInterval) === 1 ? 'day' : 'days')}
                      {recurringPattern === 'weekly' && (parseInt(recurringInterval) === 1 ? 'week' : 'weeks')}
                      {recurringPattern === 'monthly' && (parseInt(recurringInterval) === 1 ? 'month' : 'months')}
                      {recurringPattern === 'yearly' && (parseInt(recurringInterval) === 1 ? 'year' : 'years')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Days of Week - Only for Weekly */}
              {recurringPattern === 'weekly' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>
                    On these days
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}>
                    {DAYS_OF_WEEK_OPTIONS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleToggleDayOfWeek(day.value)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-lg)',
                          border: '2px solid',
                          borderColor: selectedDaysOfWeek.includes(day.value)
                            ? 'var(--primary-500)'
                            : 'var(--border-light)',
                          backgroundColor: selectedDaysOfWeek.includes(day.value)
                            ? 'var(--primary-500)'
                            : 'var(--bg-primary)',
                          color: selectedDaysOfWeek.includes(day.value)
                            ? 'white'
                            : 'var(--text-secondary)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all var(--transition-base)',
                        }}
                      >
                        {day.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day of Month - Only for Monthly */}
              {recurringPattern === 'monthly' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>
                    Day of month (optional)
                  </label>
                  <input
                    type="number"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    min="1"
                    max="31"
                    placeholder="Same as start date"
                    style={{
                      ...inputStyle,
                      width: '180px',
                    }}
                  />
                </div>
              )}

              {/* End Date and Max Occurrences */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                <div>
                  <label style={labelStyle}>
                    End date (optional)
                  </label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    min={dueDate || new Date().toISOString().split('T')[0]}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Max occurrences (optional)
                  </label>
                  <input
                    type="number"
                    value={maxOccurrences}
                    onChange={(e) => setMaxOccurrences(e.target.value)}
                    min="1"
                    max="1000"
                    placeholder="Unlimited"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Preview:</strong>{' '}
                {recurringPattern === 'daily' && (
                  parseInt(recurringInterval) === 1
                    ? 'Every day'
                    : `Every ${recurringInterval} days`
                )}
                {recurringPattern === 'weekly' && (
                  <>
                    {parseInt(recurringInterval) === 1 ? 'Every week' : `Every ${recurringInterval} weeks`}
                    {selectedDaysOfWeek.length > 0 && (
                      ` on ${selectedDaysOfWeek.map(d =>
                        DAYS_OF_WEEK_OPTIONS.find(opt => opt.value === d)?.label
                      ).join(', ')}`
                    )}
                  </>
                )}
                {recurringPattern === 'monthly' && (
                  <>
                    {parseInt(recurringInterval) === 1 ? 'Every month' : `Every ${recurringInterval} months`}
                    {dayOfMonth && ` on day ${dayOfMonth}`}
                  </>
                )}
                {recurringPattern === 'yearly' && (
                  parseInt(recurringInterval) === 1
                    ? 'Every year'
                    : `Every ${recurringInterval} years`
                )}
                {recurringEndDate && ` until ${new Date(recurringEndDate).toLocaleDateString()}`}
                {maxOccurrences && ` (max ${maxOccurrences} times)`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show recurring info for existing recurring tasks */}
      {isEditing && task?.isRecurring && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--primary-50)',
          border: '2px solid var(--primary-200)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--primary-700)',
            fontWeight: '600',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🔄</span>
            Recurring Task
          </div>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginTop: '0.5rem',
          }}>
            This is an instance of a recurring task. Changes to this task will only affect this instance.
            To edit the recurring pattern, go to the Recurring Tasks manager.
          </p>
        </div>
      )}

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
          disabled={loading || !title.trim()}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Task' : isRecurring ? 'Create Recurring Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
