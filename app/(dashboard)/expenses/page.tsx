'use client';

/**
 * EXPENSES PAGE (Responsive)
 *
 * This is where users view and manage all their expenses.
 * Features:
 * - View all expenses in a list with category info
 * - Add new expenses
 * - Edit existing expenses
 * - Delete expenses with confirmation
 * - Filter by category
 * - Sort by date or amount
 * - Responsive layout for desktop and mobile
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
import { Modal } from '@/components/ui/Modal';
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
  const [isMobile, setIsMobile] = useState(false);

  // Filter and sort state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low'>('date-newest');

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
      }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
        }}>
          Loading expenses...
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
            Expenses
          </h1>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              onClick={() => router.push('/expenses/analytics')}
              variant="ghost"
              size="sm"
            >
              Analytics
            </Button>
            <Button
              onClick={() => router.push('/expenses/categories')}
              variant="ghost"
              size="sm"
            >
              Categories
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
            >
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      {expenses.length > 0 && (
        <div style={{
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'stretch',
        }}>
          {/* Category Filter */}
          <div style={{ flex: '1 1 200px', maxWidth: isMobile ? '100%' : '250px' }}>
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryFilterOptions}
            />
          </div>

          {/* Sort */}
          <div style={{ flex: '0 0 auto', width: isMobile ? '140px' : '180px' }}>
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as 'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low')}
              options={sortOptions}
            />
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div>
        {expenses.length === 0 ? (
          // Empty state
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Expenses Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1.5rem',
            }}>
              Start tracking your expenses to understand your spending habits
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
            >
              Add Your First Expense
            </Button>
          </div>
        ) : filteredAndSortedExpenses.length === 0 ? (
          // No results after filtering
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Expenses Found
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginBottom: '1rem',
            }}>
              No expenses match your filter criteria
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
                  padding: isMobile ? '1rem' : '1rem 1.5rem',
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
                {/* Desktop Layout */}
                {!isMobile ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    {/* Category Icon */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${expense.category.color}20`,
                      border: `2px solid ${expense.category.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}>
                      {expense.category.icon}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.125rem',
                      }}>
                        {expense.description}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                      }}>
                        <span>{expense.category.name}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {expense.paymentMethod.toUpperCase()}
                        </span>
                        {expense.isRecurring && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--primary-600)', fontWeight: '500' }}>
                              Recurring
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      minWidth: '100px',
                      textAlign: 'right',
                    }}>
                      {currencySymbol}{centsToDollars(expense.amount).toFixed(2)}
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexShrink: 0,
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
                ) : (
                  /* Mobile Layout */
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}>
                      {/* Category Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${expense.category.color}20`,
                        border: `2px solid ${expense.category.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}>
                        {expense.category.icon}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}>
                          <div style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                          }}>
                            {expense.description}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            flexShrink: 0,
                          }}>
                            {currencySymbol}{centsToDollars(expense.amount).toFixed(2)}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          marginTop: '0.25rem',
                        }}>
                          <span>{expense.category.name}</span>
                          <span>•</span>
                          <span>{formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                    }}>
                      <Button
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowCreateModal(true);
                        }}
                        variant="ghost"
                        size="sm"
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(expense)}
                        variant="danger"
                        size="sm"
                        fullWidth
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Expense?"
        maxWidth="400px"
      >
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          lineHeight: '1.6',
        }}>
          Are you sure you want to delete this expense?
        </p>
        {selectedExpense && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {selectedExpense.description}
            </div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--primary-600)' }}>
              {currencySymbol}{centsToDollars(selectedExpense.amount).toFixed(2)}
            </div>
          </div>
        )}
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--error)',
          marginBottom: '1rem',
        }}>
          This action cannot be undone.
        </p>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            variant="ghost"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="danger"
            fullWidth
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Create/Edit Expense Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedExpense(null);
        }}
        title={selectedExpense ? 'Edit Expense' : 'Add Expense'}
        maxWidth="500px"
      >
        {user && (
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
        )}
      </Modal>
    </div>
  );
}
