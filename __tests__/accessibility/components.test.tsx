/**
 * ACCESSIBILITY TESTS
 *
 * These tests check that our components are accessible to everyone.
 * We use jest-axe which runs accessibility checks based on WCAG guidelines.
 *
 * WHAT IS ACCESSIBILITY (a11y)?
 * - Making your app usable by people with disabilities
 * - Screen readers can read your content
 * - Keyboard-only users can navigate
 * - Proper color contrast for visibility
 *
 * WHY IT MATTERS:
 * - It's the right thing to do
 * - Legal requirements in many places
 * - Better for ALL users
 * - Better SEO
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';

// Add the custom matcher to Jest
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);

      // Run accessibility checks
      const results = await axe(container);

      // Should pass all checks
      expect(results).toHaveNoViolations();
    });

    it('should be accessible when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible when loading', async () => {
      const { container } = render(<Button loading>Loading</Button>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with different variants', async () => {
      const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;

      for (const variant of variants) {
        const { container } = render(
          <Button variant={variant}>{variant} button</Button>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Form Accessibility Patterns', () => {
    it('form with proper labels should be accessible', async () => {
      const { container } = render(
        <form>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('form with aria-label should be accessible', async () => {
      const { container } = render(
        <form aria-label="Login form">
          <input type="email" aria-label="Email address" />
          <input type="password" aria-label="Password" />
          <Button type="submit">Login</Button>
        </form>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('clickable elements should be accessible', async () => {
      const { container } = render(
        <div>
          <Button onClick={() => {}}>Click me</Button>
          <a href="/dashboard">Go to Dashboard</a>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('buttons with icons should have accessible names', async () => {
      const { container } = render(
        <Button aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </Button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content Structure', () => {
    it('headings should be in order', async () => {
      const { container } = render(
        <div>
          <h1>Main Title</h1>
          <h2>Section 1</h2>
          <p>Content here</p>
          <h2>Section 2</h2>
          <h3>Subsection</h3>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('lists should be properly structured', async () => {
      const { container } = render(
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </nav>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Images and Media', () => {
    it('images should have alt text', async () => {
      const { container } = render(
        <div>
          <img src="/logo.png" alt="LifeDash logo" />
          <img src="/decorative.png" alt="" role="presentation" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Patterns', () => {
    it('modal dialog pattern should be accessible', async () => {
      const { container } = render(
        <div
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          aria-modal="true"
        >
          <h2 id="modal-title">Confirm Action</h2>
          <p id="modal-description">Are you sure you want to continue?</p>
          <Button>Cancel</Button>
          <Button>Confirm</Button>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('alert pattern should be accessible', async () => {
      const { container } = render(
        <div role="alert" aria-live="polite">
          Your changes have been saved.
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('tabs pattern should be accessible', async () => {
      const { container } = render(
        <div>
          <div role="tablist" aria-label="Settings tabs">
            <button role="tab" aria-selected="true" aria-controls="panel-1">
              General
            </button>
            <button role="tab" aria-selected="false" aria-controls="panel-2">
              Privacy
            </button>
          </div>
          <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
            General settings content
          </div>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
