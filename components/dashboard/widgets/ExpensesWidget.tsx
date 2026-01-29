'use client';

/**
 * EXPENSES WIDGET
 *
 * Displays expense summary on the dashboard.
 * Features:
 * - Monthly spending total
 * - Recent transactions
 * - Quick add expense button
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { subscribeToExpenses, getExpenseStats } from '@/lib/expense-service';
import { Expense, ExpenseStats } from '@/types';
import { getCurrencySymbol } from '@/lib/currency-utils';

interface ExpensesWidgetProps {
  size: 'small' | 'medium' | 'large' | 'full';
}

export const ExpensesWidget: React.FC<ExpensesWidgetProps> = ({ size }) => {
  const { user, userPreferences } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);

  const maxEntries = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const currencySymbol = getCurrencySymbol(userPreferences?.currency || 'USD');

  useEffect(() => {
    if (!user) return;

    // Load stats
    getExpenseStats(user.uid).then(setStats).catch(console.error);

    const unsubscribe = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data.slice(0, maxEntries));
        setLoading(false);
      },
      (error) => {
        console.error('Error loading expenses:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, maxEntries]);

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${currencySymbol}${formatted}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading expenses...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Monthly Summary */}
      <div
        style={{
          padding: '0.75rem',
          backgroundColor: 'var(--success-50)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
          This Month
        </p>
        <p
          style={{
            fontSize: size === 'small' ? 'var(--text-lg)' : 'var(--text-xl)',
            fontWeight: '700',
            color: 'var(--success-600)',
            margin: '0.25rem 0 0',
          }}
        >
          {formatCurrency(stats?.thisMonth || 0)}
        </p>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={() => router.push('/expenses/new')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'var(--success-50)',
          border: '1px dashed var(--success-300)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--success-600)',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          transition: 'all var(--transition-fast)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Expense
      </button>

      {/* Recent Expenses */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'auto' }}>
        {expenses.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <p style={{ fontSize: 'var(--text-sm)' }}>No expenses recorded</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => router.push(`/expenses/${expense.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {expense.description}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                  {formatDate(expense.date)}
                </p>
              </div>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      <button
        onClick={() => router.push('/expenses')}
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--success-600)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '0.25rem',
        }}
      >
        View all expenses →
      </button>
    </div>
  );
};

export default ExpensesWidget;
