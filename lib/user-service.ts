// User Service - Firestore database operations for user profiles
// Handles creating, reading, updating user data

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserPreferences } from '@/types/auth';

// Default preferences for new users
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  currency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'en',
  notifications: {
    email: true,
    push: false,
    taskReminders: true,
    budgetAlerts: true,
  },
};

/**
 * Create a new user profile in Firestore
 * Called when a user first registers
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<UserProfile> {
  const userProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    preferences: DEFAULT_PREFERENCES,
  };

  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Return profile with timestamps as Date objects
  return {
    ...userProfile,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get user profile from Firestore
 * Returns null if profile doesn't exist
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    bio: data.bio,
    preferences: data.preferences,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Update user profile
 * Special handling: null values delete the field from Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  // Process updates:
  // - null = delete field from Firestore
  // - undefined = skip (don't update)
  // - any other value = update
  const cleanedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
    if (value === null) {
      // null means "delete this field"
      acc[key] = deleteField();
    } else if (value !== undefined) {
      // Include all non-undefined values
      acc[key] = value;
    }
    // undefined values are skipped (not included in update)
    return acc;
  }, {} as Record<string, any>);

  await updateDoc(userRef, {
    ...cleanedUpdates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update only user preferences
 */
export async function updateUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const currentProfile = await getUserProfile(uid);

  if (!currentProfile) {
    throw new Error('User profile not found');
  }

  const updatedPreferences = {
    ...currentProfile.preferences,
    ...preferences,
  };

  await updateDoc(userRef, {
    preferences: updatedPreferences,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Initialize user profile on first login
 * Creates profile if it doesn't exist
 */
export async function initializeUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<UserProfile> {
  const existingProfile = await getUserProfile(uid);

  if (existingProfile) {
    return existingProfile;
  }

  // Create new profile
  return await createUserProfile(uid, email, displayName);
}
