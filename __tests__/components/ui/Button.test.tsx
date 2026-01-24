/**
 * BUTTON COMPONENT TESTS
 *
 * Tests for the Button UI component.
 * We test rendering, interactions, and different variants.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  // Test 1: Basic rendering
  describe('rendering', () => {
    it('should render children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render as a button element', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(<Button className="custom-class">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  // Test 2: Loading state
  describe('loading state', () => {
    it('should show "Loading..." text when loading', () => {
      render(<Button loading>Click me</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show spinner when loading', () => {
      render(<Button loading>Click me</Button>);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // Test 3: Disabled state
  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Test 4: Click handling
  describe('click handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Test 5: Variants
  describe('variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      // Primary variant has primary background color
      expect(button).toHaveStyle({
        backgroundColor: 'var(--primary-500)',
      });
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        backgroundColor: 'var(--neutral-200)',
      });
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      // Ghost variant should exist and be clickable
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Ghost');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        backgroundColor: '#ef4444',
      });
    });
  });

  // Test 6: Sizes
  describe('sizes', () => {
    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        fontSize: 'var(--text-sm)',
      });
    });

    it('should render medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        fontSize: 'var(--text-base)',
      });
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        fontSize: 'var(--text-lg)',
      });
    });
  });

  // Test 7: Full width
  describe('fullWidth', () => {
    it('should have width: auto by default', () => {
      render(<Button>Normal</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        width: 'auto',
      });
    });

    it('should have width: 100% when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        width: '100%',
      });
    });
  });

  // Test 8: Custom styles
  describe('custom styles', () => {
    it('should accept and apply custom styles', () => {
      render(
        <Button style={{ marginTop: '10px' }}>Styled</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        marginTop: '10px',
      });
    });

    it('should allow style overrides', () => {
      render(
        <Button style={{ marginLeft: '20px' }}>Override</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        marginLeft: '20px',
      });
    });
  });

  // Test 9: HTML attributes
  describe('HTML attributes', () => {
    it('should pass through type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should pass through aria attributes', () => {
      render(<Button aria-label="Close">X</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close');
    });

    it('should pass through data attributes', () => {
      render(<Button data-testid="my-button">Test</Button>);
      const button = screen.getByTestId('my-button');
      expect(button).toBeInTheDocument();
    });
  });
});
