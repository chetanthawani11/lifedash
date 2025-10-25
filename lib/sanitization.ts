/**
 * DATA SANITIZATION UTILITIES
 *
 * This file protects your app from XSS (Cross-Site Scripting) attacks.
 *
 * WHAT IS XSS?
 * Imagine a hacker types this in your journal:
 * "<script>alert('Hacked!');</script>"
 *
 * Without sanitization: Your app would RUN that code! 😱
 * With sanitization: Your app shows it as TEXT, not code! ✅
 *
 * HOW IT WORKS:
 * We use DOMPurify - a library that removes dangerous HTML/JavaScript
 * while keeping safe formatting like bold, italics, links, etc.
 */

import DOMPurify from 'dompurify';

// ============================================
// BROWSER VS SERVER CHECK
// ============================================

/**
 * Check if we're running in the browser
 * DOMPurify needs the DOM, which only exists in browsers
 */
const isBrowser = typeof window !== 'undefined';

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize HTML content
 *
 * USE THIS FOR: Journal entries, notes, any rich text content
 *
 * WHAT IT DOES:
 * - Removes <script> tags ✅
 * - Removes onclick, onload, etc. ✅
 * - Removes javascript: URLs ✅
 * - Keeps safe HTML like <p>, <strong>, <a> ✅
 *
 * @param dirty - Potentially dangerous HTML
 * @returns Clean, safe HTML
 */
