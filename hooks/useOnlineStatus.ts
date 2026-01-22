'use client';

/**
 * USE ONLINE STATUS HOOK
 *
 * This hook tells you if the user is online or offline.
 *
 * How it works:
 * 1. Uses browser's navigator.onLine to check initial status
 * 2. Listens for 'online' and 'offline' events
 * 3. Returns { isOnline, isOffline } for easy use
 *
 * Usage:
 *   const { isOnline, isOffline } = useOnlineStatus();
 *   if (isOffline) { show "You're offline" message }
 */

import { useState, useEffect } from 'react';

interface OnlineStatus {
  isOnline: boolean;
  isOffline: boolean;
}

export function useOnlineStatus(): OnlineStatus {
  // Start with true (online) to avoid flash on initial load
  // We'll update this immediately in useEffect
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're in the browser (not server-side rendering)
    if (typeof window === 'undefined') return;

    // Get the actual online status from the browser
    setIsOnline(navigator.onLine);

    // Function to run when we go online
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored - you are back online!');
    };

    // Function to run when we go offline
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost - you are offline');
    };

    // Add event listeners for online/offline changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup: remove event listeners when component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

export default useOnlineStatus;
