/**
 * ACCOUNT SERVICE
 *
 * Handles account management including:
 * - Complete account deletion
 * - Data export before deletion
 * - Privacy settings management
 *
 * IMPORTANT: Account deletion is permanent and cannot be undone!
 */

import { db } from './firebase';
import { auth } from './firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { clearEncryptionSalt } from './encryption-service';

// ============================================
// TYPES
// ============================================

export interface PrivacySettings {
  // Data retention preferences
  autoDeleteAfterDays: number | null; // null = never auto-delete
  keepDeletedItemsDays: number; // How long to keep deleted items in trash

  // Analytics preferences
  allowAnalytics: boolean; // Allow usage analytics
  allowCrashReports: boolean; // Allow crash reporting

  // Export preferences
  includeMetadataInExport: boolean; // Include timestamps, IDs in exports

  // Last updated
  updatedAt: Date;
}

export interface DeletionProgress {
  total: number;
  deleted: number;
  currentCollection: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

// Default privacy settings
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  autoDeleteAfterDays: null,
  keepDeletedItemsDays: 30,
  allowAnalytics: true,
  allowCrashReports: true,
  includeMetadataInExport: true,
  updatedAt: new Date(),
};

// All collections that need to be deleted for a user
const USER_COLLECTIONS = [
  'journals',
  'journal_entries',
  'expenses',
  'expense_categories',
  'tasks',
  'recurring_series',
  'flashcard_folders',
  'flashcard_decks',
  'flashcards',
  'notes',
  'note_folders',
  'goals',
  'goal_progress',
  'achievements',
  'dashboard_settings',
  'preferences',
  'privacy_settings',
];

// ============================================
// PRIVACY SETTINGS
// ============================================

/**
 * Get user's privacy settings
 */
export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  try {
    const docRef = doc(db, 'users', userId, 'privacy_settings', 'settings');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...DEFAULT_PRIVACY_SETTINGS,
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return DEFAULT_PRIVACY_SETTINGS;
  } catch (error) {
    console.error('Failed to get privacy settings:', error);
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

/**
 * Save user's privacy settings
 */
export async function savePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'privacy_settings', 'settings');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save privacy settings:', error);
    throw error;
  }
}

// ============================================
// ACCOUNT DELETION
// ============================================

/**
 * Delete all documents in a user's subcollection
 * Uses batched writes for efficiency
 */
async function deleteCollection(
  userId: string,
  collectionName: string,
  onProgress?: (deleted: number) => void
): Promise<number> {
  const collectionRef = collection(db, 'users', userId, collectionName);
  const snapshot = await getDocs(collectionRef);

  if (snapshot.empty) {
    return 0;
  }

  let deleted = 0;
  const batchSize = 400; // Firestore limit is 500, using 400 for safety

  // Process in batches
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchDocs = docs.slice(i, i + batchSize);

    batchDocs.forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();
    deleted += batchDocs.length;

    if (onProgress) {
      onProgress(deleted);
    }
  }

  return deleted;
}

/**
 * Delete all user data from Firestore
 * This removes all journals, expenses, tasks, flashcards, etc.
 */
export async function deleteAllUserData(
  userId: string,
  onProgress?: (progress: DeletionProgress) => void
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  let totalDeleted = 0;

  try {
    // Calculate total documents
    let totalDocs = 0;
    for (const collectionName of USER_COLLECTIONS) {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      totalDocs += snapshot.size;
    }

    // Delete each collection
    for (const collectionName of USER_COLLECTIONS) {
      if (onProgress) {
        onProgress({
          total: totalDocs,
          deleted: totalDeleted,
          currentCollection: collectionName,
          status: 'in_progress',
        });
      }

      const deleted = await deleteCollection(userId, collectionName, (count) => {
        if (onProgress) {
          onProgress({
            total: totalDocs,
            deleted: totalDeleted + count,
            currentCollection: collectionName,
            status: 'in_progress',
          });
        }
      });

      totalDeleted += deleted;
    }

    // Delete the user document itself
    await deleteDoc(doc(db, 'users', userId));
    totalDeleted++;

    if (onProgress) {
      onProgress({
        total: totalDocs,
        deleted: totalDeleted,
        currentCollection: 'completed',
        status: 'completed',
      });
    }

    return { success: true, deletedCount: totalDeleted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (onProgress) {
      onProgress({
        total: 0,
        deleted: totalDeleted,
        currentCollection: 'error',
        status: 'failed',
        error: errorMessage,
      });
    }

    return { success: false, deletedCount: totalDeleted, error: errorMessage };
  }
}

/**
 * Re-authenticate user before sensitive operations
 * Required for account deletion
 */
export async function reauthenticateUser(password?: string): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    // Check if user signed in with email/password or Google
    const providerData = user.providerData || [];
    const providers = providerData.map((p) => p?.providerId).filter(Boolean);

    console.log('Auth providers found:', providers); // Debug log

    // Check for Google auth (handles various Google provider IDs)
    const isGoogleUser = providers.some(
      (p) => p === 'google.com' || p?.includes('google')
    );

    // Check for email/password auth
    const isPasswordUser = providers.some(
      (p) => p === 'password' || p === 'firebase'
    );

    if (isGoogleUser) {
      // Re-authenticate with Google popup
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      return true;
    } else if (isPasswordUser && password && user.email) {
      // Re-authenticate with email/password
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } else if (user.email && password) {
      // Fallback: try email/password if we have both
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } else if (user.email && !password) {
      // User has email but no password provided - might be Google user
      // Try Google re-auth as fallback
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      return true;
    }

    throw new Error(
      `Unable to determine authentication method. Providers: ${providers.join(', ') || 'none'}`
    );
  } catch (error) {
    console.error('Re-authentication failed:', error);
    throw error;
  }
}

