'use client';

/**
 * EXPENSE CATEGORIES PAGE
 *
 * This is where users manage all their expense categories.
 * Features:
 * - View all categories in a beautiful grid
 * - Create new categories with color and budget
 * - Edit existing categories
 * - Delete categories (with safety check for existing expenses)
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getUserExpenseCategories,
  deleteExpenseCategory,
  createDefaultCategories,
} from '@/lib/expense-service';
import { ExpenseCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { getCurrencySymbol } from '@/lib/currency-utils';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const router = useRouter();
  const { user, loading: authLoading, userPreferences } = useAuth();

  // Get currency from user preferences
  const currencySymbol = getCurrencySymbol(userPreferences?.currency || 'USD');

  // State to store all categories
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load categories when component mounts
  useEffect(() => {
    if (!user) return;

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;

    try {
      const userCategories = await getUserExpenseCategories(user.uid);
      setCategories(userCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user && !authLoading) {
    router.push('/auth');
    return null;
  }

  // Handle category deletion
  const handleDelete = async (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !selectedCategory) return;

    try {
      await deleteExpenseCategory(user.uid, selectedCategory.id);
      toast.success(`"${selectedCategory.name}" deleted successfully`);
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
      loadCategories(); // Reload categories
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  // Initialize default categories if none exist
  const handleCreateDefaults = async () => {
    if (!user) return;

    try {
      await createDefaultCategories(user.uid);
      toast.success('Default categories created successfully');
      loadCategories();
    } catch (error) {
      console.error('Error creating default categories:', error);
      toast.error('Failed to create default categories');
    }
  };

  // Format budget for display
  const formatBudget = (cents: number | null) => {
    if (!cents) return null;
    return `${currencySymbol}${(cents / 100).toFixed(2)}`;
  };

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
          Loading categories...
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
            Expense Categories
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button
              onClick={() => router.push('/expenses')}
              variant="ghost"
              size="lg"
            >
              💰 View Expenses
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
            >
              Create Category
            </Button>
          </div>
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
        }}>
          Manage your expense categories. Create custom categories with budgets to organize your spending.
        </p>
      </div>

      {/* Categories Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {categories.length === 0 ? (
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
              📊
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}>
              No Categories Yet
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
            }}>
              Create categories to organize your expenses. Start with default categories or create custom ones.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Button
                onClick={handleCreateDefaults}
                variant="primary"
                size="lg"
              >
                Create Default Categories
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="ghost"
                size="lg"
              >
                Create Custom Category
              </Button>
            </div>
          </div>
        ) : (
          // Category cards grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all var(--transition-base)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = category.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Category Icon & Color */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: `${category.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  border: `2px solid ${category.color}`,
                }}>
                  {category.icon}
                </div>

                {/* Category Name */}
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}>
                  {category.name}
                </h3>

                {/* Budget Info */}
                {category.budget && (
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${category.color}15`,
                    border: `1px solid ${category.color}40`,
                    marginBottom: '1rem',
                  }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: '600',
                      color: category.color,
                    }}>
                      Budget: {formatBudget(category.budget)}
                    </span>
                  </div>
                )}

                {!category.budget && (
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-tertiary)',
                    marginBottom: '1rem',
                  }}>
                    No budget set
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginTop: 'auto',
                }}>
                  <Button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCreateModal(true);
                    }}
                    variant="ghost"
                    size="sm"
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(category)}
                    variant="danger"
                    size="sm"
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCategory && (
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
              Delete Category?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              Are you sure you want to delete <strong>&ldquo;{selectedCategory.name}&rdquo;</strong>?
              <br /><br />
              <strong style={{ color: 'var(--error)' }}>This action cannot be undone.</strong> You cannot delete a category if there are expenses using it.
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

      {/* Create/Edit Category Modal */}
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
            setSelectedCategory(null);
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            maxWidth: '500px',
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
              {selectedCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            <CategoryForm
              userId={user.uid}
              category={selectedCategory}
              onSuccess={() => {
                setShowCreateModal(false);
                setSelectedCategory(null);
                loadCategories();
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setSelectedCategory(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
