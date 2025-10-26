'use client';

// Beautiful Custom Select/Dropdown Component
// Modern, animated, and accessible

import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={label ? "mb-4" : ""} ref={containerRef}>
      {label && (
        <label className="block mb-2" style={{
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Selected Value Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full text-left transition-all"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: error
              ? '2px solid var(--error)'
              : isOpen
              ? '2px solid var(--primary-400)'
              : '1.5px solid var(--border-light)',
            backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
            color: selectedOption ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontSize: 'var(--text-base)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-base)',
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: selectedOption ? '500' : '400' }}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className="transition-transform"
              style={{
                width: '1.25rem',
                height: '1.25rem',
                color: 'var(--text-tertiary)',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform var(--transition-base)',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute w-full mt-2 overflow-hidden animate-in"
            style={{
              zIndex: 50,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1.5px solid var(--border-light)',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '16rem',
              overflowY: 'auto',
              animation: 'slideDown 0.2s ease-out',
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full text-left transition-colors"
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: 'var(--text-base)',
                  color: option.value === value ? 'var(--primary-600)' : 'var(--text-primary)',
                  backgroundColor:
                    option.value === value
                      ? 'var(--primary-50)'
                      : 'transparent',
                  fontWeight: option.value === value ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                  {option.value === value && (
                    <svg
                      className="ml-auto"
                      style={{ width: '1rem', height: '1rem', color: 'var(--primary-600)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 flex items-center gap-1" style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--error)',
        }}>
          <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-0.5rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
