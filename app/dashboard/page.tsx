'use client';

// Beautiful Dashboard - Cozy, elegant, minimalist aesthetic
// Matches the redesigned Settings page aesthetic

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      router.push('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <header style={{
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              LifeDash
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              Welcome back, {user?.displayName || user?.email || 'User'}!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/settings">
              <Button variant="ghost" size="md">
                Settings
              </Button>
            </Link>
            <Button onClick={handleSignOut} variant="secondary" size="md">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Journal Card */}
          <Link href="/journals" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-2xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-base)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}>0</span>
              </div>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>
                Journals
              </h3>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                Start writing your thoughts
              </p>
            </div>
          </Link>

          {/* Expenses Card */}
          <Link href="/expenses" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-2xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-base)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}>$0</span>
              </div>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>
                Expenses
              </h3>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                Track your spending
              </p>
            </div>
          </Link>

          {/* Flashcards Card */}
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-base)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
              }}>0</span>
            </div>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              Flashcards
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}>
              Learn and memorize
            </p>
          </div>

          {/* Tasks Card */}
          <Link href="/tasks" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-2xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-base)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(242, 100, 25, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary-500)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}>0</span>
              </div>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>
                Tasks
              </h3>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}>
                Stay organized
              </p>
            </div>
          </Link>
        </div>

        {/* Welcome Message */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}>
            Welcome to Your Dashboard!
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: '1.6',
          }}>
            You've successfully set up authentication! Here's what you can do next:
          </p>
          <ul style={{
            listStyle: 'disc',
            listStylePosition: 'inside',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
          }}>
            <li>Create journals to organize your thoughts</li>
            <li>Track expenses and manage your budget</li>
            <li>Build flashcard decks for learning</li>
            <li>Manage tasks and schedules</li>
          </ul>
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> These features are coming soon! You've completed the authentication setup.
              The next step is to build the actual features (journals, expenses, etc.).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
