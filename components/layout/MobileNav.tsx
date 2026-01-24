'use client';

/**
 * MOBILE & TABLET NAVIGATION COMPONENT
 *
 * This component provides mobile and tablet-friendly navigation:
 * - Hamburger button (three lines) that opens the menu
 * - Slide-out panel with all navigation links
 * - Touch-friendly buttons that are easy to tap
 * - Smooth animations for opening/closing
 * - Responsive width (wider on tablets)
 *
 * How it works:
 * 1. On mobile/tablet screens (<1024px), the hamburger icon is visible
 * 2. Tapping it opens a navigation panel
 * 3. Users can tap any link to navigate
 * 4. The menu closes automatically after navigation
 */

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AppIcon } from '@/components/ui/AppIcon';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Navigation items with icons for mobile menu
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Journals',
    href: '/journals',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Flashcards',
    href: '/flashcards',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 15h0M2 9.5h20" />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: 'Notes',
    href: '/notes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

interface MobileNavProps {
  onLogout: () => void;
  loggingOut: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onLogout, loggingOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const pathname = usePathname();

  // Check if we're on a tablet (768px - 1023px)
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  // Close menu when route changes (user navigated somewhere)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          padding: 0,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          borderRadius: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Animated hamburger icon that transforms to X when open */}
        <div style={{ position: 'relative', width: '24px', height: '24px' }}>
          {/* Top line */}
          <span
            style={{
              position: 'absolute',
              left: 0,
              width: '24px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              transition: 'all 0.3s',
              top: isOpen ? '11px' : '5px',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            }}
          />
          {/* Middle line */}
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: '11px',
              width: '24px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              transition: 'all 0.3s',
              opacity: isOpen ? 0 : 1,
            }}
          />
          {/* Bottom line */}
          <span
            style={{
              position: 'absolute',
              left: 0,
              width: '24px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              transition: 'all 0.3s',
              top: isOpen ? '11px' : '17px',
              transform: isOpen ? 'rotate(-45deg)' : 'rotate(0)',
            }}
          />
        </div>
      </button>

      {/* Slide-out Navigation Panel */}
      {/* Backdrop (dark overlay behind menu) */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s, visibility 0.3s',
        }}
      />

      {/* Navigation Panel */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          // Wider panel on tablets (360px vs 300px on phones)
          width: isTablet ? 'min(360px, 50vw)' : 'min(300px, 80vw)',
          backgroundColor: 'var(--bg-elevated)',
          zIndex: 999,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? 'var(--shadow-xl)' : 'none',
          paddingTop: 'var(--safe-area-top)',
          paddingBottom: 'var(--safe-area-bottom)',
        }}
      >
        {/* Menu Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AppIcon size={24} color="var(--primary-500)" />
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
              Menu
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              borderRadius: '8px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  minHeight: '48px',
                  backgroundColor: active ? 'var(--primary-500)' : 'transparent',
                  color: active ? 'white' : 'var(--text-primary)',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ display: 'flex', opacity: active ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <Button
            onClick={onLogout}
            loading={loggingOut}
            variant="secondary"
            fullWidth
            style={{ minHeight: '48px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </Button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
