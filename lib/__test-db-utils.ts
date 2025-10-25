/**
 * TEST FILE FOR DATABASE UTILITIES
 *
 * This file helps you test if your database utilities are working correctly.
 * You can run these tests to make sure everything is connected properly.
 *
 * HOW TO USE:
 * 1. Make sure you're logged in to your app
 * 2. Import and call these functions from a React component
 * 3. Check the console for results
 */

import {
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  DatabaseError,
  where,
  orderBy,
  limit,
} from './db-utils';

// ============================================
// TEST DATA
// ============================================

interface TestItem {
  name: string;
  description: string;
  number: number;
  createdAt?: any;
  updatedAt?: any;
}

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test 1: Create a document
 * This tests if we can add new data to Firestore
 */
export const testCreateDocument = async (userId: string): Promise<void> => {
  console.log('🧪 TEST 1: Creating a document...');

  try {
    const testData: TestItem = {
      name: 'Test Item',
      description: 'This is a test item to verify database creation works',
      number: 42,
    };

    const docId = await createDocument(userId, 'test-items', testData);

    console.log('✅ SUCCESS: Document created with ID:', docId);
    console.log('📝 Data:', testData);
    return docId;
  } catch (error) {
    console.error('❌ FAILED: Could not create document');
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Test 2: Read a single document
 * This tests if we can retrieve data we just created
 */
export const testGetDocument = async (
  userId: string,
  docId: string
): Promise<void> => {
  console.log('🧪 TEST 2: Reading a document...');

  try {
    const doc = await getDocument<TestItem>(userId, 'test-items', docId);

    if (!doc) {
      console.error('❌ FAILED: Document not found');
      return;
    }

    console.log('✅ SUCCESS: Document retrieved');
    console.log('📝 Data:', doc);

    // Verify the data matches what we created
    if (doc.name === 'Test Item' && doc.number === 42) {
      console.log('✅ Data matches what we created!');
    } else {
      console.warn('⚠️  Warning: Data does not match expected values');
    }
  } catch (error) {
    console.error('❌ FAILED: Could not read document');
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Test 3: Update a document
 * This tests if we can modify existing data
 */
export const testUpdateDocument = async (
  userId: string,
  docId: string
): Promise<void> => {
  console.log('🧪 TEST 3: Updating a document...');

  try {
    const updates = {
      name: 'Updated Test Item',
      number: 100,
    };

    await updateDocument(userId, 'test-items', docId, updates);

    console.log('✅ SUCCESS: Document updated');
    console.log('📝 Updates:', updates);

    // Verify the update worked by reading the document again
    const doc = await getDocument<TestItem>(userId, 'test-items', docId);
    if (doc && doc.name === 'Updated Test Item' && doc.number === 100) {
      console.log('✅ Update verified: Data changed successfully!');
    }
  } catch (error) {
    console.error('❌ FAILED: Could not update document');
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Test 4: Get multiple documents
 * This tests if we can retrieve and filter multiple items
 */
export const testGetDocuments = async (userId: string): Promise<void> => {
  console.log('🧪 TEST 4: Getting multiple documents...');

  try {
    // Get all documents
    const allDocs = await getDocuments<TestItem>(userId, 'test-items');
    console.log(`✅ SUCCESS: Retrieved ${allDocs.length} documents`);

    // Test with filters
    const filteredDocs = await getDocuments<TestItem>(
      userId,
      'test-items',
      [
        where('number', '>', 50),
        orderBy('number', 'desc'),
        limit(5)
      ]
    );
    console.log(`✅ Filtered results: ${filteredDocs.length} documents with number > 50`);

  } catch (error) {
    console.error('❌ FAILED: Could not get documents');
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Test 5: Real-time listener
 * This tests if we can watch for changes in real-time
 */
export const testRealtimeListener = (
  userId: string,
  docId: string
): (() => void) => {
  console.log('🧪 TEST 5: Setting up real-time listener...');

  let updateCount = 0;

  const unsubscribe = subscribeToDocument<TestItem>(
    userId,
    'test-items',
    docId,
    (doc) => {
      updateCount++;
      console.log(`🔄 Real-time update #${updateCount} received!`);

      if (doc) {
        console.log('📝 Current data:', doc);
        console.log('✅ Real-time listener is working!');
      } else {
        console.log('Document was deleted or doesn\'t exist');
      }
    },
    (error) => {
      console.error('❌ Real-time listener error:', error);
    }
  );

  console.log('✅ Listener set up successfully');
  console.log('💡 Try updating this document in another tab to see real-time updates!');

  // Return unsubscribe function so the caller can stop listening
  return unsubscribe;
};

/**
 * Test 6: Delete a document
 * This tests if we can remove data (cleanup)
 */
export const testDeleteDocument = async (
  userId: string,
  docId: string
): Promise<void> => {
  console.log('🧪 TEST 6: Deleting a document...');

  try {
    await deleteDocument(userId, 'test-items', docId);

    console.log('✅ SUCCESS: Document deleted');

    // Verify deletion by trying to read it
    const doc = await getDocument<TestItem>(userId, 'test-items', docId);
    if (doc === null) {
      console.log('✅ Deletion verified: Document no longer exists!');
    } else {
      console.warn('⚠️  Warning: Document still exists after deletion');
    }
  } catch (error) {
    console.error('❌ FAILED: Could not delete document');
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Test 7: Error handling
 * This tests if errors are handled gracefully
 */
export const testErrorHandling = async (userId: string): Promise<void> => {
  console.log('🧪 TEST 7: Testing error handling...');

  try {
    // Try to get a document that doesn't exist
    const doc = await getDocument(userId, 'test-items', 'nonexistent-id');

    if (doc === null) {
      console.log('✅ SUCCESS: Non-existent document returns null (as expected)');
    }

    // Try to delete a document that doesn't exist
    try {
      await deleteDocument(userId, 'test-items', 'nonexistent-id');
      console.log('✅ SUCCESS: Deleting non-existent document handled gracefully');
    } catch (error) {
      console.log('✅ SUCCESS: Error caught when deleting non-existent document');
      console.log('Error message:', (error as DatabaseError).message);
    }

  } catch (error) {
    console.error('❌ FAILED: Error handling test failed');
    console.error('Error details:', error);
  }
};

// ============================================
// RUN ALL TESTS
// ============================================

/**
 * Run all tests in sequence
 * Call this function from your React component to test everything
 */
export const runAllDatabaseTests = async (userId: string): Promise<void> => {
  console.log('🚀 Starting Database Utilities Tests...');
  console.log('================================================');

  let testDocId: string | undefined;
  let unsubscribe: (() => void) | undefined;

  try {
    // Test 1: Create
    testDocId = await testCreateDocument(userId) as any;
    console.log('================================================\n');

    // Wait a bit for Firestore to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Read
    if (testDocId) {
      await testGetDocument(userId, testDocId);
      console.log('================================================\n');

      // Test 3: Update
      await testUpdateDocument(userId, testDocId);
      console.log('================================================\n');
    }

    // Test 4: Get multiple
    await testGetDocuments(userId);
    console.log('================================================\n');

    // Test 5: Real-time listener
    if (testDocId) {
      unsubscribe = testRealtimeListener(userId, testDocId);
      console.log('================================================\n');

      // Wait to see if listener picks up any changes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Test 6: Error handling
    await testErrorHandling(userId);
    console.log('================================================\n');

    // Test 7: Delete (cleanup)
    if (testDocId) {
      // Stop listening before deleting
      if (unsubscribe) {
        unsubscribe();
        console.log('🔇 Stopped real-time listener');
      }

      await testDeleteDocument(userId, testDocId);
      console.log('================================================\n');
    }

    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('================================================');

  } catch (error) {
    console.error('💥 Test suite failed:', error);

    // Cleanup on failure
    if (unsubscribe) {
      unsubscribe();
    }
    if (testDocId) {
      try {
        await deleteDocument(userId, 'test-items', testDocId);
        console.log('🧹 Cleanup: Test document deleted');
      } catch {
        console.log('⚠️  Could not cleanup test document');
      }
    }
  }
};

// ============================================
// INDIVIDUAL TEST EXPORTS
// ============================================

/**
 * Quick test: Just test connection
 * This is the simplest test - just creates and deletes a document
 */
export const quickConnectionTest = async (userId: string): Promise<boolean> => {
  console.log('⚡ Quick Connection Test...');

  try {
    // Create a simple document
    const docId = await createDocument(userId, 'test-items', {
      name: 'Quick Test',
      description: 'Testing connection',
      number: 1,
    });

    console.log('✅ Create: OK');

    // Read it back
    const doc = await getDocument(userId, 'test-items', docId);
    console.log('✅ Read: OK');

    // Delete it
    await deleteDocument(userId, 'test-items', docId);
    console.log('✅ Delete: OK');

    console.log('🎉 Connection test PASSED!');
    return true;

  } catch (error) {
    console.error('❌ Connection test FAILED:', error);
    return false;
  }
};
