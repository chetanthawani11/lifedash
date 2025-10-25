# ⚡ Validation & Sanitization Cheatsheet

Quick copy-paste reference for common tasks.

---

## 🚀 Quick Start

### Test Everything
```bash
npm run dev
# Open: http://localhost:3000/test-validation
# Click: "Run All Tests"
```

---

## ✅ Validation

### Basic Pattern (Use This Everywhere!)

```typescript
import { validateData } from '@/lib/form-utils';
import { createJournalSchema } from '@/lib/validation';
import { sanitizeJournalEntry } from '@/lib/sanitization';

// 1. Sanitize
const clean = sanitizeJournalEntry(formData);

// 2. Validate
const result = validateData(createJournalSchema, clean);

// 3. Check result
if (result.success) {
  // ✅ Save result.data
} else {
  // ❌ Show result.errors
}
```

### Show Errors in Forms

```typescript
import { getFieldError } from '@/lib/form-utils';

// In your JSX:
{getFieldError(errors, 'email') && (
  <p style={{ color: 'red' }}>
    {getFieldError(errors, 'email')}
  </p>
)}
```

---

## 🛡️ Sanitization

### Plain Text (Titles, Names)
```typescript
import { sanitizePlainText } from '@/lib/sanitization';

const clean = sanitizePlainText(userInput);
```

### HTML Content (Journal Entries)
```typescript
import { sanitizeHTML } from '@/lib/sanitization';

const clean = sanitizeHTML(userInput);
```

### Markdown (Rich Text Editors)
```typescript
import { sanitizeMarkdown } from '@/lib/sanitization';

const clean = sanitizeMarkdown(userInput);
```

### URLs (Links)
```typescript
import { sanitizeURL } from '@/lib/sanitization';

const safeURL = sanitizeURL(userInput);
if (safeURL === '') {
  // Blocked dangerous URL
}
```

### Journal Entry (All-in-One)
```typescript
import { sanitizeJournalEntry } from '@/lib/sanitization';

const clean = sanitizeJournalEntry({
  title: userInput.title,
  content: userInput.content,
  tags: userInput.tags,
});
```

---

## 📋 Available Schemas

### Auth
```typescript
import {
  registerSchema,      // Registration form
  loginSchema,         // Login form
  passwordResetSchema, // Password reset
  updateProfileSchema, // Profile updates
} from '@/lib/validation';
```

### Journal
```typescript
import {
  createJournalSchema,       // New journal
  updateJournalSchema,       // Edit journal
  createJournalEntrySchema,  // New entry
  updateJournalEntrySchema,  // Edit entry
} from '@/lib/validation';
```

### Expense
```typescript
import {
  createExpenseCategorySchema, // New category
  updateExpenseCategorySchema, // Edit category
  createExpenseSchema,         // New expense
  updateExpenseSchema,         // Edit expense
} from '@/lib/validation';
```

### Flashcard
```typescript
import {
  createFlashcardDeckSchema, // New deck
  updateFlashcardDeckSchema, // Edit deck
  createFlashcardSchema,     // New card
  updateFlashcardSchema,     // Edit card
} from '@/lib/validation';
```

### Task
```typescript
import {
  createTaskSchema,  // New task
  updateTaskSchema,  // Edit task
} from '@/lib/validation';
```

---

## 🔧 Utility Functions

### Check Email
```typescript
import { isValidEmail } from '@/lib/form-utils';

if (isValidEmail(email)) {
  // ✅ Valid
}
```

### Check Password Strength
```typescript
import { checkPasswordStrength } from '@/lib/form-utils';

const strength = checkPasswordStrength(password);
// Returns: { isStrong: boolean, score: 0-4, feedback: string[] }
```

### Detect XSS
```typescript
import { containsXSS } from '@/lib/sanitization';

if (containsXSS(userInput)) {
  // ⚠️ Suspicious!
}
```

### Escape HTML
```typescript
import { escapeHTML } from '@/lib/sanitization';

const safe = escapeHTML('<script>bad</script>');
// Returns: "&lt;script&gt;bad&lt;/script&gt;"
```

---

## 📝 Complete Form Example

