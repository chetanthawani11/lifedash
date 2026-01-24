/**
 * CURRENCY UTILS TESTS
 *
 * Tests for the currency formatting utilities.
 * These are "unit tests" - they test individual functions in isolation.
 */

import {
  getCurrencySymbol,
  formatCurrency,
  CURRENCY_SYMBOLS,
} from '@/lib/currency-utils';

// Group related tests together using "describe"
describe('Currency Utils', () => {
  // Tests for getCurrencySymbol function
  describe('getCurrencySymbol', () => {
    // Test case 1: Should return correct symbol for USD
    it('should return $ for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    // Test case 2: Should return correct symbol for EUR
    it('should return € for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    // Test case 3: Should return correct symbol for GBP
    it('should return £ for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    // Test case 4: Should return correct symbol for INR
    it('should return ₹ for INR', () => {
      expect(getCurrencySymbol('INR')).toBe('₹');
    });

    // Test case 5: Should return correct symbol for JPY
    it('should return ¥ for JPY', () => {
      expect(getCurrencySymbol('JPY')).toBe('¥');
    });

    // Test case 6: Should return the currency code itself for unknown currencies
    it('should return currency code for unknown currencies', () => {
      expect(getCurrencySymbol('XYZ')).toBe('XYZ');
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });

    // Test case 7: All defined currencies should have symbols
    it('should have symbols for all defined currencies', () => {
      Object.keys(CURRENCY_SYMBOLS).forEach((currency) => {
        const symbol = getCurrencySymbol(currency);
        expect(symbol).toBeDefined();
        expect(symbol.length).toBeGreaterThan(0);
      });
    });
  });

  // Tests for formatCurrency function
  describe('formatCurrency', () => {
    // Test case 1: Should format USD correctly
    it('should format USD with $ symbol', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
    });

    // Test case 2: Should format EUR correctly
    it('should format EUR with € symbol', () => {
      expect(formatCurrency(50, 'EUR')).toBe('€50.00');
    });

    // Test case 3: Should format INR correctly
    it('should format INR with ₹ symbol', () => {
      expect(formatCurrency(1000, 'INR')).toBe('₹1000.00');
    });

    // Test case 4: Should handle zero amount
    it('should handle zero amount', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    // Test case 5: Should handle negative amounts
    it('should handle negative amounts', () => {
      expect(formatCurrency(-50, 'USD')).toBe('$-50.00');
    });

    // Test case 6: Should handle large amounts
    it('should handle large amounts', () => {
      expect(formatCurrency(1000000, 'USD')).toBe('$1000000.00');
    });

    // Test case 7: Should respect custom decimal places
    it('should respect custom decimal places', () => {
      expect(formatCurrency(100, 'USD', 0)).toBe('$100');
      expect(formatCurrency(100.123, 'USD', 1)).toBe('$100.1');
      expect(formatCurrency(100.789, 'USD', 3)).toBe('$100.789');
    });

    // Test case 8: Should round correctly
    it('should round correctly to specified decimals', () => {
      expect(formatCurrency(99.999, 'USD')).toBe('$100.00');
      expect(formatCurrency(99.994, 'USD')).toBe('$99.99');
    });

    // Test case 9: Should handle unknown currency
    it('should handle unknown currency', () => {
      expect(formatCurrency(100, 'XYZ')).toBe('XYZ100.00');
    });
  });
});
