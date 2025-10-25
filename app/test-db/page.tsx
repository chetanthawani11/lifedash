'use client';

// DATABASE TEST PAGE
// This page lets you test all database operations with real buttons

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import toast, { Toaster } from 'react-hot-toast';

// Import journal services
import {
  createJournal,
  getUserJournals,
  createJournalEntry,
  getJournalEntries,
  deleteJournal,
  subscribeToUserJournals,
} from '@/lib/journal-service';

// Import expense services
import {
  createDefaultCategories,
  getUserExpenseCategories,
  createExpense,
  getUserExpenses,
  getExpensesWithCategories,
  getCategoriesWithSpending,
} from '@/lib/expense-service';

import { dollarsToCents, centsToDollars } from '@/types';
import type { Journal, JournalEntry, ExpenseCategory, Expense } from '@/types';

function TestDBContent() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time subscription to journals
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up real-time listener for journals...');
    const unsubscribe = subscribeToUserJournals(
      user.uid,
      (updatedJournals) => {
        console.log('📥 Real-time update:', updatedJournals.length, 'journals');
        setJournals(updatedJournals);
      },
      (error) => {
        console.error('❌ Subscription error:', error);
        toast.error('Failed to subscribe to journals');
      }
    );

    // Cleanup function - IMPORTANT!
    return () => {
      console.log('🔕 Unsubscribing from journals');
      unsubscribe();
    };
  }, [user]);

  // ============================================
  // JOURNAL TESTS
  // ============================================

  const handleCreateJournal = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const journal = await createJournal(user.uid, {
        name: 'Test Journal ' + Date.now(),
        description: 'Created from test page',
        color: '#f26419',
        icon: '📔',
      });

      console.log('✅ Created journal:', journal);
      toast.success(`Journal "${journal.name}" created!`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to create journal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!user) return;

    if (journals.length === 0) {
      toast.error('Create a journal first!');
      return;
    }

    setLoading(true);
    try {
      const firstJournal = journals[0];
      const entry = await createJournalEntry(user.uid, {
        journalId: firstJournal.id,
        title: 'Test Entry ' + new Date().toLocaleTimeString(),
        content: 'This is a test entry created from the test page. It has some content!',
        mood: 'great',
        tags: ['test', 'typescript'],
        isFavorite: false,
      });

      console.log('✅ Created entry:', entry);
      toast.success('Entry created!');

      // Reload entries to see the new one
      const updatedEntries = await getJournalEntries(user.uid, firstJournal.id);
      setEntries(updatedEntries);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadEntries = async () => {
    if (!user) return;

    if (journals.length === 0) {
      toast.error('Create a journal first!');
      return;
    }

    setLoading(true);
    try {
      const firstJournal = journals[0];
      const loadedEntries = await getJournalEntries(user.uid, firstJournal.id);
      setEntries(loadedEntries);
      console.log('✅ Loaded entries:', loadedEntries);
      toast.success(`Loaded ${loadedEntries.length} entries`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFirstJournal = async () => {
    if (!user || journals.length === 0) return;

    setLoading(true);
    try {
      const firstJournal = journals[0];
      await deleteJournal(user.uid, firstJournal.id);
      console.log('✅ Deleted journal:', firstJournal.name);
      toast.success('Journal deleted!');
      setEntries([]); // Clear entries since journal is gone
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to delete journal');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EXPENSE TESTS
  // ============================================

  const handleCreateCategories = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await createDefaultCategories(user.uid);
      const loadedCategories = await getUserExpenseCategories(user.uid);
      setCategories(loadedCategories);
      console.log('✅ Created categories:', loadedCategories);
      toast.success(`Created ${loadedCategories.length} categories!`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to create categories');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCategories = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const loadedCategories = await getUserExpenseCategories(user.uid);
      setCategories(loadedCategories);
      console.log('✅ Loaded categories:', loadedCategories);
      toast.success(`Loaded ${loadedCategories.length} categories`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!user) return;

    if (categories.length === 0) {
      toast.error('Create categories first!');
      return;
    }

    setLoading(true);
    try {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomAmount = Math.floor(Math.random() * 100) + 10; // $10-$110

      const expense = await createExpense(user.uid, {
        categoryId: randomCategory.id,
        amount: dollarsToCents(randomAmount),
        currency: 'USD',
        description: `Test expense $${randomAmount}`,
        notes: 'Created from test page',
        date: new Date(),
        paymentMethod: 'card',
        isRecurring: false,
        tags: ['test'],
      });

      console.log('✅ Created expense:', expense);
      toast.success(`Expense $${randomAmount} created!`);

      // Reload expenses
      const updatedExpenses = await getUserExpenses(user.uid);
      setExpenses(updatedExpenses);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExpenses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const loadedExpenses = await getUserExpenses(user.uid);
      setExpenses(loadedExpenses);
      console.log('✅ Loaded expenses:', loadedExpenses);
      toast.success(`Loaded ${loadedExpenses.length} expenses`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const stats = await getCategoriesWithSpending(user.uid);
      console.log('📊 SPENDING ANALYTICS:', stats);

      const totalSpent = stats.reduce((sum, cat) => sum + cat.totalSpent, 0);
      toast.success(
        `Total spent: $${centsToDollars(totalSpent).toFixed(2)}`,
        { duration: 5000 }
      );

      // Log each category
      stats.forEach(cat => {
        console.log(
          `${cat.icon} ${cat.name}: $${centsToDollars(cat.totalSpent).toFixed(2)}`,
          cat.budget ? `(${cat.percentageOfBudget?.toFixed(1)}% of budget)` : ''
        );
      });
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
      <Toaster position="top-right" />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            🧪 Database Test Page
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
            Test all database operations and see real-time updates!
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            Open browser console (F12) to see detailed logs 📝
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Journal Tests */}
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              📔 Journal Tests
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Button onClick={handleCreateJournal} loading={loading} variant="primary" fullWidth>
                Create Journal
              </Button>
              <Button onClick={handleCreateEntry} loading={loading} variant="secondary" fullWidth>
                Add Entry to First Journal
              </Button>
              <Button onClick={handleLoadEntries} loading={loading} variant="ghost" fullWidth>
                Load Entries
              </Button>
              <Button onClick={handleDeleteFirstJournal} loading={loading} variant="danger" fullWidth>
                Delete First Journal
              </Button>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <strong>Journals:</strong> {journals.length} (updates in real-time! 🔔)
              </p>
              {journals.map(journal => (
                <div key={journal.id} style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span>{journal.icon} {journal.name}</span>
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-tertiary)' }}>
                    ({journal.entryCount} entries)
                  </span>
                </div>
              ))}

              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <strong>Entries:</strong> {entries.length}
              </p>
              {entries.slice(0, 3).map(entry => (
                <div key={entry.id} style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  • {entry.title}
                </div>
              ))}
            </div>
          </div>

          {/* Expense Tests */}
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              💰 Expense Tests
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Button onClick={handleCreateCategories} loading={loading} variant="primary" fullWidth>
                Create Default Categories
              </Button>
              <Button onClick={handleLoadCategories} loading={loading} variant="secondary" fullWidth>
                Load Categories
              </Button>
              <Button onClick={handleCreateExpense} loading={loading} variant="secondary" fullWidth>
                Add Random Expense
              </Button>
              <Button onClick={handleLoadExpenses} loading={loading} variant="ghost" fullWidth>
                Load Expenses
              </Button>
              <Button onClick={handleShowAnalytics} loading={loading} variant="primary" fullWidth>
                📊 Show Analytics
              </Button>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <strong>Categories:</strong> {categories.length}
              </p>
              {categories.slice(0, 4).map(cat => (
                <div key={cat.id} style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {cat.icon} {cat.name}
                </div>
              ))}

              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <strong>Expenses:</strong> {expenses.length}
              </p>
              {expenses.slice(0, 3).map(expense => (
                <div key={expense.id} style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  ${centsToDollars(expense.amount).toFixed(2)} - {expense.description}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            📖 How to Test
          </h3>
          <ol style={{ paddingLeft: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li><strong>Open Browser Console</strong> (Press F12 or Right-click → Inspect → Console)</li>
            <li><strong>Journal Test:</strong> Click "Create Journal", then "Add Entry", then "Load Entries"</li>
            <li><strong>Watch Real-time Updates:</strong> Journals update automatically when you create/delete them!</li>
            <li><strong>Expense Test:</strong> Click "Create Default Categories", then "Add Random Expense" multiple times</li>
            <li><strong>See Analytics:</strong> Click "Show Analytics" to see spending breakdown in console</li>
            <li><strong>Check Firestore:</strong> Go to Firebase Console → Firestore Database to see the actual data!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function TestDBPage() {
  return (
    <ProtectedRoute>
      <TestDBContent />
    </ProtectedRoute>
  );
}
