'use client';

/**
 * DASHBOARD CUSTOMIZER
 *
 * Modal/panel for customizing dashboard widgets.
 * Features:
 * - Toggle widget visibility
 * - Change widget sizes
 * - Reset to default layout
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getDashboardLayout,
  updateWidgetConfig,
  toggleWidgetVisibility,
  resetDashboardLayout,
  subscribeToDashboardLayout,
} from '@/lib/dashboard-service';
import {
  DashboardLayout,
  WidgetConfig,
  WidgetSize,
  WIDGET_METADATA,
  getWidgetMetadata,
} from '@/types';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = subscribeToDashboardLayout(
      user.uid,
      (newLayout) => {
        setLayout(newLayout);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading layout:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleToggleVisibility = async (widgetId: string) => {
    if (!user) return;
    setSaving(true);
    try {
      await toggleWidgetVisibility(user.uid, widgetId);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
    setSaving(false);
  };

  const handleSizeChange = async (widgetId: string, newSize: WidgetSize) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateWidgetConfig(user.uid, widgetId, { size: newSize });
    } catch (error) {
      console.error('Error changing size:', error);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to reset your dashboard to the default layout?')) {
      return;
    }
    setResetting(true);
    try {
      await resetDashboardLayout(user.uid);
    } catch (error) {
      console.error('Error resetting layout:', error);
    }
    setResetting(false);
  };

  if (!isOpen) return null;

  const sizeOptions: { value: WidgetSize; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'full', label: 'Full Width' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Customize Dashboard
            </h2>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                margin: '0.25rem 0 0',
              }}
            >
              Toggle widgets and change their sizes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '1.5rem',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
              }}
            >
              <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {layout?.widgets.map((widget) => {
                const metadata = getWidgetMetadata(widget.type);
                return (
                  <div
                    key={widget.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: widget.isVisible
                        ? 'var(--bg-secondary)'
                        : 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-lg)',
                      opacity: widget.isVisible ? 1 : 0.6,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {/* Widget Icon */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${metadata?.color || 'var(--primary-500)'}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <WidgetIcon type={widget.type} color={metadata?.color} />
                    </div>

                    {/* Widget Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {widget.title}
                      </h4>
                      <p
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          margin: '0.125rem 0 0',
                        }}
                      >
                        {metadata?.description}
                      </p>
                    </div>

                    {/* Size Selector */}
                    {widget.isVisible && (
                      <select
                        value={widget.size}
                        onChange={(e) => handleSizeChange(widget.id, e.target.value as WidgetSize)}
                        disabled={saving}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {sizeOptions
                          .filter((opt) => {
                            if (!metadata) return true;
                            const sizeOrder: Record<WidgetSize, number> = {
                              small: 0,
                              medium: 1,
                              large: 2,
                              full: 3,
                            };
                            return (
                              sizeOrder[opt.value] >= sizeOrder[metadata.minSize] &&
                              sizeOrder[opt.value] <= sizeOrder[metadata.maxSize]
                            );
                          })
                          .map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    )}

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleVisibility(widget.id)}
                      disabled={saving}
                      style={{
                        width: '48px',
                        height: '28px',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        backgroundColor: widget.isVisible
                          ? 'var(--primary-500)'
                          : 'var(--border-default)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all var(--transition-fast)',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: widget.isVisible ? '23px' : '3px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'left var(--transition-fast)',
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={handleReset}
            disabled={resetting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--error)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              opacity: resetting ? 0.5 : 1,
            }}
          >
            {resetting ? 'Resetting...' : 'Reset to Default'}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'var(--primary-500)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: 'white',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Widget Icon Component (same as in DashboardWidget)
const WidgetIcon: React.FC<{ type: string; color?: string }> = ({
  type,
  color = 'currentColor',
}) => {
  const iconProps = {
    width: 20,
    height: 20,
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

export default DashboardCustomizer;
