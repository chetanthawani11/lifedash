'use client';

/**
 * PRIVACY SETTINGS COMPONENT
 *
 * Allows users to manage their privacy preferences and account deletion.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  getPrivacySettings,
  savePrivacySettings,
  PrivacySettings as PrivacySettingsType,
  deleteAccount,
  getAccountDeletionInfo,
  DeletionProgress,
} from '@/lib/account-service';
import toast from 'react-hot-toast';

export const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettingsType>({
    autoDeleteAfterDays: null,
    keepDeletedItemsDays: 30,
    allowAnalytics: true,
    allowCrashReports: true,
    includeMetadataInExport: true,
    updatedAt: new Date(),
  });

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState<DeletionProgress | null>(null);
  const [dataInfo, setDataInfo] = useState<{
    dataCount: number;
    collections: { name: string; count: number }[];
  } | null>(null);

  // Check auth provider
  const providerData = user?.providerData || [];
  const isPasswordUser = providerData.some((p) => p.providerId === 'password');

  // Load settings
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  // Load data info when delete confirmation is shown
  useEffect(() => {
    if (showDeleteConfirm && user) {
      loadDataInfo();
    }
  }, [showDeleteConfirm, user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const loadedSettings = await getPrivacySettings(user.uid);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataInfo = async () => {
    if (!user) return;
    try {
      const info = await getAccountDeletionInfo(user.uid);
      setDataInfo(info);
    } catch (error) {
      console.error('Failed to load data info:', error);
    }
  };

  // Save a setting
  const updateSetting = async (key: keyof PrivacySettingsType, value: unknown) => {
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setSaving(true);
    try {
      await savePrivacySettings(user.uid, { [key]: value });
      toast.success('Setting saved');
    } catch (error) {
      console.error('Failed to save setting:', error);
      toast.error('Failed to save setting');
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    if (!user) return;

    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (isPasswordUser && !password) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeleting(true);
    setProgress({
      total: 0,
      deleted: 0,
      currentCollection: 'Starting...',
      status: 'pending',
    });

    try {
      const result = await deleteAccount(isPasswordUser ? password : undefined, setProgress);

      if (result.success) {
        toast.success('Account deleted successfully');
        router.push('/login');
      } else {
        toast.error(result.error || 'Failed to delete account');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('An error occurred during deletion');
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setConfirmText('');
    setPassword('');
    setProgress(null);
  };

  if (loading) {
    return (
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}
      >
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
          Loading privacy settings...
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}
        >
          Privacy & Data
        </h2>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
          }}
        >
          Control how your data is stored and used
        </p>
      </div>

      {/* Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Analytics Toggle */}
        <ToggleRow
          label="Usage Analytics"
          description="Help improve LifeDash by sharing anonymous usage data"
          checked={settings.allowAnalytics}
          onChange={() => updateSetting('allowAnalytics', !settings.allowAnalytics)}
          disabled={saving}
        />

        {/* Crash Reports Toggle */}
        <ToggleRow
          label="Crash Reports"
          description="Automatically send error reports to help fix bugs"
          checked={settings.allowCrashReports}
          onChange={() => updateSetting('allowCrashReports', !settings.allowCrashReports)}
          disabled={saving}
        />

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }} />

        {/* Include Metadata in Export */}
        <ToggleRow
          label="Include Metadata in Exports"
          description="Include timestamps and IDs when exporting data"
          checked={settings.includeMetadataInExport}
          onChange={() =>
            updateSetting('includeMetadataInExport', !settings.includeMetadataInExport)
          }
          disabled={saving}
        />

        {/* Data Retention */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p
              style={{
                margin: '0 0 0.1rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Keep Deleted Items
            </p>
            <p
              style={{
                margin: 0,
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-xs)',
              }}
            >
              How long to keep deleted items before permanent removal
            </p>
          </div>
          <select
            value={settings.keepDeletedItemsDays}
            onChange={(e) => updateSetting('keepDeletedItemsDays', parseInt(e.target.value))}
            disabled={saving}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              minWidth: '140px',
            }}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }} />

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p
                style={{
                  margin: '0 0 0.1rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Delete Account
              </p>
              <p
                style={{
                  margin: 0,
                  color: 'var(--text-tertiary)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              size="sm"
              style={{ color: 'var(--error)' }}
            >
              Delete Account
            </Button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--error-50)',
              border: '1px solid var(--error-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}
          >
            <p
              style={{
                margin: '0 0 0.75rem',
                fontWeight: '600',
                color: 'var(--error)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Are you sure? This cannot be undone.
            </p>

            {/* Data Summary */}
            {dataInfo && dataInfo.dataCount > 0 && (
              <p
                style={{
                  margin: '0 0 0.75rem',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                This will delete {dataInfo.dataCount} items including your journals, expenses,
                tasks, and flashcards.
              </p>
            )}

            {/* Password input for email users */}
            {isPasswordUser && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isDeleting}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: '0.5rem',
                }}
              />
            )}

            {/* Type DELETE confirmation */}
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder='Type "DELETE" to confirm'
              disabled={isDeleting}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.75rem',
              }}
            />

            {/* Progress */}
            {progress && progress.status === 'in_progress' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p
                  style={{
                    margin: '0 0 0.25rem',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Deleting {progress.currentCollection}...
                </p>
                {progress.total > 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--neutral-200)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(progress.deleted / progress.total) * 100}%`,
                        height: '100%',
                        backgroundColor: 'var(--error)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button onClick={cancelDelete} variant="ghost" size="sm" disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="primary"
                size="sm"
                loading={isDeleting}
                disabled={confirmText !== 'DELETE' || (isPasswordUser && !password)}
                style={{ backgroundColor: 'var(--error)' }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
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
          Your data is stored securely using Firebase and is only accessible by you.
          We do not sell or share your personal information with third parties.
        </p>
      </div>
    </section>
  );
};

// Toggle row component
interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
    }}
  >
    <div style={{ flex: 1 }}>
      <p
        style={{
          margin: '0 0 0.1rem',
          fontWeight: '500',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-xs)',
        }}
      >
        {description}
      </p>
    </div>
    <button
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked ? 'var(--primary-500)' : 'var(--neutral-200)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
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
);

export default PrivacySettings;
