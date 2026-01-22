'use client';

/**
 * OFFLINE CONTEXT
 *
 * Provides offline status and pending operations queue throughout the app.
 *
 * Features:
 * - Tracks online/offline status
 * - Queues operations performed while offline
 * - Automatically processes queue when back online
 * - Shows pending operation count
 *
 * Usage:
 *   const { isOffline, pendingCount, queueOperation } = useOffline();
 *
 *   // Queue an operation to run when online
 *   queueOperation(async () => {
 *     await saveData(data);
 *   });
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import toast from 'react-hot-toast';

// Type for operations that can be queued
type QueuedOperation = {
  id: string;
  operation: () => Promise<void>;
  description: string;
  timestamp: number;
};

// Context shape
interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  pendingCount: number;
  queueOperation: (operation: () => Promise<void>, description?: string) => void;
  clearQueue: () => void;
}

// Create the context
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Storage key for persisting queue
const QUEUE_STORAGE_KEY = 'lifedash_offline_queue_count';

/**
 * OFFLINE PROVIDER
 *
 * Wrap your app with this to enable offline functionality
 */
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, isOffline } = useOnlineStatus();
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const isProcessing = useRef(false);

  // Process queued operations when we come back online
  const processQueue = useCallback(async () => {
    if (isProcessing.current || queue.length === 0 || isOffline) return;

    isProcessing.current = true;

    // Show toast for syncing
    const toastId = toast.loading(`Syncing ${queue.length} pending operation(s)...`);

    // Process each operation in order
    const remainingQueue: QueuedOperation[] = [];

    for (const item of queue) {
      try {
        await item.operation();
        console.log(`Synced: ${item.description}`);
      } catch (error) {
        console.error(`Failed to sync: ${item.description}`, error);
        // Keep failed operations in queue
        remainingQueue.push(item);
      }
    }

    setQueue(remainingQueue);

    if (remainingQueue.length === 0) {
      toast.success('All changes synced!', { id: toastId });
    } else {
      toast.error(`${remainingQueue.length} operation(s) failed to sync`, { id: toastId });
    }

    isProcessing.current = false;
  }, [queue, isOffline]);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      // Small delay to ensure connection is stable
      const timer = setTimeout(processQueue, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, processQueue]);

  // Queue an operation for later execution
  const queueOperation = useCallback((operation: () => Promise<void>, description = 'Operation') => {
    const newItem: QueuedOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      description,
      timestamp: Date.now(),
    };

    setQueue((prev) => [...prev, newItem]);

    // If we're online, try to execute immediately
    if (isOnline) {
      operation().catch((error) => {
        console.error(`Failed to execute: ${description}`, error);
        toast.error(`Failed to save: ${description}`);
      });
    } else {
      toast(`Saved offline - will sync when connected`, {
        icon: '📴',
        duration: 2000,
      });
    }
  }, [isOnline]);

  // Clear all queued operations
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Save queue count to localStorage for persistence indicator
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUEUE_STORAGE_KEY, String(queue.length));
    }
  }, [queue.length]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOffline,
        pendingCount: queue.length,
        queueOperation,
        clearQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

/**
 * USE OFFLINE HOOK
 *
 * Access offline context in any component
 */
export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

export default OfflineProvider;
