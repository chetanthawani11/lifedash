'use client';

/**
 * SELECT/DROPDOWN COMPONENT (Mobile Optimized)
 *
 * Modern, animated, and accessible dropdown.
 * Features:
 * - Text truncation for long labels (prevents layout shift)
 * - Touch-friendly 44px minimum height
 * - Smooth open/close animations
 * - Keyboard accessible
 * - Click outside to close
 *
 * Mobile Optimizations:
 * - Fixed height prevents layout jumping
 * - Text truncates with ellipsis (...)
 * - 16px font prevents iOS zoom
 */

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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.375rem',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          color: 'var(--text-secondary)',
        }}>
          {label}
        </label>
      )}

      {/* Selected Value Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          textAlign: 'left',
          // Fixed height prevents layout shift
          height: '44px',
          padding: '0 1rem',
          borderRadius: 'var(--radius-lg)',
          border: error
            ? '2px solid var(--error)'
            : isOpen
            ? '2px solid var(--primary-400)'
            : '1.5px solid var(--border-light)',
          backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-tertiary)',
          // 16px font prevents iOS zoom
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
          transition: 'all var(--transition-base)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          height: '100%',
        }}>
          {/* Selected text with icon - truncates if too long */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            minWidth: 0, // Important: allows flex child to shrink below content size
            overflow: 'hidden',
          }}>
            {selectedOption?.icon && (
              <span style={{ flexShrink: 0 }}>{selectedOption.icon}</span>
            )}
            <span style={{
              fontWeight: selectedOption ? '500' : '400',
              // Text truncation
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          {/* Dropdown arrow */}
          <svg
            style={{
              width: '1.25rem',
              height: '1.25rem',
              color: 'var(--text-tertiary)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-base)',
              flexShrink: 0,
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
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.5rem',
            zIndex: 50,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1.5px solid var(--border-light)',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '240px',
            overflowY: 'auto',
            animation: 'selectSlideDown 0.2s ease-out',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                fontSize: '16px',
                color: option.value === value ? 'var(--primary-600)' : 'var(--text-primary)',
                backgroundColor: option.value === value ? 'var(--primary-50)' : 'transparent',
                fontWeight: option.value === value ? '600' : '400',
                cursor: 'pointer',
                border: 'none',
                transition: 'all var(--transition-fast)',
                // Touch-friendly minimum height
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1,
                minWidth: 0,
              }}>
                {option.icon && <span style={{ flexShrink: 0 }}>{option.icon}</span>}
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {option.label}
                </span>
                {option.value === value && (
                  <svg
                    style={{
                      width: '1rem',
                      height: '1rem',
                      color: 'var(--primary-600)',
                      marginLeft: 'auto',
                      flexShrink: 0,
                    }}
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

      {/* Error Message */}
      {error && (
        <p style={{
          marginTop: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
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
        @keyframes selectSlideDown {
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
