'use client';

/**
 * DASHBOARD LAYOUT
 *
 * Shared layout for all authenticated pages.
 * Includes:
 * - Authentication protection
 * - Persistent header with navigation
 * - Toast notifications
 */

import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <Toaster position="top-right" />
        <Header />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
