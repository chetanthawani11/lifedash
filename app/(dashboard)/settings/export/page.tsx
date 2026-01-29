'use client';

/**
 * DATA EXPORT PAGE
 *
 * Allows users to export their data in multiple formats.
 * Supports selective export by data type and date range.
 */

import { useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import {
  DataType,
  ExportFormat,
  exportAndDownload,
  createBackup,
  parseBackupFile,
  restoreFromBackup,
  RestoreResult,
} from '@/lib/export-service';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Data type options with labels and icons
const dataTypeOptions: { value: DataType; label: string; description: string }[] = [
  { value: 'journals', label: 'Journals', description: 'All journals and entries' },
  { value: 'expenses', label: 'Expenses', description: 'Expenses and categories' },
  { value: 'tasks', label: 'Tasks', description: 'All tasks and their status' },
  { value: 'flashcards', label: 'Flashcards', description: 'Decks and flashcards' },
  { value: 'notes', label: 'Notes', description: 'Quick notes' },
  { value: 'goals', label: 'Goals', description: 'Goals and progress' },
];

// Format options
const formatOptions: { value: ExportFormat; label: string; description: string; extension: string }[] = [
  { value: 'json', label: 'JSON', description: 'Structured data format, best for backups', extension: '.json' },
  { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible format', extension: '.csv' },
  { value: 'markdown', label: 'Markdown', description: 'Human-readable text format', extension: '.md' },
];

function ExportContent() {
  const { user } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState<DataType[]>(['journals', 'expenses', 'tasks', 'flashcards', 'notes', 'goals']);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle data type selection
  const toggleDataType = (type: DataType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Select/deselect all
  const toggleAll = () => {
    if (selectedTypes.length === dataTypeOptions.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(dataTypeOptions.map((opt) => opt.value));
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!user) {
      toast.error('You must be logged in to export data');
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error('Please select at least one data type to export');
      return;
    }

    if (useDateRange && (!startDate || !endDate)) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (useDateRange && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setExporting(true);

    try {
      await exportAndDownload(user.uid, {
        dataTypes: selectedTypes,
        format,
        dateRange: useDateRange
          ? {
              start: new Date(startDate),
              end: new Date(endDate),
            }
          : undefined,
      });

      toast.success('Export downloaded successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Handle backup
  const handleBackup = async () => {
    if (!user) {
      toast.error('You must be logged in to create a backup');
      return;
    }

    setCreatingBackup(true);

    try {
      await createBackup(user.uid);
      toast.success('Backup downloaded successfully');
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Failed to create backup. Please try again.');
    } finally {
      setCreatingBackup(false);
    }
  };

  // Handle restore file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON backup file');
      return;
    }

    setRestoring(true);
    setRestoreResult(null);

    try {
      const content = await file.text();
      const backupData = parseBackupFile(content);

      if (!backupData) {
        toast.error('Invalid backup file format');
        setRestoring(false);
        return;
      }

      const result = await restoreFromBackup(user.uid, backupData, { overwrite: false });
      setRestoreResult(result);

      if (result.success) {
        toast.success('Data restored successfully!');
      } else if (result.errors.length > 0) {
        toast.error(`Restored with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Failed to restore data. Please try again.');
    } finally {
      setRestoring(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const allSelected = selectedTypes.length === dataTypeOptions.length;

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header with back link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            textDecoration: 'none',
            marginBottom: '0.5rem',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}
        >
          Export Data
        </h1>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
          }}
        >
          Download your data in various formats
        </p>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Data Types Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                }}
              >
                Select Data
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                }}
              >
                Choose which data to include in your export
              </p>
            </div>
            <button
              onClick={toggleAll}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--text-xs)',
                color: 'var(--primary-500)',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {dataTypeOptions.map((option) => {
              const isSelected = selectedTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleDataType(option.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-light)'}`,
                    backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: '500',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {option.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="var(--primary-500)"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Format Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
              }}
            >
              Export Format
            </h2>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
              }}
            >
              Choose the file format for your export
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {formatOptions.map((option) => {
              const isSelected = format === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  style={{
                    flex: '1 1 150px',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-light)'}`,
                    backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 0.25rem',
                      fontWeight: '600',
                      fontSize: 'var(--text-base)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {option.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {option.description}
                  </p>
                  <p
                    style={{
                      margin: '0.5rem 0 0',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {option.extension}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Date Range Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: useDateRange ? '1rem' : 0,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                }}
              >
                Date Range
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                }}
              >
                Filter data by date (optional)
              </p>
            </div>
            <button
              onClick={() => setUseDateRange(!useDateRange)}
              role="switch"
              aria-checked={useDateRange}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: useDateRange ? 'var(--primary-500)' : 'var(--neutral-200)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: useDateRange ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>

          {useDateRange && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 150px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-xs)',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Export Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.5rem 0',
          }}
        >
          <Button
            onClick={handleExport}
            loading={exporting}
            disabled={selectedTypes.length === 0}
            size="lg"
          >
            {exporting ? 'Exporting...' : `Export ${selectedTypes.length} Data Type${selectedTypes.length !== 1 ? 's' : ''}`}
          </Button>
        </div>

        {/* Backup & Restore Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
              }}
            >
              Backup & Restore
            </h2>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
              }}
            >
              Create a full backup or restore from a previous backup
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Backup Button */}
            <div
              style={{
                flex: '1 1 200px',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <p
                  style={{
                    margin: '0 0 0.25rem',
                    fontWeight: '600',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Create Backup
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Download all your data as a JSON file
                </p>
              </div>
              <Button
                onClick={handleBackup}
                loading={creatingBackup}
                variant="secondary"
                size="sm"
                style={{ width: '100%' }}
              >
                {creatingBackup ? 'Creating...' : 'Download Backup'}
              </Button>
            </div>

            {/* Restore */}
            <div
              style={{
                flex: '1 1 200px',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <p
                  style={{
                    margin: '0 0 0.25rem',
                    fontWeight: '600',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Restore from Backup
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Upload a previously exported JSON file
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                style={{ display: 'none' }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                loading={restoring}
                variant="secondary"
                size="sm"
                style={{ width: '100%' }}
              >
                {restoring ? 'Restoring...' : 'Choose File'}
              </Button>
            </div>
          </div>

          {/* Restore Result */}
          {restoreResult && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: restoreResult.success ? 'var(--success-50)' : 'var(--warning-50)',
                border: `1px solid ${restoreResult.success ? 'var(--success-200)' : 'var(--warning-200)'}`,
              }}
            >
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontWeight: '600',
                  fontSize: 'var(--text-sm)',
                  color: restoreResult.success ? 'var(--success-700)' : 'var(--warning-700)',
                }}
              >
                {restoreResult.success ? 'Restore Completed' : 'Restore Completed with Errors'}
              </p>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '0.25rem',
                }}
              >
                {restoreResult.restored.journals > 0 && (
                  <span>Journals: {restoreResult.restored.journals}</span>
                )}
                {restoreResult.restored.journalEntries > 0 && (
                  <span>Entries: {restoreResult.restored.journalEntries}</span>
                )}
                {restoreResult.restored.expenses > 0 && (
                  <span>Expenses: {restoreResult.restored.expenses}</span>
                )}
                {restoreResult.restored.tasks > 0 && (
                  <span>Tasks: {restoreResult.restored.tasks}</span>
                )}
                {restoreResult.restored.flashcardDecks > 0 && (
                  <span>Decks: {restoreResult.restored.flashcardDecks}</span>
                )}
                {restoreResult.restored.flashcards > 0 && (
                  <span>Flashcards: {restoreResult.restored.flashcards}</span>
                )}
                {restoreResult.restored.notes > 0 && (
                  <span>Notes: {restoreResult.restored.notes}</span>
                )}
                {restoreResult.restored.goals > 0 && (
                  <span>Goals: {restoreResult.restored.goals}</span>
                )}
              </div>
              {restoreResult.errors.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p
                    style={{
                      margin: '0 0 0.25rem',
                      fontSize: 'var(--text-xs)',
                      fontWeight: '500',
                      color: 'var(--error)',
                    }}
                  >
                    Errors ({restoreResult.errors.length}):
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      padding: '0 0 0 1rem',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {restoreResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {restoreResult.errors.length > 5 && (
                      <li>...and {restoreResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Info */}
        <section
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              lineHeight: '1.5',
            }}
          >
            <strong>Note:</strong> Your export will include all data for the selected types.
            JSON format is recommended for backups as it preserves all data structure.
            CSV is best for importing into spreadsheet applications.
            Markdown creates a human-readable document. When restoring, existing data will be merged with the backup data (not replaced).
          </p>
        </section>
      </div>
    </div>
  );
}

export default function ExportPage() {
  return (
    <ProtectedRoute>
      <ExportContent />
    </ProtectedRoute>
  );
}
