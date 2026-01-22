/**
 * INPUT COMPONENT (Mobile Optimized)
 *
 * Modern, clean input with smooth animations and mobile optimizations.
 * Features:
 * - Proper focus states
 * - Error and helper text support
 * - Mobile-friendly: 16px font prevents iOS zoom
 * - Touch-friendly height (44px minimum)
 * - Proper input modes for mobile keyboards
 *
 * Mobile Optimizations:
 * - Font size of 16px prevents auto-zoom on iOS
 * - Minimum height of 44px for easy tapping
 * - Uses inputMode for optimal mobile keyboards
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    // Determine the appropriate inputMode based on type
    // This shows the correct keyboard on mobile devices
    const getInputMode = (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
      switch (type) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        case 'number':
          return 'numeric';
        case 'search':
          return 'search';
        default:
          return 'text';
      }
    };

    return (
      <div>
        {label && (
          <label
            className="block mb-1.5"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--text-secondary)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          inputMode={props.inputMode || getInputMode()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full transition-all ${className}`}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: error
              ? '2px solid var(--error)'
              : isFocused
              ? '2px solid var(--primary-400)'
              : '1.5px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            // IMPORTANT: 16px font prevents iOS from zooming in on focus
            fontSize: '16px',
            // Touch-friendly minimum height
            minHeight: '44px',
            outline: 'none',
            boxShadow: isFocused ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-base)',
            // Ensure text is readable
            lineHeight: '1.5',
          }}
          {...props}
        />
        {error && (
          <p
            className="mt-1.5 flex items-center gap-1"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--error)',
            }}
          >
            <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className="mt-1.5"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              lineHeight: '1.6',
              paddingLeft: '0.25rem',
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
