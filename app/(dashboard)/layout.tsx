'use client';

/**
 * DASHBOARD LAYOUT (Mobile Responsive)
 *
 * Shared layout for all authenticated pages.
 * Includes:
 * - Authentication protection
 * - Persistent header with navigation
 * - Toast notifications
 * - Responsive padding that adjusts for mobile
 *
 * Responsive behavior:
 * - Uses CSS custom property --container-padding
 * - Mobile: 1rem padding
 * - Tablet: 1.5rem padding
 * - Desktop: 2rem padding
 */

import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { OfflineProvider } from '@/lib/offline-context';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OfflineProvider>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
          {/* Toast notifications - positioned for mobile */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                maxWidth: '90vw',
                padding: '12px 16px',
              },
            }}
          />
          {/* PWA Install prompt - shows when app is installable */}
          <InstallPrompt />
          <Header />
          {/* Offline indicator - shows below header when user loses internet */}
          <OfflineIndicator />
          {/* Main content area with responsive padding */}
          <main
            className="safe-area-padding safe-area-bottom"
            style={{
              maxWidth: '1200px',
              width: '100%',
              margin: '0 auto',
              // Use CSS custom property for responsive padding
              paddingTop: 'var(--spacing-responsive)',
              paddingBottom: 'var(--spacing-responsive)',
              // Prevent children from causing horizontal overflow
              overflowX: 'hidden',
            }}
          >
            {children}
          </main>
        </div>
      </OfflineProvider>
    </ProtectedRoute>
  );
}
