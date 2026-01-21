'use client';

/**
 * EXPENSE ANALYTICS PAGE
 *
 * Beautiful charts and reports to visualize your spending.
 * Features:
 * - Pie chart showing spending by category
 * - Budget tracking with progress bars
 * - Monthly spending trends
 * - Export to CSV functionality
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getCategoriesWithSpending,
  getMonthlyExpenses,
  getTotalSpending,
  getSpendingByCategory,
} from '@/lib/expense-service';
import { CategoryWithSpending, centsToDollars } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { getCurrencySymbol } from '@/lib/currency-utils';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading, userPreferences } = useAuth();

  // State
  const [categories, setCategories] = useState<CategoryWithSpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalSpent, setTotalSpent] = useState(0);

  // Get currency from user preferences (loaded from localStorage/context)
  const currency = userPreferences?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Load data
  useEffect(() => {
    if (!user) return;
    loadAnalytics();
    // loadTrendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedMonth, selectedYear]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const categoriesData = await getCategoriesWithSpending(user.uid, selectedYear, selectedMonth);
      setCategories(categoriesData);

      // Calculate total spent
      const total = categoriesData.reduce((sum, cat) => sum + cat.totalSpent, 0);
      setTotalSpent(total);

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    if (!user) return;

    try {
      const expenses = await getMonthlyExpenses(user.uid, selectedYear, selectedMonth);

      // Create CSV content
      const headers = ['Date', 'Description', 'Category', `Amount (${currency})`, 'Payment Method', 'Tags'];
      const rows = expenses.map(expense => {
        const date = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
        return [
          date.toLocaleDateString(),
          expense.description,
          categories.find(c => c.id === expense.categoryId)?.name || 'Unknown',
          `${currencySymbol}${centsToDollars(expense.amount).toFixed(2)}`,
          expense.paymentMethod,
          expense.tags.join('; '),
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${selectedYear}-${selectedMonth + 1}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Expenses exported successfully!');
    } catch (error) {
      console.error('Error exporting expenses:', error);
      toast.error('Failed to export expenses');
    }
  };

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Prepare chart data
  const pieChartData = categories
    .filter(cat => cat.totalSpent > 0)
    .map(cat => ({
      name: cat.name,
      value: centsToDollars(cat.totalSpent),
      color: cat.color,
    }));

  // Month names
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Month options for Select component
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = new Date().getMonth() - i;
    const date = new Date();
    date.setMonth(month);
    return {
      value: `${date.getFullYear()}-${date.getMonth()}`,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
    };
  });

  // Year options for Select component
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return {
      value: year.toString(),
      label: year.toString(),
    };
  });

  // Loading state
  if (loading || authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
      }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Expense Analytics
          </h1>

          <Button
            onClick={handleExport}
            variant="primary"
            size="sm"
          >
            Export CSV
          </Button>
        </div>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Visualize your spending patterns and track your budget.
        </p>
      </div>

      {/* Monthly Overview Section */}
      <div style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem',
        marginBottom: '1rem',
        border: '1px solid var(--border-light)',
      }}>
        {/* Section Header with Month Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Monthly Overview
          </h2>
          <div style={{ minWidth: '200px' }}>
            <Select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(value) => {
                const [year, month] = value.split('-');
                setSelectedYear(parseInt(year));
                setSelectedMonth(parseInt(month));
              }}
              options={monthOptions}
            />
          </div>
        </div>

        {/* Total Spent - Compact */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            fontWeight: '500',
          }}>
            Total Spent in {monthNames[selectedMonth]}:
          </span>
          <span style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            {currencySymbol}{centsToDollars(totalSpent).toFixed(2)}
          </span>
        </div>

        {/* Spending by Category & Budget Tracking - Side by Side */}
        {pieChartData.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '0.75rem',
          }}>
            {/* Pie Chart */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}>
              <h3 style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}>
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const percentage = ((value / pieChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
                      return [`${currencySymbol}${value.toFixed(2)} (${percentage}%)`];
                    }}
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      padding: '0.5rem 0.75rem',
                      fontSize: 'var(--text-sm)',
                    }}
                    itemStyle={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)',
                      padding: '0',
                    }}
                    labelStyle={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: 'var(--text-sm)',
                      paddingTop: '1rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
          </div>

            {/* Budget Tracking */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}>
              <h3 style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}>
                Budget Tracking
              </h3>

            {categories.filter(cat => cat.budget).length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '0.5rem',
              }}>
                {categories
                  .filter(cat => cat.budget)
                  .map((category) => {
                    const spent = centsToDollars(category.totalSpent);
                    const budget = centsToDollars(category.budget!);
                    const percentage = category.percentageOfBudget || 0;
                    const isOverBudget = percentage > 100;

                    return (
                      <div key={category.id}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                          }}>
                            <span style={{ fontSize: '1.25rem' }}>{category.icon}</span>
                            <div>
                              <span style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                              }}>
                                {category.name}
                              </span>
                              <span style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--text-tertiary)',
                                marginLeft: '0.5rem',
                              }}>
                                {percentage.toFixed(0)}% used
                              </span>
                            </div>
                          </div>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: '600',
                            color: isOverBudget ? 'var(--error)' : 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                          }}>
                            {currencySymbol}{spent.toFixed(2)} / {currencySymbol}{budget.toFixed(2)}
                            {isOverBudget && ' ⚠️'}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: 'var(--bg-primary)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${Math.min(percentage, 100)}%`,
                            height: '100%',
                            backgroundColor: isOverBudget ? 'var(--error)' :
                              percentage > 80 ? '#f59e0b' :
                              category.color,
                            transition: 'width var(--transition-base)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                textAlign: 'center',
                padding: '1.5rem',
              }}>
                No budgets set. Add budgets to your categories to track spending limits.
              </p>
            )}
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Expenses This Month
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
            }}>
              Add some expenses to see your spending analytics and charts.
            </p>
            <Button
              onClick={() => router.push('/expenses')}
              variant="primary"
              size="sm"
            >
              Add Expense
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
