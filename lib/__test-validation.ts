/**
 * VALIDATION & SANITIZATION TESTS
 *
 * This file contains tests for validation and sanitization utilities.
 * Run these to make sure everything works correctly!
 *
 * HOW TO USE:
 * 1. Import test functions in a React component or test page
 * 2. Call runAllValidationTests() in useEffect or on button click
 * 3. Check console for results
 */

import {
  createJournalSchema,
  createJournalEntrySchema,
  createExpenseSchema,
  createTaskSchema,
  registerSchema,
  loginSchema,
} from './validation';

import {
  sanitizePlainText,
  sanitizeHTML,
  sanitizeMarkdown,
  sanitizeURL,
  sanitizeJournalEntry,
  sanitizeExpense,
  containsXSS,
  escapeHTML,
} from './sanitization';

import {
  validateData,
  isValidEmail,
  checkPasswordStrength,
  getFieldError,
  hasFieldError,
} from './form-utils';

// ============================================
// TEST DATA
// ============================================

const GOOD_DATA = {
  journal: {
    name: 'My Personal Journal',
    description: 'A place for my thoughts',
    color: '#FF5733',
    icon: '📔',
  },
  journalEntry: {
    journalId: 'journal123',
    title: 'Today was amazing!',
    content: 'I learned so much about **validation** and *sanitization*!',
    mood: 'great' as const,
    tags: ['learning', 'coding'],
    isFavorite: true,
  },
  expense: {
    categoryId: 'cat123',
    amount: 4250, // $42.50
    currency: 'USD' as const,
    description: 'Lunch at the cafe',
    notes: 'With friends',
    date: new Date(),
    paymentMethod: 'card' as const,
    isRecurring: false,
    tags: ['food'],
  },
  task: {
    title: 'Complete validation tests',
    description: 'Test all validation functions',
    status: 'todo' as const,
    priority: 'high' as const,
    tags: ['testing'],
  },
};

const BAD_DATA = {
  journalEmpty: {
    name: '',  // Too short!
    color: 'not-a-color',  // Invalid hex!
  },
  journalTooLong: {
    name: 'A'.repeat(200),  // Too long!
    description: 'B'.repeat(1000),  // Too long!
  },
  expenseNegative: {
    categoryId: 'cat123',
    amount: -100,  // Negative!
    description: '',  // Empty!
  },
  xssAttempt: {
    title: '<script>alert("hacked")</script>',
    content: '<img src=x onerror="alert(1)">',
  },
};

// ============================================
// VALIDATION TESTS
// ============================================

/**
 * Test 1: Valid journal creation
 */
export const testValidJournal = (): void => {
  console.log('🧪 TEST 1: Valid Journal Creation');

  const result = validateData(createJournalSchema, GOOD_DATA.journal);

  if (result.success) {
    console.log('✅ PASS: Journal validated successfully');
    console.log('📝 Data:', result.data);
  } else {
    console.error('❌ FAIL: Should have passed but got errors:', result.errors);
  }
  console.log('---');
};

/**
 * Test 2: Invalid journal (empty name)
 */
export const testInvalidJournal = (): void => {
  console.log('🧪 TEST 2: Invalid Journal (Empty Name)');

  const result = validateData(createJournalSchema, BAD_DATA.journalEmpty);

  if (!result.success) {
    console.log('✅ PASS: Correctly rejected invalid journal');
    console.log('📝 Errors:', result.errors);

    // Check specific error
    const nameError = getFieldError(result.errors, 'name');
    if (nameError) {
      console.log(`   - Name error: "${nameError}"`);
    }
  } else {
    console.error('❌ FAIL: Should have rejected but passed');
  }
  console.log('---');
};

/**
 * Test 3: Valid journal entry
 */
export const testValidJournalEntry = (): void => {
  console.log('🧪 TEST 3: Valid Journal Entry');

  const result = validateData(createJournalEntrySchema, GOOD_DATA.journalEntry);

  if (result.success) {
    console.log('✅ PASS: Journal entry validated successfully');
    console.log('📝 Mood:', result.data.mood);
    console.log('📝 Tags:', result.data.tags);
  } else {
    console.error('❌ FAIL: Should have passed but got errors:', result.errors);
  }
  console.log('---');
};

/**
 * Test 4: Valid expense
 */
export const testValidExpense = (): void => {
  console.log('🧪 TEST 4: Valid Expense');

  const result = validateData(createExpenseSchema, GOOD_DATA.expense);

  if (result.success) {
    console.log('✅ PASS: Expense validated successfully');
    console.log('📝 Amount:', result.data.amount, 'cents');
    console.log('📝 Payment:', result.data.paymentMethod);
  } else {
    console.error('❌ FAIL: Should have passed but got errors:', result.errors);
  }
  console.log('---');
};

