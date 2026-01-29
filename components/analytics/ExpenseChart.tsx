'use client';

/**
 * EXPENSE CHART
 *
 * Shows spending stats.
 * Displays:
 * - Monthly spending
 * - Daily average
 * - Month-over-month comparison
 */

import { ExpenseAnalytics } from '@/lib/analytics-service';
import { useAuth } from '@/lib/auth-context';
import { getCurrencySymbol } from '@/lib/currency-utils';

interface ExpenseChartProps {
  data: ExpenseAnalytics;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const { userPreferences } = useAuth();
  const currency = userPreferences?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const formatCurrency = (value: number) => {
    // Format number with commas and append currency symbol
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return `${currencySymbol}${formatted}`;
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
            }}
          />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            Expense Tracking
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
          Your spending this month
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e', margin: 0 }}>
            {formatCurrency(data.thisMonth)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            This Month
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {formatCurrency(data.avgPerDay)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Daily Avg
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {formatCurrency(data.lastMonth)}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Last Month
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
