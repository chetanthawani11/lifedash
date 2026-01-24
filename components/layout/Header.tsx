'use client';

/**
 * HEADER COMPONENT (Mobile Responsive)
 *
 * Persistent navigation header for all authenticated pages.
 * Features:
 * - Logo with link to dashboard
 * - Contextual back button on sub-pages
 * - Desktop: Horizontal navigation with active state
 * - Mobile: Hamburger menu with slide-out panel
 * - Settings and logout actions
 *
 * How the responsive design works:
 * - On screens 768px and wider (tablets/desktops): Shows horizontal nav
 * - On screens smaller than 768px (phones): Shows hamburger menu
 * - CSS classes 'desktop-only' and 'mobile-only' handle visibility
 */

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { MobileNav } from './MobileNav';
import toast from 'react-hot-toast';

// Back arrow icon component
const BackArrowIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Journals', href: '/journals' },
  { label: 'Expenses', href: '/expenses' },
  { label: 'Flashcards', href: '/flashcards' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Notes', href: '/notes' },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile/tablet (screen width < 1024px)
  // Tablets get the mobile menu for better UX
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkMobile();

    // Check when window is resized
    window.addEventListener('resize', checkMobile);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine if we should show a back button
  // Shows on sub-pages like /notes/123, /expenses/analytics, /journals/123/entries
  const backNavigation = useMemo(() => {
    if (!pathname) return null;

    // Main sections that don't need a back button
    const mainPages = [
      '/dashboard',
      '/journals',
      '/expenses',
      '/flashcards',
      '/tasks',
      '/notes',
      '/settings',
    ];

    // If we're on a main page, no back button needed
    if (mainPages.includes(pathname)) return null;

    // Section labels for display
    const sectionLabels: Record<string, string> = {
      journals: 'Journals',
      expenses: 'Expenses',
      flashcards: 'Flashcards',
      tasks: 'Tasks',
      notes: 'Notes',
      settings: 'Settings',
    };

    // Define specific route patterns and where they should go back to
    // Format: [pattern regex, back destination, label]
    const routePatterns: [RegExp, string, string][] = [
      // Settings
      [/^\/settings\//, '/settings', 'Settings'],

      // Notes
      [/^\/notes\/folder\/[^/]+$/, '/notes', 'Notes'], // /notes/folder/123 -> /notes
      [/^\/notes\/[^/]+$/, '/notes', 'Notes'], // /notes/123 -> /notes

      // Flashcards
      [/^\/flashcards\/deck\/[^/]+\/study$/, '/flashcards', 'Flashcards'], // /flashcards/deck/123/study -> /flashcards
      [/^\/flashcards\/deck\/[^/]+$/, '/flashcards', 'Flashcards'], // /flashcards/deck/123 -> /flashcards
      [/^\/flashcards\/folder\/[^/]+$/, '/flashcards', 'Flashcards'], // /flashcards/folder/123 -> /flashcards

      // Journals
      [/^\/journals\/[^/]+\/entries\/[^/]+$/, '/journals', 'Journals'], // /journals/123/entries/456 -> /journals (entry page)
      [/^\/journals\/[^/]+$/, '/journals', 'Journals'], // /journals/123 -> /journals

      // Expenses
      [/^\/expenses\/analytics$/, '/expenses', 'Expenses'],
      [/^\/expenses\/categories$/, '/expenses', 'Expenses'],
      [/^\/expenses\/[^/]+$/, '/expenses', 'Expenses'],

      // Tasks
      [/^\/tasks\/calendar$/, '/tasks', 'Tasks'],
      [/^\/tasks\/recurring$/, '/tasks', 'Tasks'],
      [/^\/tasks\/[^/]+$/, '/tasks', 'Tasks'],
    ];

    // Check each pattern
    for (const [pattern, destination, label] of routePatterns) {
      if (pattern.test(pathname)) {
        return { href: destination, label };
      }
    }

    // Fallback: parse path and go to section root
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const section = segments[0];
      return {
        href: `/${section}`,
        label: sectionLabels[section] || 'Back',
      };
    }

    return null;
  }, [pathname]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      toast.success('Logged out successfully!');
      router.push('/');
    } catch {
      toast.error('Failed to log out');
      setLoggingOut(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        // Handle safe areas for notched phones
        paddingTop: 'var(--safe-area-top)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.75rem var(--container-padding)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side: Back button + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Back Button - shows on sub-pages */}
          {backNavigation && (
            <button
              onClick={() => router.push(backNavigation.href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginRight: '0.25rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              aria-label={`Go back to ${backNavigation.label}`}
            >
              <BackArrowIcon size={18} />
            </button>
          )}

          {/* Logo - clicks go to dashboard */}
          <Link
            href="/dashboard"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              lineHeight: 1,
            }}
          >
            <AppIcon size={isMobile ? 24 : 28} color="var(--primary-500)" />
            <span
              style={{
                fontSize: isMobile ? '0.95rem' : '1.125rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              LifeDash
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: active ? 'var(--primary-500)' : 'transparent',
                  color: active ? 'white' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Actions - Hidden on mobile */}
        <div
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Link
            href="/settings"
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s',
              backgroundColor: pathname.startsWith('/settings')
                ? 'var(--primary-500)'
                : 'transparent',
              color: pathname.startsWith('/settings')
                ? 'white'
                : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (!pathname.startsWith('/settings')) {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname.startsWith('/settings')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
          <Button onClick={handleLogoutClick} variant="secondary" size="sm">
            Logout
          </Button>
        </div>

        {/* Mobile Navigation - Only visible on mobile */}
        {isMobile && (
          <MobileNav onLogout={handleLogoutClick} loggingOut={loggingOut} />
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleSignOut}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your data."
        confirmText="Logout"
        cancelText="Cancel"
        variant="warning"
        loading={loggingOut}
      />
    </header>
  );
};

export default Header;