/**
 * Test 5: Invalid expense (negative amount)
 */
export const testInvalidExpense = (): void => {
  console.log('🧪 TEST 5: Invalid Expense (Negative Amount)');

  const result = validateData(createExpenseSchema, BAD_DATA.expenseNegative);

  if (!result.success) {
    console.log('✅ PASS: Correctly rejected negative expense');
    console.log('📝 Errors:', result.errors);
  } else {
    console.error('❌ FAIL: Should have rejected but passed');
  }
  console.log('---');
};

/**
 * Test 6: Email validation
 */
export const testEmailValidation = (): void => {
  console.log('🧪 TEST 6: Email Validation');

  const validEmails = [
    'user@example.com',
    'john.doe@company.co.uk',
    'test+tag@domain.com',
  ];

  const invalidEmails = [
    'not-an-email',
    '@example.com',
    'user@',
    'user @example.com',
  ];

  console.log('Testing valid emails:');
  validEmails.forEach(email => {
    const isValid = isValidEmail(email);
    console.log(`  ${isValid ? '✅' : '❌'} ${email}: ${isValid}`);
  });

  console.log('Testing invalid emails:');
  invalidEmails.forEach(email => {
    const isValid = isValidEmail(email);
    console.log(`  ${!isValid ? '✅' : '❌'} ${email}: ${isValid} (should be false)`);
  });

  console.log('---');
};

/**
 * Test 7: Password strength
 */
export const testPasswordStrength = (): void => {
  console.log('🧪 TEST 7: Password Strength Check');

  const passwords = [
    { value: '123', expected: 'weak' },
    { value: 'password', expected: 'weak' },
    { value: 'Password123', expected: 'strong' },
    { value: 'P@ssw0rd!', expected: 'strong' },
  ];

  passwords.forEach(({ value, expected }) => {
    const strength = checkPasswordStrength(value);
    const isCorrect = (expected === 'strong' && strength.isStrong) ||
                     (expected === 'weak' && !strength.isStrong);

    console.log(`  ${isCorrect ? '✅' : '❌'} "${value}"`);
    console.log(`    Score: ${strength.score}/4, Strong: ${strength.isStrong}`);
    if (strength.feedback.length > 0) {
      console.log(`    Feedback: ${strength.feedback.join(', ')}`);
    }
  });

  console.log('---');
};

// ============================================
// SANITIZATION TESTS
// ============================================

/**
 * Test 8: XSS Detection
 */
export const testXSSDetection = (): void => {
  console.log('🧪 TEST 8: XSS Detection');

  const testCases = [
    { input: 'Normal text', shouldDetect: false },
    { input: '<script>alert("xss")</script>', shouldDetect: true },
    { input: '<img src=x onerror="alert(1)">', shouldDetect: true },
    { input: 'javascript:void(0)', shouldDetect: true },
    { input: '<p>Safe HTML</p>', shouldDetect: false },
    { input: 'onclick="alert(1)"', shouldDetect: true },
  ];

  testCases.forEach(({ input, shouldDetect }) => {
    const detected = containsXSS(input);
    const isCorrect = detected === shouldDetect;

    console.log(`  ${isCorrect ? '✅' : '❌'} "${input.substring(0, 30)}..."`);
    console.log(`    Detected: ${detected}, Expected: ${shouldDetect}`);
  });

  console.log('---');
};

/**
 * Test 9: HTML Sanitization
 */
export const testHTMLSanitization = (): void => {
  console.log('🧪 TEST 9: HTML Sanitization');

  const testCases = [
    {
      input: '<script>alert("xss")</script>Hello',
      name: 'Script tag removal',
    },
    {
      input: '<p onclick="alert(1)">Click me</p>',
      name: 'Event handler removal',
    },
    {
      input: '<strong>Bold</strong> and <em>italic</em>',
      name: 'Safe formatting kept',
    },
  ];

  testCases.forEach(({ input, name }) => {
    const sanitized = sanitizeHTML(input);
    console.log(`  Test: ${name}`);
    console.log(`    Input:  "${input}"`);
    console.log(`    Output: "${sanitized}"`);
    console.log(`    ${!containsXSS(sanitized) ? '✅' : '❌'} Clean: ${!containsXSS(sanitized)}`);
  });

  console.log('---');
};

/**
 * Test 10: Plain Text Sanitization
 */
export const testPlainTextSanitization = (): void => {
  console.log('🧪 TEST 10: Plain Text Sanitization');

  const testCases = [
    {
      input: '<h1>Title</h1>',
      expected: 'Title',
    },
    {
      input: '  Multiple   spaces  ',
      expected: 'Multiple spaces',
    },
    {
      input: 'Normal text',
      expected: 'Normal text',
    },
  ];

  testCases.forEach(({ input, expected }) => {
    const sanitized = sanitizePlainText(input);
    const isCorrect = sanitized === expected;

    console.log(`  ${isCorrect ? '✅' : '❌'} "${input}"`);
    console.log(`    Got:      "${sanitized}"`);
    console.log(`    Expected: "${expected}"`);
  });

  console.log('---');
};

