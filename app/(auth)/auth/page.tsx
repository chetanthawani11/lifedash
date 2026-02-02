'use client';

/**
 * AUTHENTICATION PAGE
 *
 * Modern, polished design matching the landing page aesthetic
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/forms/LoginForm';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { AppIcon } from '@/components/ui/AppIcon';

type AuthView = 'login' | 'register' | 'reset';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {/* Fixed Background Layer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
      >
        {/* Gradient Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #f8fffe 0%, #f0fdfb 50%, #e6faf6 100%)',
          }}
          className="auth-bg-light"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
          }}
          className="auth-bg-dark"
        />

        {/* Subtle Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Toaster position="top-center" />

      {/* Back to Landing Link */}
      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-primary)',
          zIndex: 100,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--brand-primary)';
          e.currentTarget.style.borderColor = 'var(--brand-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-primary)';
        }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border-primary)',
          padding: '2rem',
          width: '100%',
          maxWidth: '380px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px',
              textDecoration: 'none',
            }}
          >
            <AppIcon size={32} color="var(--brand-primary)" />
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              LifeDash
            </h1>
          </Link>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            {view === 'login' && 'Welcome back'}
            {view === 'register' && 'Create your account'}
            {view === 'reset' && 'Reset your password'}
          </p>
        </div>

        {/* Tab Navigation */}
        {view !== 'reset' && (
          <div
            className="auth-tabs"
            style={{
              display: 'flex',
              gap: '4px',
              padding: '3px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              width: '100%',
            }}
          >
            <button
              onClick={() => setView('login')}
              className="auth-tab"
              style={{
                flex: '1 1 50%',
                minWidth: 0,
                padding: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: view === 'login' ? 'var(--bg-elevated)' : 'transparent',
                color: view === 'login' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                boxShadow: view === 'login' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setView('register')}
              className="auth-tab"
              style={{
                flex: '1 1 50%',
                minWidth: 0,
                padding: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: view === 'register' ? 'var(--bg-elevated)' : 'transparent',
                color: view === 'register' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                boxShadow: view === 'register' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Forms with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === 'register' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'register' ? -10 : 10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'login' && (
              <div>
                <LoginForm />
                <button
                  onClick={() => setView('reset')}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '8px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-tertiary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--brand-primary)';
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
          </motion.div>
        </AnimatePresence>

        {/* Footer - Only show on login */}
        {view === 'login' && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-primary)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              By continuing, you agree to our{' '}
              <a href="#" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>
                Terms
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </p>
          </div>
        )}
      </motion.div>

      {/* Responsive Styles */}
      <style jsx global>{`
        @media (prefers-color-scheme: light) {
          .auth-bg-light {
            display: block;
          }
          .auth-bg-dark {
            display: none;
          }
        }
        @media (prefers-color-scheme: dark) {
          .auth-bg-light {
            display: none;
          }
          .auth-bg-dark {
            display: block;
          }
        }

        /* Ensure tabs are always 50/50 on all devices */
        .auth-tabs {
          display: flex !important;
          flex-direction: row !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .auth-tab {
          flex: 1 1 0% !important;
          min-width: 0 !important;
          max-width: none !important;
          width: auto !important;
          text-align: center !important;
          box-sizing: border-box !important;
        }

        /* Tablet specific fix (768px - 1024px) */
        @media (min-width: 768px) and (max-width: 1024px) {
          .auth-tabs {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
          }
          .auth-tab {
            flex: 1 1 0% !important;
            min-width: 0 !important;
            width: 50% !important;
          }
        }
      `}</style>
    </div>
  );
}
