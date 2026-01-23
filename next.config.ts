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
 * PWA Configuration
 *
 * Provides offline functionality:
 * - Caches app files so pages load without internet
 * - Only active in production (not during development)
 */
let finalConfig: NextConfig = nextConfig;

try {
  // Load next-pwa
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWA = require("next-pwa");

  finalConfig = withPWA({
    dest: "public", // Where to put the generated service worker files
    register: true, // Automatically register the service worker
    skipWaiting: true, // Activate new service worker immediately
    disable: process.env.NODE_ENV === "development", // Disable in dev mode (no service worker in dev)
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
    ],
  })(nextConfig);

  console.log("✓ PWA support enabled");
} catch (error) {
  // next-pwa not installed or error occurred
  console.log("Note: PWA features disabled.", error instanceof Error ? error.message : "");
}

export default finalConfig;
