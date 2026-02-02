import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

/**
 * VIEWPORT CONFIGURATION
 *
 * This tells mobile browsers how to display the website:
 * - width: device-width = Use the device's actual width
 * - initialScale: 1 = No zooming on page load
 * - maximumScale: 1 = Prevent pinch-to-zoom (optional, better for app-like feel)
 * - userScalable: false = Disable manual zooming (optional for PWA)
 * - viewportFit: cover = Handle notched phones (iPhone X and newer)
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d9488' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

/**
 * METADATA CONFIGURATION
 *
 * This provides information about the app for browsers, search engines, and PWA:
 * - title: Shows in browser tab
 * - description: Used by search engines
 * - manifest: Points to PWA configuration
 * - appleWebApp: iOS-specific settings for home screen
 */
export const metadata: Metadata = {
  title: "LifeDash - Your Personal Dashboard",
  description: "A comprehensive personal life dashboard for journaling, expenses, learning, and tasks",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LifeDash',
  },
  formatDetection: {
    telephone: false, // Prevent auto-linking phone numbers
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ServiceWorkerRegistration />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
