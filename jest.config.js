/**
 * JEST CONFIGURATION
 *
 * This file tells Jest how to run tests in our Next.js project.
 * Jest is a testing framework that helps us verify our code works correctly.
 */

const nextJest = require('next/jest');

// Create a Jest config that knows about Next.js
const createJestConfig = nextJest({
  // Path to your Next.js app - this loads next.config.js and .env files
  dir: './',
});

// Custom Jest configuration
const customJestConfig = {
  // Where to look for test files
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',  // Files in __tests__ folders
    '**/?(*.)+(spec|test).[jt]s?(x)', // Files ending in .test.ts or .spec.ts
  ],

  // Use jsdom to simulate a browser environment
  testEnvironment: 'jest-environment-jsdom',

  // Run this file before each test to set up testing utilities
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // How to handle different file types
  moduleNameMapper: {
    // Handle CSS imports (mock them since we don't need actual styles in tests)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Handle path aliases (the @ symbol in imports)
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Don't test these folders
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Collect code coverage information
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],

  // Show coverage report in these formats
  coverageReporters: ['text', 'lcov', 'html'],

  // Minimum coverage thresholds (optional - you can adjust these)
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50,
  //   },
  // },
};

// Export the config
module.exports = createJestConfig(customJestConfig);
