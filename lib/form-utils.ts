/**
 * FORM VALIDATION UTILITIES
 *
 * This file makes form validation SUPER EASY in your React components.
 * It integrates Zod schemas with React Hook Form.
 *
 * WHY DO WE NEED THIS?
 * Without these utilities:
 * - You'd write 50+ lines of validation code for each form
 * - Error messages would be inconsistent
 * - You'd have to manually format errors
 *
 * With these utilities:
 * - One function call validates entire forms
 * - Error messages are automatic and user-friendly
 * - Consistent across the entire app
 */

import { z, ZodError } from 'zod';

// ============================================
// ERROR FORMATTING
// ============================================

/**
 * Formatted validation error
 * User-friendly error messages
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Form validation result
 * Either success with data, or failure with errors
 */
export type ValidationResult<T> =
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: ValidationError[] };

/**
 * Format Zod errors to user-friendly messages
 *
 * WHAT THIS DOES:
 * Zod errors are complex objects. This converts them to simple messages.
 *
 * Example Zod error:
 * {
 *   "issues": [
 *     { "path": ["email"], "message": "Invalid email" }
 *   ]
 * }
 *
 * After formatting:
 * [
 *   { "field": "email", "message": "Invalid email" }
 * ]
 *
 * @param error - Zod error object
 * @returns Array of formatted errors
 */
export const formatZodErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

/**
 * Get first error message for a field
 *
 * USE THIS FOR: Displaying error under an input field
 *
 * @param errors - Array of validation errors
 * @param field - Field name
 * @returns Error message or undefined
 */
export const getFieldError = (
  errors: ValidationError[] | null,
  field: string
): string | undefined => {
  if (!errors) return undefined;
  const error = errors.find(e => e.field === field);
  return error?.message;
};

/**
 * Check if field has errors
 *
 * USE THIS FOR: Adding error styling to inputs
 *
 * @param errors - Array of validation errors
 * @param field - Field name
 * @returns true if field has errors
 */
export const hasFieldError = (
  errors: ValidationError[] | null,
  field: string
): boolean => {
  return !!getFieldError(errors, field);
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate data with Zod schema
 *
 * THIS IS THE MAIN FUNCTION YOU'LL USE!
 *
 * USE THIS FOR: Form submissions, API requests
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        data: null,
        errors: formatZodErrors(error),
      };
    }
    // Unknown error
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

/**
 * Validate data safely (returns partial data even on error)
 *
 * USE THIS FOR: Forms where you want to show what's valid
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validation result with partial data
 */
export const validateDataSafely = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: Partial<T>; errors: ValidationError[] | null } => {
  try {
    const validatedData = schema.parse(data);
    return {
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: data as Partial<T>,
        errors: formatZodErrors(error),
      };
    }
    return {
      data: data as Partial<T>,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

/**
 * Validate single field
 *
 * USE THIS FOR: Real-time validation as user types
 *
 * @param schema - Zod schema
 * @param fieldName - Name of field
 * @param value - Field value
 * @returns Error message or null
 */
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  fieldName: keyof T,
  value: any
): string | null => {
  try {
    // Create a partial schema for just this field
    const fieldSchema = (schema as any).shape?.[fieldName];
    if (!fieldSchema) return null;

    fieldSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues[0]?.message || 'Invalid value';
    }
    return 'Invalid value';
  }
};

// ============================================
// FORM STATE MANAGEMENT
// ============================================

/**
 * Form state interface
 * Tracks form data, errors, and loading state
 */
export interface FormState<T> {
  data: Partial<T>;
  errors: ValidationError[] | null;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Create initial form state
 *
 * USE THIS FOR: Setting up forms
 *
 * @param initialData - Initial form values
 * @returns Initial form state
 */
export const createFormState = <T>(
  initialData: Partial<T> = {}
): FormState<T> => {
  return {
    data: initialData,
    errors: null,
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  };
};

// ============================================
// COMMON VALIDATION HELPERS
// ============================================

/**
 * Check if email is valid (quick check)
 *
 * @param email - Email to check
 * @returns true if valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if password is strong
 *
 * @param password - Password to check
 * @returns Object with strength info
 */
export const checkPasswordStrength = (password: string): {
  isStrong: boolean;
  score: number; // 0-4
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Uppercase
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Lowercase
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Numbers
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  // Special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  return {
    isStrong: score >= 3,
    score: Math.min(score, 4),
    feedback,
  };
};

/**
 * Validate file size
 *
 * USE THIS FOR: File uploads
 *
 * @param file - File object
 * @param maxSizeMB - Maximum size in megabytes
 * @returns Error message or null
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number = 5
): string | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
};

/**
 * Validate file type
 *
 * USE THIS FOR: File uploads
 *
 * @param file - File object
 * @param allowedTypes - Allowed MIME types
 * @returns Error message or null
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

// ============================================
// ERROR MESSAGE TEMPLATES
// ============================================

/**
 * Standard error messages
 * Consistent wording across the app
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_DATE: 'Please enter a valid date',
  TOO_LONG: (max: number) => `Maximum ${max} characters allowed`,
  TOO_SHORT: (min: number) => `Minimum ${min} characters required`,
  OUT_OF_RANGE: (min: number, max: number) =>
    `Value must be between ${min} and ${max}`,
  FILE_TOO_LARGE: (maxMB: number) => `File size must be less than ${maxMB}MB`,
  INVALID_FILE_TYPE: 'Invalid file type',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
} as const;

// ============================================
// ASYNC VALIDATION
// ============================================

/**
 * Async validation result
 */
export type AsyncValidationResult =
  | { isValid: true; error: null }
  | { isValid: false; error: string };

/**
 * Create debounced validator
 *
 * USE THIS FOR: Checking if username/email exists (without spamming server)
 *
 * @param validatorFn - Async validation function
 * @param delayMs - Delay in milliseconds
 * @returns Debounced validator
 */
export const createDebouncedValidator = (
  validatorFn: (value: string) => Promise<AsyncValidationResult>,
  delayMs: number = 500
) => {
  let timeoutId: NodeJS.Timeout;

  return (value: string): Promise<AsyncValidationResult> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await validatorFn(value);
        resolve(result);
      }, delayMs);
    });
  };
};

// ============================================
// EXPORTS
// ============================================

export default {
  validateData,
  validateDataSafely,
  validateField,
  formatZodErrors,
  getFieldError,
  hasFieldError,
  createFormState,
  isValidEmail,
  checkPasswordStrength,
  validateFileSize,
  validateFileType,
  ERROR_MESSAGES,
  createDebouncedValidator,
};
