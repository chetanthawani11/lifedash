'use client';

/**
 * ACCOUNT DELETION COMPONENT
 *
 * Provides UI for users to permanently delete their account.
 * Includes multiple confirmation steps to prevent accidental deletion.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  deleteAccount,
  getAccountDeletionInfo,
  DeletionProgress,
} from '@/lib/account-service';
import toast from 'react-hot-toast';

export const AccountDeletion: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState<DeletionProgress | null>(null);
  const [dataInfo, setDataInfo] = useState<{
    dataCount: number;
    collections: { name: string; count: number }[];
  } | null>(null);

  // Check auth provider (with safe access)
  const providerData = user?.providerData || [];
  const isGoogleUser = providerData.some((p) => p.providerId === 'google.com');
  const isPasswordUser = providerData.some((p) => p.providerId === 'password');

  // Load data info when confirmation is shown
  useEffect(() => {
    if (showConfirmation && user) {
      loadDataInfo();
    }
  }, [showConfirmation, user]);

  const loadDataInfo = async () => {
    if (!user) return;

    try {
      const info = await getAccountDeletionInfo(user.uid);
      setDataInfo(info);
    } catch (error) {
      console.error('Failed to load data info:', error);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    // Validation
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
        // Redirect to login page
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

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText('');
    setPassword('');
    setProgress(null);
  };

  return (
    <section
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        border: '1px solid var(--error-200)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--error)',
            marginBottom: '0.25rem',
          }}
        >
          Danger Zone
        </h2>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
          }}
        >
          Irreversible and destructive actions
        </p>
      </div>

      {!showConfirmation ? (
        // Initial state - show delete button
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 0.25rem',
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
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button
            onClick={() => setShowConfirmation(true)}
            variant="ghost"
            size="sm"
            style={{
              color: 'var(--error)',
              borderColor: 'var(--error-200)',
            }}
          >
            Delete Account
          </Button>
        </div>
      ) : (
        // Confirmation state
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Warning */}
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
                margin: '0 0 0.5rem',
                fontWeight: '600',
                color: 'var(--error)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Are you absolutely sure?
            </p>
            <p
              style={{
                margin: 0,
                color: 'var(--error-700)',
                fontSize: 'var(--text-xs)',
                lineHeight: '1.5',
              }}
            >
              This action <strong>cannot be undone</strong>. This will permanently delete your
              account and remove all your data from our servers.
            </p>
          </div>

          {/* Data Summary */}
          {dataInfo && dataInfo.collections.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}
            >
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Data to be deleted ({dataInfo.dataCount} items):
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                {dataInfo.collections.map((col) => (
                  <span
                    key={col.name}
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {col.name}: {col.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Password for email/password users */}
          {isPasswordUser && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.25rem',
                }}
              >
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={isDeleting}
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
          )}

          {/* Google users info */}
          {isGoogleUser && !isPasswordUser && (
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
              }}
            >
              You will be asked to sign in with Google to confirm deletion.
            </p>
          )}

          {/* Type DELETE to confirm */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                marginBottom: '0.25rem',
              }}
            >
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="DELETE"
              disabled={isDeleting}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          {/* Progress */}
          {progress && progress.status === 'in_progress' && (
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}
            >
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Deleting... {progress.currentCollection}
              </p>
              {progress.total > 0 && (
                <>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--neutral-200)',
                      borderRadius: '4px',
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
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {progress.deleted} of {progress.total} items deleted
                  </p>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} variant="ghost" size="sm" disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="primary"
              size="sm"
              loading={isDeleting}
              disabled={confirmText !== 'DELETE' || (isPasswordUser && !password)}
              style={{
                backgroundColor: 'var(--error)',
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountDeletion;
