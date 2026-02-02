'use client';

/**
 * QUICK ACTIONS WIDGET
 *
 * Provides quick access buttons for common actions.
 * Features:
 * - One-click access to create new items
 * - Links to main features
 */

import { useRouter } from 'next/navigation';

interface QuickActionsWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  href: string;
}

const actions: QuickAction[] = [
  {
    id: 'new-journal',
    label: 'New Journal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: '#3b82f6',
    bgColor: '#dbeafe',
    href: '/journals/new',
  },
  {
    id: 'add-expense',
    label: 'Add Expense',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#22c55e',
    bgColor: '#dcfce7',
    href: '/expenses/new',
  },
  {
    id: 'new-task',
    label: 'New Task',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: '#0d9488',
    bgColor: '#ccfbf1',
    href: '/tasks/new',
  },
  {
    id: 'study-flashcards',
    label: 'Study Cards',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: '#a855f7',
    bgColor: '#f3e8ff',
    href: '/flashcards',
  },
];

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ size }) => {
  const router = useRouter();

  // Determine layout based on size
  const isCompact = size === 'small';
  const columns = size === 'small' ? 2 : size === 'medium' ? 2 : 4;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0.75rem',
        height: '100%',
        alignContent: 'start',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => router.push(action.href)}
          style={{
            display: 'flex',
            flexDirection: isCompact ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: isCompact ? 'flex-start' : 'center',
            gap: isCompact ? '0.5rem' : '0.75rem',
            padding: isCompact ? '0.75rem' : '1rem',
            backgroundColor: action.bgColor,
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            color: action.color,
          }}
        >
          <div
            style={{
              width: isCompact ? '32px' : '40px',
              height: isCompact ? '32px' : '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {action.icon}
          </div>
          <span
            style={{
              fontSize: isCompact ? 'var(--text-xs)' : 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              textAlign: isCompact ? 'left' : 'center',
            }}
          >
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsWidget;
