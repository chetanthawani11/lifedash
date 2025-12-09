// Central export file for all LifeDash types
// Import from this file in your components/services

// Re-export auth types (already exists)
export * from './auth';

// Re-export journal types
export * from './journal';

// Re-export expense types
export * from './expense';

// Re-export flashcard types
export * from './flashcard';

// Re-export note types
export * from './note';

// Re-export task types
export * from './task';

/**
 * Common API Response Types
 * Used for consistent API responses across the app
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Common Filter/Sort Types
 */

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface FilterOptions {
  search?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Date Range Presets
 * Used for analytics/filtering
 */
export type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Helper function to get date range from preset
 */
export const getDateRangeFromPreset = (preset: DateRangePreset): DateRange | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yesterday,
        to: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case 'last7days':
      return {
        from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: now,
      };

    case 'last30days':
      return {
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: now,
      };

    case 'thisMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: now,
      };

    case 'lastMonth':
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
      const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59, 999);
      return {
        from: lastMonthStart,
        to: lastMonthEnd,
      };

    case 'thisYear':
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: now,
      };

    case 'custom':
      return null; // User will provide custom dates

    default:
      return null;
  }
};