export const sanitizeHTML = (dirty: string): string => {
  if (!isBrowser) {
    // On server, just strip all HTML tags for safety
    return dirty.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(dirty, {
    // Allow these HTML tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
    ],
    // Allow these attributes
    ALLOWED_ATTR: ['href', 'title', 'target'],
    // Don't allow data URIs (can be used for XSS)
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize plain text
 *
 * USE THIS FOR: Titles, descriptions, short text fields
 *
 * WHAT IT DOES:
 * - Removes ALL HTML tags
 * - Removes extra whitespace
 * - Trims leading/trailing spaces
 *
 * @param text - Input text
 * @returns Clean plain text
 */
export const sanitizePlainText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
    .trim();                   // Remove leading/trailing whitespace
};

/**
 * Sanitize markdown content
 *
 * USE THIS FOR: Markdown editors (journal entries, notes)
 *
 * WHAT IT DOES:
 * - Removes <script> tags
 * - Removes dangerous attributes
 * - Keeps markdown-compatible HTML
 *
 * @param markdown - Markdown content
 * @returns Safe markdown
 */
export const sanitizeMarkdown = (markdown: string): string => {
  if (!isBrowser) {
    return markdown;
  }

  return DOMPurify.sanitize(markdown, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'src', 'alt'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize URL
 *
 * USE THIS FOR: User-provided links
 *
 * WHAT IT DOES:
 * - Blocks javascript: URLs
 * - Blocks data: URLs
 * - Only allows http:// and https://
 *
 * @param url - URL to sanitize
 * @returns Safe URL or empty string
 */
export const sanitizeURL = (url: string): string => {
  const trimmedURL = url.trim();

  // Block dangerous URL schemes
  if (
    trimmedURL.startsWith('javascript:') ||
    trimmedURL.startsWith('data:') ||
    trimmedURL.startsWith('vbscript:')
  ) {
    return '';
  }

  // Only allow http:// and https://
  if (
    !trimmedURL.startsWith('http://') &&
    !trimmedURL.startsWith('https://')
  ) {
    return '';
  }

  return trimmedURL;
};

/**
 * Sanitize filename
 *
 * USE THIS FOR: File uploads, attachment names
 *
 * WHAT IT DOES:
 * - Removes path traversal attempts (../)
 * - Removes special characters
 * - Limits length
 *
 * @param filename - Original filename
 * @returns Safe filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/\.\./g, '')         // Remove ".."
    .replace(/[/\\]/g, '')        // Remove slashes
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with _
    .substring(0, 255);           // Limit length
};

/**
 * Sanitize search query
 *
 * USE THIS FOR: Search inputs
 *
 * WHAT IT DOES:
 * - Removes HTML
 * - Escapes special regex characters
 * - Trims whitespace
 *
 * @param query - Search query
 * @returns Safe query string
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/<[^>]*>/g, '')      // Remove HTML
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
    .trim()
    .substring(0, 200);           // Limit length
};

// ============================================
// OBJECT SANITIZATION
// ============================================

/**
 * Sanitize an object's string values
 *
 * USE THIS FOR: Form data objects
 *
 * WHAT IT DOES:
 * - Recursively sanitizes all string values
 * - Preserves numbers, booleans, etc.
 *
 * @param obj - Object to sanitize
 * @param sanitizer - Sanitization function to use
 * @returns Sanitized object
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  sanitizer: (text: string) => string = sanitizePlainText
): T => {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizer(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizer(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, sanitizer);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
};

// ============================================
// SPECIALIZED SANITIZERS
// ============================================

/**
 * Sanitize journal entry
 *
 * USE THIS FOR: Journal entries before saving
 */
export const sanitizeJournalEntry = (entry: {
  title: string;
  content: string;
  tags?: string[];
}) => {
  return {
    title: sanitizePlainText(entry.title),
    content: sanitizeMarkdown(entry.content),
    tags: entry.tags?.map(sanitizePlainText) || [],
  };
};

/**
 * Sanitize expense
 *
 * USE THIS FOR: Expense data before saving
 */
export const sanitizeExpense = (expense: {
  description: string;
  notes?: string;
  tags?: string[];
}) => {
  return {
    description: sanitizePlainText(expense.description),
    notes: expense.notes ? sanitizePlainText(expense.notes) : undefined,
    tags: expense.tags?.map(sanitizePlainText) || [],
  };
};

/**
 * Sanitize flashcard
 *
 * USE THIS FOR: Flashcard content before saving
 */
export const sanitizeFlashcard = (card: {
  front: string;
  back: string;
  hint?: string;
  tags?: string[];
}) => {
  return {
    front: sanitizeHTML(card.front),
    back: sanitizeHTML(card.back),
    hint: card.hint ? sanitizePlainText(card.hint) : undefined,
    tags: card.tags?.map(sanitizePlainText) || [],
  };
};

/**
 * Sanitize task
 *
 * USE THIS FOR: Task data before saving
 */
export const sanitizeTask = (task: {
  title: string;
  description?: string;
  tags?: string[];
}) => {
  return {
    title: sanitizePlainText(task.title),
    description: task.description ? sanitizePlainText(task.description) : undefined,
    tags: task.tags?.map(sanitizePlainText) || [],
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if a string contains potential XSS
 *
 * USE THIS FOR: Quick validation before processing
 *
 * @param text - Text to check
 * @returns true if suspicious content found
 */
export const containsXSS = (text: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick=, onload=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
};

/**
 * Escape HTML entities
 *
 * USE THIS FOR: Displaying user content as plain text
 *
 * @param text - Text to escape
 * @returns Escaped text
 */
export const escapeHTML = (text: string): string => {
  const div = isBrowser ? document.createElement('div') : null;

  if (!div) {
    // Server-side basic escaping
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  div.textContent = text;
  return div.innerHTML;
};

/**
 * Truncate text safely
 *
 * USE THIS FOR: Previews, excerpts
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  const sanitized = sanitizePlainText(text);

  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return sanitized.substring(0, maxLength).trim() + '...';
};

// ============================================
// VALIDATION + SANITIZATION COMBO
// ============================================

/**
 * Validate AND sanitize data
 *
 * USE THIS FOR: Form submissions
 *
 * This is the MAIN function you'll use!
 * It combines Zod validation with sanitization.
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @param sanitizer - Optional sanitization function
 * @returns Validated and sanitized data
 */
export const validateAndSanitize = <T>(
  schema: any,
  data: any,
  sanitizer?: (data: any) => any
): T => {
  // First, sanitize the data
  const sanitizedData = sanitizer ? sanitizer(data) : data;

  // Then, validate with Zod
  const result = schema.parse(sanitizedData);

  return result as T;
};

// ============================================
// EXPORTS
// ============================================

export default {
  sanitizeHTML,
  sanitizePlainText,
  sanitizeMarkdown,
  sanitizeURL,
  sanitizeFilename,
  sanitizeSearchQuery,
  sanitizeObject,
  sanitizeJournalEntry,
  sanitizeExpense,
  sanitizeFlashcard,
  sanitizeTask,
  containsXSS,
  escapeHTML,
  truncateText,
  validateAndSanitize,
};
