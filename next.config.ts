import type { NextConfig } from "next";

/**
 * NEXT.JS CONFIGURATION
 *
 * This file configures Next.js build settings.
 * PWA (service worker) is enabled in production for offline support.
 */

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * PWA Configuration (Optional)
 *
 * Only enabled when next-pwa is installed.
 * Provides offline functionality:
 * - Caches app files so pages load without internet
 * - Only active in production (not during development)
 */
let finalConfig = nextConfig;

try {
  // Try to load next-pwa - if not installed, skip PWA setup
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWAInit = require("next-pwa").default;

  const withPWA = withPWAInit({
    dest: "public", // Where to put the generated service worker files
    register: true, // Automatically register the service worker
    skipWaiting: true, // Activate new service worker immediately
    disable: process.env.NODE_ENV === "development", // Disable in dev mode
    // Cache strategies for different types of files
    runtimeCaching: [
      {
        // Cache Google Fonts
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        // Cache images
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-images",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // Cache JavaScript and CSS
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-css",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        // Cache API responses (except Firebase)
        urlPattern: /^https:\/\/(?!.*firestore|.*firebase).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 10, // Fall back to cache after 10s
        },
      },
    ],
  });

  finalConfig = withPWA(nextConfig);
} catch {
  // next-pwa not installed - PWA features disabled
  console.log("Note: next-pwa not installed. Run 'npm install next-pwa' for offline support.");
}

export default finalConfig;
