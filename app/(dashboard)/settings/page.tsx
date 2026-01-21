'use client';

// Beautiful Settings Page - World-class design
// Cozy, elegant, minimalist aesthetic

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getUserProfile, updateUserProfile, updateUserPreferences } from '@/lib/user-service';
import { UserProfile } from '@/types/auth';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Currency options with icons
const currencyOptions: SelectOption[] = [
  { value: 'USD', label: 'US Dollar ($)', icon: '🇺🇸' },
  { value: 'EUR', label: 'Euro (€)', icon: '🇪🇺' },
  { value: 'GBP', label: 'British Pound (£)', icon: '🇬🇧' },
  { value: 'INR', label: 'Indian Rupee (₹)', icon: '🇮🇳' },
  { value: 'JPY', label: 'Japanese Yen (¥)', icon: '🇯🇵' },
  { value: 'CAD', label: 'Canadian Dollar ($)', icon: '🇨🇦' },
  { value: 'AUD', label: 'Australian Dollar ($)', icon: '🇦🇺' },
];

// Theme options
const themeOptions: SelectOption[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

function SettingsContent() {
  const { user, refreshPreferences } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [currency, setCurrency] = useState('USD');
  const [hasChanges, setHasChanges] = useState(false);

  // Load profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
        setDisplayName(userProfile.displayName);
        setBio(userProfile.bio || '');
        setTheme(userProfile.preferences.theme);
        setCurrency(userProfile.preferences.currency);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    }
  };

  // Track changes
  useEffect(() => {
    if (!profile) return;

    const changed =
      displayName !== profile.displayName ||
      bio !== (profile.bio || '') ||
      theme !== profile.preferences.theme ||
      currency !== profile.preferences.currency;

    setHasChanges(changed);
  }, [displayName, bio, theme, currency, profile]);

  const handleSaveAll = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        bio: bio.trim() || undefined,
      });

      await updateUserPreferences(user.uid, {
        theme,
        currency,
      });

      // Refresh preferences in auth context and localStorage
      await refreshPreferences();

      toast.success('Changes saved successfully! ✨');
      await loadProfile();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (!profile) return;

    setDisplayName(profile.displayName);
    setBio(profile.bio || '');
    setTheme(profile.preferences.theme);
    setCurrency(profile.preferences.currency);
    setHasChanges(false);
    toast.success('Changes discarded');
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Personalize your LifeDash experience
        </p>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Profile Section */}
        <section style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              Profile
            </h2>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}>
              Update your personal information
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />

            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              helperText="A short description about you"
            />
          </div>
        </section>

        {/* Preferences Section */}
        <section style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              Preferences
            </h2>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}>
              Customize your app experience
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Select
              label="Theme"
              value={theme}
              onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              options={themeOptions}
            />

            <Select
              label="Currency"
              value={currency}
              onChange={setCurrency}
              options={currencyOptions}
            />
          </div>
        </section>

        {/* Account Info */}
        {profile && (
          <section style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
          }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
            }}>
              Account Information
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}>
              <p><strong>Account created:</strong> {profile.createdAt.toLocaleDateString()}</p>
              <p><strong>Last updated:</strong> {profile.updatedAt.toLocaleDateString()}</p>
              <p style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)',
              }}>
                <strong>User ID:</strong> {profile.uid}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Save Bar */}
      {hasChanges && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}>
              <svg style={{ width: '1rem', height: '1rem', color: 'var(--warning)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span style={{ fontWeight: '500' }}>Unsaved changes</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={handleDiscard}
                variant="ghost"
                size="sm"
                disabled={loading}
              >
                Discard
              </Button>
              <Button
                onClick={handleSaveAll}
                loading={loading}
                variant="primary"
                size="sm"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
