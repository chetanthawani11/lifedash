'use client';

/**
 * DASHBOARD WIDGET WRAPPER
 *
 * A reusable wrapper component for all dashboard widgets.
 * Features:
 * - Consistent styling and layout
 * - Drag handle for reordering
 * - Size indicator
 * - Loading and error states
 */

import { ReactNode } from 'react';
import { WidgetConfig, WidgetSize, getWidgetMetadata } from '@/types';

interface DashboardWidgetProps {
  config: WidgetConfig;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: () => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

// Get grid column span based on size
const getSizeStyles = (size: WidgetSize): React.CSSProperties => {
  switch (size) {
    case 'small':
      return { gridColumn: 'span 1' };
    case 'medium':
      return { gridColumn: 'span 2' };
    case 'large':
      return { gridColumn: 'span 3' };
    case 'full':
      return { gridColumn: '1 / -1' };
    default:
      return { gridColumn: 'span 2' };
  }
};

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  config,
  children,
  isLoading = false,
  error = null,
  isDragging = false,
  dragHandleProps = {},
}) => {
  const metadata = getWidgetMetadata(config.type);

  return (
    <div
      style={{
        ...getSizeStyles(config.size),
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-base)',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        opacity: isDragging ? 0.9 : 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: config.size === 'small' ? '200px' : '250px',
      }}
    >
      {/* Widget Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            style={{
              cursor: 'grab',
              padding: '0.25rem',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Drag to reorder"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="9" cy="5" r="2" />
              <circle cx="15" cy="5" r="2" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="15" cy="12" r="2" />
              <circle cx="9" cy="19" r="2" />
              <circle cx="15" cy="19" r="2" />
            </svg>
          </div>

          {/* Widget Icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: `${metadata?.color || 'var(--primary-500)'}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WidgetIcon type={config.type} color={metadata?.color} />
          </div>

          {/* Widget Title */}
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {config.title}
          </h3>
        </div>

        {/* Size Indicator */}
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {config.size}
        </span>
      </div>

      {/* Widget Content */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem',
          overflow: 'auto',
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border-light)',
                borderTopColor: metadata?.color || 'var(--primary-500)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        ) : error ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--error)',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-sm)' }}>
              {error}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Widget Icon Component
const WidgetIcon: React.FC<{ type: string; color?: string }> = ({
  type,
  color = 'currentColor',
}) => {
  const iconProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'journals':
      return (
        <svg {...iconProps}>
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'expenses':
      return (
        <svg {...iconProps}>
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'flashcards':
      return (
        <svg {...iconProps}>
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...iconProps}>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'quick-actions':
      return (
        <svg {...iconProps}>
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'recent-activity':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'stats-overview':
      return (
        <svg {...iconProps}>
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
      );
  }
};

export default DashboardWidget;
