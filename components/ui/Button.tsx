// Beautiful Button Component
// Modern, clean, with smooth animations and loading states

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizes = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: 'var(--text-sm)',
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: 'var(--text-base)',
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: 'var(--text-lg)',
    },
  };

  const getVariantStyles = () => {
    const base = {
      borderRadius: 'var(--radius-lg)',
      fontWeight: '600',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? '0.6' : '1',
      transition: 'all var(--transition-base)',
      border: 'none',
      outline: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      ...sizes[size],
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: 'var(--primary-500)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: 'var(--neutral-200)',
          color: 'var(--text-primary)',
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: 'var(--error)',
          color: '#ffffff',
        };
      default:
        return base;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    switch (variant) {
      case 'primary':
        e.currentTarget.style.backgroundColor = 'var(--primary-600)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        break;
      case 'secondary':
        e.currentTarget.style.backgroundColor = 'var(--neutral-300)';
        break;
      case 'ghost':
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        break;
      case 'danger':
        e.currentTarget.style.backgroundColor = '#dc2626';
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    switch (variant) {
      case 'primary':
        e.currentTarget.style.backgroundColor = 'var(--primary-500)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        break;
      case 'secondary':
        e.currentTarget.style.backgroundColor = 'var(--neutral-200)';
        break;
      case 'ghost':
        e.currentTarget.style.backgroundColor = 'transparent';
        break;
      case 'danger':
        e.currentTarget.style.backgroundColor = 'var(--error)';
        break;
    }
  };

  return (
    <button
      style={{
        ...getVariantStyles(),
        width: fullWidth ? '100%' : 'auto',
      }}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin"
            style={{ width: '1.25rem', height: '1.25rem' }}
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
