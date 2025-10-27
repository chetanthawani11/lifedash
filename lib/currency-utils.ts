// Currency utilities for displaying amounts with proper symbols

// Currency symbol mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
};

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol (e.g., '$', '€')
 */
export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

/**
 * Format amount with currency symbol
 * @param amount - Amount in dollars/base currency unit
 * @param currency - Currency code
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., '$123.45')
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  decimals: number = 2
): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(decimals)}`;
};
