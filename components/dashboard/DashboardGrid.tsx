'use client';

/**
 * DASHBOARD GRID
 *
 * Main dashboard grid layout with drag-and-drop widget reordering.
 * Features:
 * - Responsive grid layout
 * - Drag-and-drop widget reordering
 * - Widget size management
 * - Real-time persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getDashboardLayout,
  saveDashboardLayout,
  reorderWidgets,
  subscribeToDashboardLayout,
} from '@/lib/dashboard-service';
import { DashboardWidget } from './DashboardWidget';
import {
  JournalsWidget,
  ExpensesWidget,
  FlashcardsWidget,
  TasksWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  StatsOverviewWidget,
} from './widgets';
import { WidgetConfig, DashboardLayout, getVisibleWidgets } from '@/types';

interface DashboardGridProps {
  onCustomize?: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ onCustomize }) => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates
    const unsubscribe = subscribeToDashboardLayout(
      user.uid,
      (newLayout) => {
        setLayout(newLayout);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading dashboard:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);

    // Add a slight delay to show the dragging state
    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.style.opacity = '0.5';
    }, 0);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const element = e.target as HTMLElement;
    element.style.opacity = '1';
    setDraggedWidget(null);
    setDragOverWidget(null);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverWidget(widgetId);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverWidget(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    const sourceWidgetId = e.dataTransfer.getData('text/plain');

    if (!user || !layout || sourceWidgetId === targetWidgetId) {
      setDraggedWidget(null);
      setDragOverWidget(null);
      return;
    }

    // Calculate new order
    const widgets = getVisibleWidgets(layout.widgets);
    const sourceIndex = widgets.findIndex(w => w.id === sourceWidgetId);
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Create new order array
    const newWidgetIds = widgets.map(w => w.id);
    newWidgetIds.splice(sourceIndex, 1);
    newWidgetIds.splice(targetIndex, 0, sourceWidgetId);

    try {
      await reorderWidgets(user.uid, newWidgetIds);
    } catch (error) {
      console.error('Error reordering widgets:', error);
    }

    setDraggedWidget(null);
    setDragOverWidget(null);
  }, [user, layout]);

  // Render widget content based on type
  const renderWidgetContent = (config: WidgetConfig) => {
    switch (config.type) {
      case 'journals':
        return <JournalsWidget size={config.size} />;
      case 'expenses':
        return <ExpensesWidget size={config.size} />;
      case 'flashcards':
        return <FlashcardsWidget size={config.size} />;
      case 'tasks':
        return <TasksWidget size={config.size} />;
      case 'quick-actions':
        return <QuickActionsWidget size={config.size} />;
      case 'recent-activity':
        return <RecentActivityWidget size={config.size} />;
      case 'stats-overview':
        return <StatsOverviewWidget size={config.size} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--border-light)',
              borderTopColor: 'var(--primary-500)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-tertiary)' }}>Loading dashboard...</p>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <p style={{ color: 'var(--text-tertiary)' }}>Failed to load dashboard</p>
      </div>
    );
  }

  const visibleWidgets = getVisibleWidgets(layout.widgets);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dashboard Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              margin: '0.25rem 0 0',
            }}
          >
            Welcome back! Here&apos;s your overview.
          </p>
        </div>

        {onCustomize && (
          <button
            onClick={onCustomize}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              transition: 'all var(--transition-fast)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Customize
          </button>
        )}
      </div>

      {/* Widget Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
        }}
      >
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, widget.id)}
            style={{
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              transform: dragOverWidget === widget.id && draggedWidget !== widget.id
                ? 'scale(1.02)'
                : 'scale(1)',
              outline: dragOverWidget === widget.id && draggedWidget !== widget.id
                ? '2px dashed var(--primary-400)'
                : 'none',
              outlineOffset: '4px',
              borderRadius: 'var(--radius-2xl)',
            }}
          >
            <DashboardWidget
              config={widget}
              isDragging={draggedWidget === widget.id}
              dragHandleProps={{
                onMouseDown: (e: React.MouseEvent) => {
                  // Allow the parent's drag to work
                },
              }}
            >
              {renderWidgetContent(widget)}
            </DashboardWidget>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-2xl)',
            textAlign: 'center',
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginTop: '1rem',
            }}
          >
            No widgets visible
          </h3>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              marginTop: '0.5rem',
            }}
          >
            Click &quot;Customize&quot; to add widgets to your dashboard.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
