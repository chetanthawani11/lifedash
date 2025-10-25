# 🛡️ Complete Validation & Sanitization Guide

## Table of Contents
1. [What Is This?](#what-is-this)
2. [Quick Start](#quick-start)
3. [Validation (Checking if data is correct)](#validation)
4. [Sanitization (Cleaning dangerous data)](#sanitization)
5. [Form Utilities (Making forms easy)](#form-utilities)
6. [Testing Your Code](#testing)
7. [Real Examples](#real-examples)
8. [Common Issues](#common-issues)

---

## What Is This?

Imagine your app is a nightclub 🏢:
- **Validation** = Security guard checking IDs
- **Sanitization** = Metal detector removing weapons

### Why Do We Need This?

**Without validation:**
```javascript
// User submits form with:
email: "not-an-email"
password: "123"  // Too short!
amount: -100     // Negative money?!

// Your app CRASHES or does weird things 💥
```

**With validation:**
```javascript
// System checks:
❌ Email is invalid → Show error
❌ Password too short → Show error
❌ Negative amount → Show error

// User fixes issues → App works perfectly ✅
```

**Without sanitization:**
```javascript
// Hacker types:
title: '<script>alert("Hacked!")</script>'

// Your app RUNS the code → User gets hacked! 😱
```

**With sanitization:**
```javascript
// System cleans:
title: 'alert("Hacked!")'  // Just text, no code

// Safe! No code execution ✅
```

---

## Quick Start

### Step 1: Run the Test Page

```bash
# Make sure server is running
npm run dev

# Open browser
http://localhost:3000/test-validation

# Press F12 to open console
# Click "Run All Tests"
```

**What you should see:**
- Lots of ✅ symbols (tests passing)
- No ❌ symbols (all working!)

### Step 2: Use in Your Forms

Here's a complete example for a journal entry form:

```typescript
'use client';

import { useState } from 'react';
import { createJournalEntrySchema } from '@/lib/validation';
import { sanitizeJournalEntry } from '@/lib/sanitization';
import { validateData } from '@/lib/form-utils';
import { createJournalEntry } from '@/lib/journal-service';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function CreateEntryForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    journalId: 'journal123',
    title: '',
    content: '',
    tags: [],
  });
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrors(null);

    // Step 1: Sanitize the data (clean dangerous stuff)
    const sanitized = sanitizeJournalEntry(formData);

    // Step 2: Validate the data (check if correct)
    const validation = validateData(createJournalEntrySchema, sanitized);

    if (!validation.success) {
      // Show errors
      setErrors(validation.errors);
      toast.error('Please fix the errors');
      setIsSubmitting(false);
      return;
    }

    // Step 3: Save to database
    try {
      await createJournalEntry(user.uid, validation.data);
      toast.success('Entry created!');
      // Clear form or redirect
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title input */}
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Entry title"
      />
      {errors?.find(e => e.field === 'title') && (
        <p style={{ color: 'red' }}>
          {errors.find(e => e.field === 'title').message}
        </p>
      )}

      {/* Content textarea */}
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="Write your entry..."
      />
      {errors?.find(e => e.field === 'content') && (
        <p style={{ color: 'red' }}>
          {errors.find(e => e.field === 'content').message}
        </p>
      )}

      {/* Submit button */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Create Entry'}
      </button>
    </form>
  );
}
```

---

## Validation

### What Are Validation Schemas?

Schemas are like blueprints that say "data must look like THIS":

```typescript
import { createJournalSchema } from '@/lib/validation';

// This schema says:
// - name: required, 1-100 characters
// - description: optional, max 500 characters
// - color: must be hex code like #FF5733
// - icon: max 4 characters (emoji)
```

### Available Schemas

Location: `lib/validation.ts`

#### Auth Schemas
- `registerSchema` - User registration
- `loginSchema` - User login
- `passwordResetSchema` - Password reset
- `updateProfileSchema` - Profile updates

#### Journal Schemas
- `createJournalSchema` - New journal
- `updateJournalSchema` - Edit journal
- `createJournalEntrySchema` - New entry
- `updateJournalEntrySchema` - Edit entry

#### Expense Schemas
- `createExpenseCategorySchema` - New category
- `updateExpenseCategorySchema` - Edit category
- `createExpenseSchema` - New expense
- `updateExpenseSchema` - Edit expense

#### Flashcard Schemas
- `createFlashcardDeckSchema` - New deck
- `updateFlashcardDeckSchema` - Edit deck
- `createFlashcardSchema` - New flashcard
- `updateFlashcardSchema` - Edit flashcard

#### Task Schemas
- `createTaskSchema` - New task
- `updateTaskSchema` - Edit task

### How to Use Validation

```typescript
import { validateData } from '@/lib/form-utils';
import { createExpenseSchema } from '@/lib/validation';

// Your form data
const expenseData = {
  categoryId: 'cat123',
  amount: 4250,  // $42.50 in cents
  currency: 'USD',
  description: 'Lunch',
  date: new Date(),
  paymentMethod: 'card',
};

// Validate it
const result = validateData(createExpenseSchema, expenseData);

if (result.success) {
  // ✅ Data is valid!
  console.log('Valid data:', result.data);
  // Save to database...
} else {
  // ❌ Data has errors
  console.error('Errors:', result.errors);
  // Show errors to user...
}
```

### Validation Error Format

Errors come in this format:

```typescript
[
  {
    field: "amount",
    message: "Amount must be greater than 0"
  },
  {
    field: "description",
    message: "Description is required"
  }
]
```

---

## Sanitization

### What Is Sanitization?

It removes dangerous code from user input:

**Before sanitization:**
```
<script>alert('Hacked!')</script>
```

**After sanitization:**
```
alert('Hacked!')  // Just text, no code!
```

### Available Sanitizers

Location: `lib/sanitization.ts`

#### Basic Sanitizers

**sanitizePlainText()**
```typescript
import { sanitizePlainText } from '@/lib/sanitization';

// Removes ALL HTML, trims spaces
const clean = sanitizePlainText('<h1>Title</h1>');
console.log(clean);  // "Title"
```

**sanitizeHTML()**
```typescript
import { sanitizeHTML } from '@/lib/sanitization';

// Keeps safe HTML, removes dangerous stuff
const clean = sanitizeHTML(
  '<p>Hello</p><script>bad()</script>'
);
console.log(clean);  // "<p>Hello</p>"
```

**sanitizeMarkdown()**
```typescript
import { sanitizeMarkdown } from '@/lib/sanitization';

// For markdown editors - keeps formatting
const clean = sanitizeMarkdown(
  '# Title\n**Bold** text'
);
```

**sanitizeURL()**
```typescript
import { sanitizeURL } from '@/lib/sanitization';

// Only allows http:// and https://
const safe = sanitizeURL('javascript:alert(1)');
console.log(safe);  // "" (blocked!)

const good = sanitizeURL('https://example.com');
console.log(good);  // "https://example.com" (allowed!)
```

#### Specialized Sanitizers

**For Journal Entries:**
```typescript
import { sanitizeJournalEntry } from '@/lib/sanitization';

const entry = {
  title: '<script>bad</script>My Title',
  content: 'Some **markdown** content',
  tags: ['tag1', '<script>bad</script>tag2'],
};

const clean = sanitizeJournalEntry(entry);
// Returns:
// {
//   title: "My Title",
//   content: "Some **markdown** content",
//   tags: ["tag1", "tag2"]
// }
```

**For Expenses:**
```typescript
import { sanitizeExpense } from '@/lib/sanitization';

const expense = {
  description: '<b>Lunch</b>',
  notes: 'With <script>bad</script> friends',
  tags: ['food', '<b>test</b>'],
};

const clean = sanitizeExpense(expense);
```

**For Flashcards:**
```typescript
import { sanitizeFlashcard } from '@/lib/sanitization';

const card = {
  front: 'What is <b>React</b>?',
  back: 'A <strong>JavaScript</strong> library',
  hint: 'Made by <script>bad</script> Facebook',
  tags: ['react', 'javascript'],
};

const clean = sanitizeFlashcard(card);
```

### XSS Detection

Check if text contains dangerous code:

```typescript
import { containsXSS } from '@/lib/sanitization';

if (containsXSS(userInput)) {
  console.warn('⚠️ Suspicious input detected!');
}
```

---

## Form Utilities

### Helper Functions

Location: `lib/form-utils.ts`

#### Get Error Message for a Field

```typescript
import { getFieldError } from '@/lib/form-utils';

const errors = [
  { field: 'email', message: 'Invalid email' },
  { field: 'password', message: 'Too short' },
];

const emailError = getFieldError(errors, 'email');
console.log(emailError);  // "Invalid email"
```

#### Check if Field Has Error

```typescript
import { hasFieldError } from '@/lib/form-utils';

if (hasFieldError(errors, 'email')) {
  // Add red border to input
}
```

#### Email Validation

```typescript
import { isValidEmail } from '@/lib/form-utils';

if (isValidEmail('user@example.com')) {
  console.log('✅ Valid email');
}
```

#### Password Strength

```typescript
import { checkPasswordStrength } from '@/lib/form-utils';

const strength = checkPasswordStrength('MyP@ssw0rd');
console.log(strength);
// {
//   isStrong: true,
//   score: 4,
//   feedback: []
// }

const weak = checkPasswordStrength('123');
console.log(weak);
// {
//   isStrong: false,
//   score: 0,
//   feedback: [
//     "Use at least 8 characters",
//     "Add uppercase letters",
//     "Add lowercase letters",
//     "Add special characters"
//   ]
// }
```

---

## Testing

### Run Tests Visually

1. **Start server:**
```bash
npm run dev
```

2. **Open test page:**
```
http://localhost:3000/test-validation
```

3. **Open console (F12)**

4. **Click "Run All Tests"**

### What Gets Tested

✅ **Validation Tests:**
- Valid journal creation
- Invalid data rejection
- Valid expense creation
- Email validation
- Password strength

✅ **Sanitization Tests:**
- XSS detection
- HTML cleaning
- URL blocking
- Plain text cleaning

✅ **Integration Tests:**
- Combined validation + sanitization

### Expected Results

All tests should show ✅ symbols:

```
✅ PASS: Journal validated successfully
✅ PASS: Correctly rejected invalid journal
✅ PASS: XSS blocked
✅ PASS: Email validation works
```

---

## Real Examples

### Example 1: Create Journal Form

```typescript
import { useState } from 'react';
import { createJournalSchema } from '@/lib/validation';
import { sanitizePlainText } from '@/lib/sanitization';
import { validateData, getFieldError } from '@/lib/form-utils';

function CreateJournalForm() {
  const [data, setData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📔',
  });
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sanitize
    const sanitized = {
      name: sanitizePlainText(data.name),
      description: sanitizePlainText(data.description),
      color: data.color,
      icon: data.icon,
    };

    // Validate
    const result = validateData(createJournalSchema, sanitized);

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    // Save...
    console.log('Valid data:', result.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={data.name}
        onChange={(e) => setData({...data, name: e.target.value})}
        placeholder="Journal name"
      />
      {getFieldError(errors, 'name') && (
        <p style={{ color: 'red' }}>
          {getFieldError(errors, 'name')}
        </p>
      )}

      <button type="submit">Create</button>
    </form>
  );
}
```

### Example 2: Real-time Validation

```typescript
import { useState } from 'react';
import { isValidEmail } from '@/lib/form-utils';

function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Validate as user types
    if (value && !isValidEmail(value)) {
      setError('Invalid email format');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        style={{
          borderColor: error ? 'red' : 'gray'
        }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## Common Issues

### Issue 1: "Zod is not defined"

**Fix:**
```bash
npm install zod
```

### Issue 2: "DOMPurify is not defined"

**Fix:**
```bash
npm install dompurify @types/dompurify
```

### Issue 3: Validation passes but data looks wrong

**Problem:** You forgot to sanitize!

**Fix:**
```typescript
// ❌ Wrong - no sanitization
const result = validateData(schema, formData);

// ✅ Correct - sanitize first!
const sanitized = sanitizeJournalEntry(formData);
const result = validateData(schema, sanitized);
```

### Issue 4: Getting "field is required" but field has value

**Problem:** Value has only whitespace

**Example:**
```typescript
{ title: "   " }  // Looks empty after trim
```

**Fix:** Sanitization automatically trims whitespace!

---

## Summary

### ✅ TESTING CHECKLIST

After implementing validation:

```
✅ VALIDATION:
□ Run test page: http://localhost:3000/test-validation
□ All validation tests pass
□ Invalid data is rejected
□ Error messages are clear

✅ SANITIZATION:
□ XSS attacks blocked
□ HTML cleaned properly
□ URLs sanitized
□ No dangerous code executes

✅ INTEGRATION:
□ Forms use both validation + sanitization
□ Errors display to users
□ Data saves correctly
□ No crashes or weird behavior

✅ SECURITY:
□ Can't submit <script> tags
□ Can't use javascript: URLs
□ Email format enforced
□ Password strength checked
```

### What You've Built 🎉

1. **Validation Schemas** - Rules for all data types
2. **Sanitization Functions** - Clean dangerous input
3. **Form Utilities** - Easy error handling
4. **Test Suite** - Verify everything works
5. **Test Page** - Visual testing interface

### Next Steps

Now that validation is complete, you can:
1. Build forms with confidence
2. Never worry about XSS attacks
3. Give users helpful error messages
4. Keep bad data out of your database

**Your app is now SECURE!** 🛡️

---

## Quick Reference

```typescript
// Import what you need
import { createJournalSchema } from '@/lib/validation';
import { sanitizeJournalEntry } from '@/lib/sanitization';
import { validateData } from '@/lib/form-utils';

// In your form submit:
const sanitized = sanitizeJournalEntry(formData);
const result = validateData(createJournalSchema, sanitized);

if (result.success) {
  // Save result.data
} else {
  // Show result.errors
}
```

That's it! 🚀
