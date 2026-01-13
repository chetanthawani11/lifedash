'use client';

/**
 * STATS OVERVIEW WIDGET
 *
 * Displays overall statistics across all modules.
 * Features:
 * - Summary counts for each module
 * - Progress indicators
 * - Streak tracking
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribeToJournals } from '@/lib/journal-service';
import { getExpenseStats } from '@/lib/expense-service';
import { subscribeToDecks } from '@/lib/flashcard-service';
import { subscribeToTasks } from '@/lib/task-service';
import { Journal, ExpenseStats, Deck, Task } from '@/types';

interface StatsOverviewWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const StatsOverviewWidget: React.FC<StatsOverviewWidgetProps> = ({ size }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let journalCount = 0;
    let expenseStats: ExpenseStats | null = null;
    let flashcardStats = { totalCards: 0, dueCards: 0 };
    let taskStats = { total: 0, completed: 0 };

    const updateStats = () => {
      const newStats: StatCard[] = [
        {
          id: 'journals',
          label: 'Journal Entries',
          value: journalCount,
          subValue: 'Total entries',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          color: '#3b82f6',
          bgColor: '#dbeafe',
        },
        {
          id: 'expenses',
          label: 'Monthly Spending',
          value: expenseStats ? `$${expenseStats.thisMonth.toFixed(0)}` : '$0',
          subValue: expenseStats ? `Total: $${expenseStats.totalSpent.toFixed(0)}` : 'No expenses',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: '#22c55e',
          bgColor: '#dcfce7',
        },
        {
          id: 'flashcards',
          label: 'Flashcards',
          value: flashcardStats.totalCards,
          subValue: flashcardStats.dueCards > 0 ? `${flashcardStats.dueCards} due for review` : 'All caught up!',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          color: '#a855f7',
          bgColor: '#f3e8ff',
        },
        {
          id: 'tasks',
          label: 'Tasks Completed',
          value: taskStats.completed,
          subValue: taskStats.total > 0 ? `of ${taskStats.total} total` : 'No tasks yet',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          color: '#f26419',
          bgColor: '#fed7aa',
        },
      ];

      setStats(newStats);
      setLoading(false);
    };

    // Load expense stats
    getExpenseStats(user.uid).then((data) => {
      expenseStats = data;
      updateStats();
    }).catch(console.error);

    const unsubJournals = subscribeToJournals(
      user.uid,
      (data) => {
        journalCount = data.length;
        updateStats();
      },
      console.error
    );

    const unsubDecks = subscribeToDecks(
      user.uid,
      (data) => {
        flashcardStats = {
          totalCards: data.reduce((sum, d) => sum + (d.cardCount || 0), 0),
          dueCards: data.reduce((sum, d) => sum + (d.cardsDue || 0), 0),
        };
        updateStats();
      },
      console.error
    );

    const unsubTasks = subscribeToTasks(
      user.uid,
      (data) => {
        taskStats = {
          total: data.length,
          completed: data.filter(t => t.status === 'completed').length,
        };
        updateStats();
      },
      console.error
    );

    return () => {
      unsubJournals();
      unsubDecks();
      unsubTasks();
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading stats...</div>
      </div>
    );
  }

  // Determine grid columns based on size
  const columns = size === 'small' ? 1 : size === 'medium' ? 2 : size === 'large' ? 2 : 4;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem',
        height: '100%',
        alignContent: 'start',
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: stat.bgColor,
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color,
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
          >
            {stat.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {stat.label}
            </p>
            {stat.subValue && (
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  margin: '0.25rem 0 0',
                }}
              >
                {stat.subValue}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverviewWidget;
