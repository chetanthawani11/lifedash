'use client';

import { ParallaxProvider } from 'react-scroll-parallax';
import '@/styles/landing.css';

/**
 * Landing Page Layout
 *
 * This layout is specific to the landing page route group.
 * It provides:
 * - ParallaxProvider for scroll-based animations
 * - Landing-specific CSS imports
 * - Clean layout without dashboard navigation
 *
 * The (landing) route group means:
 * - This layout applies to all pages in this folder
 * - The folder name doesn't affect the URL (still "/" for page.tsx)
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ParallaxProvider>
      <div className="landing-page">
        {children}
      </div>
    </ParallaxProvider>
  );
}