/**
 * Complete account deletion process
 *
 * 1. Re-authenticate the user (required by Firebase)
 * 2. Delete all Firestore data
 * 3. Clear local storage (encryption keys, preferences)
 * 4. Delete the Firebase Auth account
 *
 * WARNING: This is permanent and cannot be undone!
 */
export async function deleteAccount(
  password?: string,
  onProgress?: (progress: DeletionProgress) => void
): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: 'No user logged in' };
  }

  try {
    // Step 1: Re-authenticate
    if (onProgress) {
      onProgress({
        total: 0,
        deleted: 0,
        currentCollection: 'Verifying identity...',
        status: 'in_progress',
      });
    }

    await reauthenticateUser(password);

    // Step 2: Delete all Firestore data
    const deleteResult = await deleteAllUserData(user.uid, onProgress);

    if (!deleteResult.success) {
      return { success: false, error: deleteResult.error };
    }

    // Step 3: Clear local storage
    if (typeof window !== 'undefined') {
      // Clear encryption salt
      clearEncryptionSalt();

      // Clear other local storage items
      const keysToRemove = [
        'lifedash_notification_prefs',
        'lifedash_theme',
        'lifedash_user_preferences',
      ];

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    // Step 4: Delete Firebase Auth account
    if (onProgress) {
      onProgress({
        total: deleteResult.deletedCount,
        deleted: deleteResult.deletedCount,
        currentCollection: 'Deleting account...',
        status: 'in_progress',
      });
    }

    await deleteUser(user);

    if (onProgress) {
      onProgress({
        total: deleteResult.deletedCount,
        deleted: deleteResult.deletedCount,
        currentCollection: 'Account deleted',
        status: 'completed',
      });
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Account deletion failed:', error);

    return { success: false, error: errorMessage };
  }
}

/**
 * Clear all local data without deleting the account
 * Useful for "Log out from all devices" functionality
 */
export function clearLocalData(): void {
  if (typeof window === 'undefined') return;

  // Clear all LifeDash-related localStorage items
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith('lifedash_')) {
      localStorage.removeItem(key);
    }
  });

  // Clear encryption salt
  clearEncryptionSalt();

  // Clear session storage
  sessionStorage.clear();
}

/**
 * Check if user can delete account
 * (Just a helper to check if user is logged in and has valid auth)
 */
export function canDeleteAccount(): boolean {
  const user = auth.currentUser;
  return user !== null;
}

/**
 * Get account information for the deletion confirmation screen
 */
export async function getAccountDeletionInfo(userId: string): Promise<{
  dataCount: number;
  collections: { name: string; count: number }[];
}> {
  const collections: { name: string; count: number }[] = [];
  let totalCount = 0;

  for (const collectionName of USER_COLLECTIONS) {
    try {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const snapshot = await getDocs(collectionRef);
      const count = snapshot.size;

      if (count > 0) {
        collections.push({
          name: formatCollectionName(collectionName),
          count,
        });
        totalCount += count;
      }
    } catch {
      // Skip collections that can't be read
    }
  }

  return {
    dataCount: totalCount,
    collections,
  };
}

/**
 * Format collection name for display
 */
function formatCollectionName(name: string): string {
  const mapping: Record<string, string> = {
    journals: 'Journals',
    journal_entries: 'Journal Entries',
    expenses: 'Expenses',
    expense_categories: 'Expense Categories',
    tasks: 'Tasks',
    recurring_series: 'Recurring Tasks',
    flashcard_folders: 'Flashcard Folders',
    flashcard_decks: 'Flashcard Decks',
    flashcards: 'Flashcards',
    notes: 'Notes',
    note_folders: 'Note Folders',
    goals: 'Goals',
    goal_progress: 'Goal Progress',
    achievements: 'Achievements',
    dashboard_settings: 'Dashboard Settings',
    preferences: 'Preferences',
    privacy_settings: 'Privacy Settings',
  };

  return mapping[name] || name;
}
