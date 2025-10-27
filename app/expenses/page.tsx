'use client';

/**
 * EXPENSES PAGE
 *
 * This is where users view and manage all their expenses.
 * Features:
 * - View all expenses in a list with category info
 * - Add new expenses
 * - Edit existing expenses
 * - Delete expenses with confirmation
 * - Filter by category
 * - Sort by date or amount
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getExpensesWithCategories,
  deleteExpense,
  getUserExpenseCategories,
} from '@/lib/expense-service';
import { ExpenseWithCategory, ExpenseCategory, centsToDollars } from '@/types';
import { Button } from '@/components/ui/Button';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { Select, SelectOption } from '@/components/ui/Select';
import { getCurrencySymbol } from '@/lib/currency-utils';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const router = useRouter();
  const { user, loading: authLoading, userPreferences } = useAuth();

  // Get currency from user preferences
  const currencySymbol = getCurrencySymbol(userPreferences?.currency || 'USD');

  // State
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithCategory | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter and sort state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low'>('date-newest');

  // Load expenses and categories
  useEffect(() => {
    if (!user) return;

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [expensesData, categoriesData] = await Promise.all([
        getExpensesWithCategories(user.uid, 100),
        getUserExpenseCategories(user.uid),
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load expenses');
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle expense deletion
  const handleDelete = async (expense: ExpenseWithCategory) => {
    setSelectedExpense(expense);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedExpense) return;

    try {
      await deleteExpense(user.uid, selectedExpense.id);
      toast.success('Expense deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedExpense(null);
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
      toast.error(errorMessage);
    }
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = expenses
    .filter((expense) => {
      if (filterCategory === 'all') return true;
      return expense.categoryId === filterCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date-newest') {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'date-oldest') {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'amount-high') {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });

  // Format date for display
  const formatDate = (date: { toDate?: () => Date } | Date) => {
    const d = date && typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Category filter options
  const categoryFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Categories', icon: '📊' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    })),
  ];

  // Sort options
  const sortOptions: SelectOption[] = [
    { value: 'date-newest', label: 'Newest First' },
    { value: 'date-oldest', label: 'Oldest First' },
    { value: 'amount-high', label: 'Highest Amount' },
    { value: 'amount-low', label: 'Lowest Amount' },
  ];

  // Loading state
  if (loading || authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)',
        }}>
          Loading expenses...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '2rem',
    }}>
      {/* Page Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
      }}>
        {/* Back to Dashboard */}
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          size="sm"
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Dashboard
        </Button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
            My Expenses
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button
              onClick={() => router.push('/expenses/analytics')}
              variant="ghost"
              size="lg"
            >
              📈 View Analytics
            </Button>
            <Button
              onClick={() => router.push('/expenses/categories')}
              variant="ghost"
              size="lg"
            >
              📊 Manage Categories
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Add Expense
            </Button>
          </div>
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
        }}>
          Track and manage your expenses. View spending by category and stay within budget.
        </p>
      </div>

      {/* Filters and Sort */}
      {expenses.length > 0 && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 1.5rem auto',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          {/* Category Filter */}
          <div style={{ flex: 1 }}>
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryFilterOptions}
            />
          </div>

          {/* Sort */}
          <div style={{ width: '200px' }}>
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as 'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low')}
              options={sortOptions}
            />
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {expenses.length === 0 ? (
          // Empty state
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>
              💰
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Expenses Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Start tracking your expenses to understand your spending habits.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Add Your First Expense
            </Button>
          </div>
        ) : filteredAndSortedExpenses.length === 0 ? (
          // No results after filtering
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Expenses Found
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
            }}>
              No expenses match your filter criteria.
            </p>
            <Button
              onClick={() => setFilterCategory('all')}
              variant="ghost"
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          // Expenses list
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}>
            {filteredAndSortedExpenses.map((expense, index) => (
              <div
                key={expense.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: index < filteredAndSortedExpenses.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background-color var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  {/* Left: Category icon and expense details */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flex: 1,
                  }}>
                    {/* Category Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${expense.category.color}20`,
                      border: `2px solid ${expense.category.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}>
                      {expense.category.icon}
                    </div>

                    {/* Expense Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                      }}>
                        {expense.description}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                      }}>
                        <span>{expense.category.name}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date)}</span>
                        {expense.isRecurring && (
                          <>
                            <span>•</span>
                            <span style={{
                              color: 'var(--primary-600)',
                              fontWeight: '500',
                            }}>
                              🔄 Recurring
                            </span>
                          </>
                        )}
                      </div>
                      {expense.tags.length > 0 && (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          flexWrap: 'wrap',
                        }}>
                          {expense.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 'var(--text-xs)',
                                padding: '0.125rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--primary-100)',
                                color: 'var(--primary-700)',
                                fontWeight: '500',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount and actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                  }}>
                    {/* Amount */}
                    <div style={{
                      textAlign: 'right',
                    }}>
                      <div style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                      }}>
                        {currencySymbol}{centsToDollars(expense.amount).toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                      }}>
                        {expense.paymentMethod.toUpperCase()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                    }}>
                      <Button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowCreateModal(true);
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(expense)}
                        variant="danger"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedExpense && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
            minHeight: 'fit-content',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}>
              Delete Expense?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete this expense?
              <br /><br />
              <strong>{selectedExpense.description}</strong> - {currencySymbol}{centsToDollars(selectedExpense.amount).toFixed(2)}
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>This action cannot be undone.</strong>
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="danger"
                size="lg"
                fullWidth
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Expense Modal */}
      {showCreateModal && user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '2rem 1rem',
        }}
          onClick={() => {
            setShowCreateModal(false);
            setSelectedExpense(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            margin: '0 auto',
            minHeight: 'fit-content',
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}>
              {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>

            <ExpenseForm
              userId={user.uid}
              expense={selectedExpense}
              onSuccess={() => {
                setShowCreateModal(false);
                setSelectedExpense(null);
                loadData();
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedExpense(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
