// TypeScript Types for Authentication and User Profile
// These define the shape of our auth-related data

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  createdAt?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
    budgetAlerts: boolean;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}