/**
 * Test 11: URL Sanitization
 */
export const testURLSanitization = (): void => {
  console.log('🧪 TEST 11: URL Sanitization');

  const testCases = [
    {
      input: 'https://example.com',
      shouldPass: true,
    },
    {
      input: 'http://example.com',
      shouldPass: true,
    },
    {
      input: 'javascript:alert(1)',
      shouldPass: false,
    },
    {
      input: 'data:text/html,<script>alert(1)</script>',
      shouldPass: false,
    },
  ];

  testCases.forEach(({ input, shouldPass }) => {
    const sanitized = sanitizeURL(input);
    const passed = sanitized !== '';
    const isCorrect = passed === shouldPass;

    console.log(`  ${isCorrect ? '✅' : '❌'} "${input}"`);
    console.log(`    Result: "${sanitized}"`);
    console.log(`    Expected to ${shouldPass ? 'pass' : 'block'}`);
  });

  console.log('---');
};

/**
 * Test 12: Combined Validation + Sanitization
 */
export const testCombinedValidationSanitization = (): void => {
  console.log('🧪 TEST 12: Combined Validation + Sanitization');

  // Test journal entry with XSS attempt
  const maliciousEntry = {
    journalId: 'journal123',
    title: '<script>alert("xss")</script>My Title',
    content: '<img src=x onerror="alert(1)">Content here',
    tags: ['<script>tag</script>', 'normal-tag'],
  };

  console.log('Input (contains XSS):');
  console.log('  Title:', maliciousEntry.title);
  console.log('  Content:', maliciousEntry.content);

  // Sanitize first
  const sanitized = sanitizeJournalEntry(maliciousEntry);

  console.log('\nAfter sanitization:');
  console.log('  Title:', sanitized.title);
  console.log('  Content:', sanitized.content);
  console.log('  Tags:', sanitized.tags);

  // Then validate
  const result = validateData(createJournalEntrySchema, {
    ...maliciousEntry,
    ...sanitized,
  });

  if (result.success) {
    console.log('\n✅ PASS: Data sanitized and validated');
    console.log('📝 Safe data:', result.data);
  } else {
    console.log('\n❌ Validation errors:', result.errors);
  }

  console.log('---');
};

// ============================================
// RUN ALL TESTS
// ============================================

/**
 * Run all validation and sanitization tests
 *
 * Call this function to test everything at once!
 */
export const runAllValidationTests = (): void => {
  console.log('🚀 STARTING VALIDATION & SANITIZATION TESTS');
  console.log('================================================\n');

  try {
    // Validation tests
    testValidJournal();
    testInvalidJournal();
    testValidJournalEntry();
    testValidExpense();
    testInvalidExpense();
    testEmailValidation();
    testPasswordStrength();

    // Sanitization tests
    testXSSDetection();
    testHTMLSanitization();
    testPlainTextSanitization();
    testURLSanitization();

    // Combined test
    testCombinedValidationSanitization();

    console.log('================================================');
    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('Check results above. ✅ = Pass, ❌ = Fail');

  } catch (error) {
    console.error('💥 Test suite crashed:', error);
  }
};

/**
 * Quick test - just the essentials
 */
export const quickValidationTest = (): void => {
  console.log('⚡ QUICK VALIDATION TEST\n');

  // Test 1: Valid data
  const validResult = validateData(createJournalSchema, GOOD_DATA.journal);
  console.log('1. Valid data:', validResult.success ? '✅' : '❌');

  // Test 2: Invalid data
  const invalidResult = validateData(createJournalSchema, BAD_DATA.journalEmpty);
  console.log('2. Invalid data rejected:', !invalidResult.success ? '✅' : '❌');

  // Test 3: XSS blocked
  const xssBlocked = !containsXSS(sanitizePlainText(BAD_DATA.xssAttempt.title));
  console.log('3. XSS blocked:', xssBlocked ? '✅' : '❌');

  console.log('\n' + (validResult.success && !invalidResult.success && xssBlocked
    ? '🎉 All quick tests passed!'
    : '⚠️ Some tests failed - run full test suite for details'));
};

// ============================================
// EXPORTS
// ============================================

export default {
  runAllValidationTests,
  quickValidationTest,
  // Individual tests
  testValidJournal,
  testInvalidJournal,
  testValidJournalEntry,
  testValidExpense,
  testInvalidExpense,
  testEmailValidation,
  testPasswordStrength,
  testXSSDetection,
  testHTMLSanitization,
  testPlainTextSanitization,
  testURLSanitization,
  testCombinedValidationSanitization,
};
