'use client';

import { useState, useEffect } from 'react';

/**
 * useReducedMotion - Detects user's reduced motion preference
 *
 * Returns true if the user prefers reduced motion (accessibility setting).
 * Use this to disable or simplify animations for users who are sensitive
 * to motion, have vestibular disorders, or simply prefer less animation.
 *
 * @returns {boolean} Whether reduced motion is preferred
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * const animationDuration = prefersReducedMotion ? 0 : 0.6;
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * getMotionProps - Returns animation props based on reduced motion preference
 *
 * @param reducedMotion - Whether reduced motion is preferred
 * @param normalProps - Props to use when motion is allowed
 * @param reducedProps - Props to use when motion should be reduced (optional)
 */
export function getMotionProps<T extends object>(
  reducedMotion: boolean,
  normalProps: T,
  reducedProps?: Partial<T>
): T {
  if (reducedMotion) {
    return {
      ...normalProps,
      ...reducedProps,
      // Override common animation props
      transition: { duration: 0 },
      animate: undefined,
      whileHover: undefined,
      whileTap: undefined,
    } as T;
  }
  return normalProps;
}
