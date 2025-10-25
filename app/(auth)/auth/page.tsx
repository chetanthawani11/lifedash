'use client';

/**
 * AUTHENTICATION PAGE
 *
 * Elegant, minimal design matching the dashboard aesthetic
 */

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { LoginForm } from '@/components/forms/LoginForm';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';

type AuthView = 'login' | 'register' | 'reset';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-secondary)', // Match dashboard background
    }}>
      <Toaster position="top-right" />

      {/* Main Card - Elegant and Minimal */}
      <div style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-md)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Simple Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            LifeDash
          </h1>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
          }}>
            {view === 'login' && 'Welcome back'}
            {view === 'register' && 'Create your account'}
            {view === 'reset' && 'Reset your password'}
          </p>
        </div>

        {/* Tab Navigation - Only show for login/register */}
        {view !== 'reset' && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
          }}>
            <button
              onClick={() => setView('login')}
              style={{
                flex: 1,
                padding: '0.625rem',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                backgroundColor: view === 'login' ? 'var(--bg-elevated)' : 'transparent',
                color: view === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: view === 'login' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Login
            </button>
            <button
              onClick={() => setView('register')}
              style={{
                flex: 1,
                padding: '0.625rem',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                backgroundColor: view === 'register' ? 'var(--bg-elevated)' : 'transparent',
                color: view === 'register' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: view === 'register' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Forms */}
        {view === 'login' && (
          <div>
            <LoginForm />
            <button
              onClick={() => setView('reset')}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.5rem',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'color var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {view === 'register' && <RegisterForm />}
        {view === 'reset' && <ResetPasswordForm onBack={() => setView('login')} />}
      </div>
    </div>
  );
}
