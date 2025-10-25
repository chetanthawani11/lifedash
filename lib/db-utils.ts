// Database Utilities - Core functions for Firestore operations
// This file contains helper functions that make working with Firestore easier

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryConstraint,
  onSnapshot,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for database operations
 * Makes it easier to handle different types of errors
 */
export class DatabaseError extends Error {
  code: string;
  originalError?: any;

  constructor(message: string, code: string = 'unknown', originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Handle Firestore errors and convert them to user-friendly messages
 */
export const handleFirestoreError = (error: any): DatabaseError => {
  console.error('Firestore Error:', error);

  // Handle Firebase/Firestore specific errors
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return new DatabaseError(
          'You do not have permission to perform this operation',
          'permission-denied',
          error
        );
      case 'not-found':
        return new DatabaseError(
          'The requested data was not found',
          'not-found',
          error
        );
      case 'already-exists':
        return new DatabaseError(
          'This data already exists',
          'already-exists',
          error
        );
      case 'unavailable':
        return new DatabaseError(
          'Database is temporarily unavailable. Please try again.',
          'unavailable',
          error
        );
      case 'deadline-exceeded':
        return new DatabaseError(
          'Request took too long. Please check your connection.',
          'timeout',
          error
        );
      default:
        return new DatabaseError(
          'An unexpected database error occurred',
          error.code,
          error
        );
    }
  }

  // Generic error
  return new DatabaseError(
    error.message || 'An unknown error occurred',
    'unknown',
    error
  );
};

// ============================================
// RETRY MECHANISM
// ============================================

/**
 * Retry a database operation with exponential backoff
 * If the operation fails, it will retry up to 3 times with increasing delays
 *
 * @param operation - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Result of the operation
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on permission errors or not-found errors
      if (error.code === 'permission-denied' || error.code === 'not-found') {
        throw handleFirestoreError(error);
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw handleFirestoreError(error);
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleFirestoreError(lastError);
};

// ============================================
// TIMESTAMP HELPERS
// ============================================

/**
 * Get current Firestore timestamp
 */
export const now = (): Timestamp => {
  return Timestamp.now();
};

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// ============================================
// COLLECTION HELPERS
// ============================================

/**
 * Get reference to a collection
 * Example: getCollectionRef('users', 'user123', 'journals')
 */
export const getCollectionRef = (userId: string, collectionName: string) => {
  return collection(db, 'users', userId, collectionName);
};

/**
 * Get reference to a specific document
 */
export const getDocumentRef = (userId: string, collectionName: string, docId: string) => {
  return doc(db, 'users', userId, collectionName, docId);
};

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Create a new document in Firestore
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection (e.g., 'journals')
 * @param data - Data to save
 * @returns The ID of the newly created document
 */
export const createDocument = async <T extends DocumentData>(
  userId: string,
  collectionName: string,
  data: T
): Promise<string> => {
  return retryOperation(async () => {
    const collectionRef = getCollectionRef(userId, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      userId,
      createdAt: now(),
      updatedAt: now(),
    });
    return docRef.id;
  });
};

/**
 * Get a single document by ID
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @returns The document data with ID, or null if not found
 */
export const getDocument = async <T extends DocumentData>(
  userId: string,
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> => {
  return retryOperation(async () => {
    const docRef = getDocumentRef(userId, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T & { id: string };
  });
};

/**
 * Get all documents in a collection with optional filters
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection
 * @param constraints - Optional query constraints (where, orderBy, limit, etc.)
 * @returns Array of documents with IDs
 */
export const getDocuments = async <T extends DocumentData>(
  userId: string,
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> => {
  return retryOperation(async () => {
    const collectionRef = getCollectionRef(userId, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  });
};

/**
 * Update a document
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @param updates - Partial data to update
 */
export const updateDocument = async <T extends Partial<DocumentData>>(
  userId: string,
  collectionName: string,
  docId: string,
  updates: T
): Promise<void> => {
  return retryOperation(async () => {
    const docRef = getDocumentRef(userId, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now(),
    });
  });
};

/**
 * Delete a document
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 */
export const deleteDocument = async (
  userId: string,
  collectionName: string,
  docId: string
): Promise<void> => {
  return retryOperation(async () => {
    const docRef = getDocumentRef(userId, collectionName, docId);
    await deleteDoc(docRef);
  });
};

// ============================================
// REAL-TIME LISTENERS
// ============================================

/**
 * Subscribe to real-time updates for a single document
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @param onUpdate - Callback function when document changes
 * @param onError - Optional error callback
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToDocument = <T extends DocumentData>(
  userId: string,
  collectionName: string,
  docId: string,
  onUpdate: (data: (T & { id: string }) | null) => void,
  onError?: (error: DatabaseError) => void
): Unsubscribe => {
  const docRef = getDocumentRef(userId, collectionName, docId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({
          id: docSnap.id,
          ...docSnap.data(),
        } as T & { id: string });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      const dbError = handleFirestoreError(error);
      console.error('Subscription error:', dbError);
      if (onError) {
        onError(dbError);
      }
    }
  );
};

/**
 * Subscribe to real-time updates for a collection
 *
 * @param userId - User ID who owns this data
 * @param collectionName - Name of the collection
 * @param constraints - Optional query constraints
 * @param onUpdate - Callback function when collection changes
 * @param onError - Optional error callback
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToCollection = <T extends DocumentData>(
  userId: string,
  collectionName: string,
  constraints: QueryConstraint[],
  onUpdate: (data: (T & { id: string })[]) => void,
  onError?: (error: DatabaseError) => void
): Unsubscribe => {
  const collectionRef = getCollectionRef(userId, collectionName);
  const q = query(collectionRef, ...constraints);

  return onSnapshot(
    q,
    (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as (T & { id: string })[];
      onUpdate(documents);
    },
    (error) => {
      const dbError = handleFirestoreError(error);
      console.error('Subscription error:', dbError);
      if (onError) {
        onError(dbError);
      }
    }
  );
};

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Check if a document exists
 */
export const documentExists = async (
  userId: string,
  collectionName: string,
  docId: string
): Promise<boolean> => {
  const doc = await getDocument(userId, collectionName, docId);
  return doc !== null;
};

/**
 * Count documents in a collection
 * Note: This loads all documents, so use sparingly for large collections
 */
export const countDocuments = async (
  userId: string,
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<number> => {
  const docs = await getDocuments(userId, collectionName, constraints);
  return docs.length;
};

// Export Firestore query helpers for use in service files
export { where, orderBy, limit, startAfter };
