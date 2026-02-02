'use client';

/**
 * INSTALL APP PROMPT
 *
 * Shows a banner prompting users to install LifeDash as a PWA.
 *
 * How it works:
 * 1. Listens for the 'beforeinstallprompt' event (browser's install prompt)
 * 2. Stores the event so we can trigger it later
 * 3. Shows our custom install banner
 * 4. When user clicks "Install", triggers the browser's native install dialog
 *
 * The banner only shows when:
 * - The app is installable (PWA criteria met)
 * - User hasn't dismissed it recently
 * - App isn't already installed
 */

import { useState, useEffect } from 'react';

// Type for the BeforeInstallPromptEvent (not in standard TypeScript types)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Storage key for tracking dismissal
const DISMISSED_KEY = 'lifedash_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const InstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      // Check if running as installed PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-expect-error - navigator.standalone is iOS Safari specific
      const isIOSStandalone = window.navigator.standalone === true;

      if (isStandalone || isIOSStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check if user dismissed recently
      const dismissedAt = localStorage.getItem(DISMISSED_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISS_DURATION) {
          return; // Don't show if dismissed within last 7 days
        }
      }
    }

    // Listen for the browser's install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent automatic prompt
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show the browser's install prompt
    await installPrompt.prompt();

    // Wait for user's choice
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted install prompt');
    } else {
      console.log('User dismissed install prompt');
    }

    // Clear the prompt
    setInstallPrompt(null);
    setShowBanner(false);
  };

  // Handle dismiss button click
  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for 7 days
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Icon and text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        {/* App icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 20L9 14L13 18L21 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 8H21V12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Text */}
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: '600',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
            }}
          >
            Install LifeDash
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
            }}
          >
            Add to home screen for the best experience
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          style={{
            background: 'var(--primary-500)',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
