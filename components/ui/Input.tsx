// Beautiful Input Component
// Modern, clean, with smooth animations

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="mb-4">
        {label && (
          <label
            className="block mb-2"
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
            fontSize: 'var(--text-base)',
            outline: 'none',
            boxShadow: isFocused ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-base)',
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
