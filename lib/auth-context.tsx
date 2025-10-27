'use client';

// Authentication Context - Global User State Management
// This provides user authentication state to the entire app

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { User, UserPreferences } from '@/types/auth';
import { getUserProfile } from './user-service';

// Define what data the context provides
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userPreferences: UserPreferences | null;
  refreshPreferences: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage keys
const PREFERENCES_KEY = 'lifedash_user_preferences';

// Provider component that wraps your app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (storedPreferences) {
      try {
        setUserPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Error parsing stored preferences:', error);
        localStorage.removeItem(PREFERENCES_KEY);
      }
    }
  }, []);

  // Load user preferences from Firestore
  const loadUserPreferences = async (uid: string) => {
    try {
      const userProfile = await getUserProfile(uid);
      if (userProfile?.preferences) {
        // Store in state
        setUserPreferences(userProfile.preferences);
        // Store in localStorage
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(userProfile.preferences));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Refresh preferences (can be called from settings page after update)
  const refreshPreferences = async () => {
    if (user) {
      await loadUserPreferences(user.uid);
    }
  };

  useEffect(() => {
    // Listen for authentication state changes
    // This runs automatically when user logs in/out
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(userData);

        // Load user preferences
        await loadUserPreferences(firebaseUser.uid);
      } else {
        // User is signed out
        setUser(null);
        setUserPreferences(null);
        // Clear localStorage
        localStorage.removeItem(PREFERENCES_KEY);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserPreferences(null);
      // Clear localStorage
      localStorage.removeItem(PREFERENCES_KEY);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    userPreferences,
    refreshPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