```typescript
'use client';

import { useState } from 'react';
import { createJournalSchema } from '@/lib/validation';
import { sanitizePlainText } from '@/lib/sanitization';
import { validateData, getFieldError } from '@/lib/form-utils';

export default function MyForm() {
  const [data, setData] = useState({ name: '', description: '', color: '#3B82F6' });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Sanitize
    const sanitized = {
      name: sanitizePlainText(data.name),
      description: sanitizePlainText(data.description),
      color: data.color,
      icon: '📔',
    };

    // Validate
    const result = validateData(createJournalSchema, sanitized);

    if (!result.success) {
      setErrors(result.errors);
      setLoading(false);
      return;
    }

    // Save
    try {
      // await saveToDatabase(result.data);
      console.log('Saving:', result.data);
      setData({ name: '', description: '', color: '#3B82F6' });
      setErrors(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Name field */}
      <div>
        <input
          type="text"
          value={data.name}
          onChange={(e) => setData({...data, name: e.target.value})}
          placeholder="Journal name"
        />
        {getFieldError(errors, 'name') && (
          <p style={{ color: 'red' }}>{getFieldError(errors, 'name')}</p>
        )}
      </div>

      {/* Description field */}
      <div>
        <textarea
          value={data.description}
          onChange={(e) => setData({...data, description: e.target.value})}
          placeholder="Description (optional)"
        />
        {getFieldError(errors, 'description') && (
          <p style={{ color: 'red' }}>{getFieldError(errors, 'description')}</p>
        )}
      </div>

      {/* Submit button */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Journal'}
      </button>
    </form>
  );
}
```

---

## ⚠️ Common Mistakes

### ❌ DON'T: Skip sanitization
```typescript
// BAD - No sanitization!
const result = validateData(schema, formData);
```

### ✅ DO: Always sanitize first
```typescript
// GOOD - Sanitize then validate
const clean = sanitizeJournalEntry(formData);
const result = validateData(schema, clean);
```

### ❌ DON'T: Trust user input
```typescript
// BAD - Dangerous!
await saveToDatabase(formData);
```

### ✅ DO: Validate before saving
```typescript
// GOOD - Safe!
const result = validateData(schema, sanitizedData);
if (result.success) {
  await saveToDatabase(result.data);
}
```

---

## 🧪 Testing Checklist

```
□ Run http://localhost:3000/test-validation
□ Click "Run All Tests"
□ All tests show ✅
□ XSS attacks blocked
□ Invalid data rejected
□ Error messages clear
```

---

## 📊 Error Handling Pattern

```typescript
const result = validateData(schema, data);

if (!result.success) {
  // Option 1: Show all errors
  result.errors.forEach(err => {
    console.log(`${err.field}: ${err.message}`);
  });

  // Option 2: Show first error
  toast.error(result.errors[0].message);

  // Option 3: Show per-field errors (recommended)
  setFormErrors(result.errors);
}
```

---

## 🎯 When to Use What

| Task | Use This |
|------|----------|
| Journal title | `sanitizePlainText()` |
| Journal content (markdown) | `sanitizeMarkdown()` |
| Expense description | `sanitizePlainText()` |
| Task description | `sanitizePlainText()` |
| Flashcard content (HTML) | `sanitizeHTML()` |
| User-provided URL | `sanitizeURL()` |
| Email address | `isValidEmail()` |
| Password | `checkPasswordStrength()` |

---

## 💡 Pro Tips

1. **Always sanitize BEFORE validate**
2. **Use specialized sanitizers** (sanitizeJournalEntry, etc.)
3. **Show field-specific errors** (better UX)
4. **Disable submit while validating** (prevent double-submit)
5. **Test with malicious input** (use test page)

---

## 🆘 Quick Fixes

### Tests failing?
```bash
npm install zod dompurify @types/dompurify
npm run dev
```

### Import errors?
```typescript
// Use absolute imports
import { validateData } from '@/lib/form-utils';
// NOT: import { validateData } from '../lib/form-utils';
```

### "Cannot read property 'errors'"?
```typescript
// Initialize errors as null
const [errors, setErrors] = useState(null);

// Check before using
{errors && getFieldError(errors, 'email')}
```

---

## 📚 Files Reference

- **Schemas:** `lib/validation.ts`
- **Sanitization:** `lib/sanitization.ts`
- **Form Utils:** `lib/form-utils.ts`
- **Tests:** `lib/__test-validation.ts`
- **Test Page:** `app/test-validation/page.tsx`
- **Guide:** `docs/VALIDATION-GUIDE.md`

---

**That's all you need!** 🚀

Copy, paste, and adapt these patterns for your forms!
