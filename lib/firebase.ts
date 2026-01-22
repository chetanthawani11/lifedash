// Firebase Configuration and Initialization
// This file sets up Firebase for your entire app

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
// This prevents "Firebase app already exists" errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

/**
 * Initialize Firestore with offline persistence
 *
 * What this does:
 * - Caches your data locally using IndexedDB (browser storage)
 * - Works offline - you can still read data without internet
 * - Automatically syncs when you come back online
 * - CACHE_SIZE_UNLIMITED means it won't automatically delete cached data
 */
let db: ReturnType<typeof getFirestore>;

if (getApps().length === 1 && typeof window !== 'undefined') {
  // Only initialize once and only in browser (not on server)
  try {
    // Initialize Firestore with settings for offline support
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });

    // Enable offline persistence
    // This stores data in IndexedDB so it works without internet
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open - persistence only works in one tab at a time
        console.warn(
          'Firestore offline persistence failed: Multiple tabs open. ' +
            'Offline support will only work in one tab.'
        );
      } else if (err.code === 'unimplemented') {
        // Browser doesn't support IndexedDB
        console.warn(
          'Firestore offline persistence not available: ' +
            'Your browser does not support offline storage.'
        );
      } else {
        console.error('Firestore offline persistence error:', err);
      }
    });
  } catch (error) {
    // If Firestore is already initialized, just get the instance
    db = getFirestore(app);
  }
} else {
  // Server-side or already initialized
  db = getFirestore(app);
}

export { db };

// Export the app instance
export default app;
