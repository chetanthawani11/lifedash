'use client';

import { Parallax } from 'react-scroll-parallax';
import { ReactNode } from 'react';

interface ParallaxWrapperProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  easing?: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'easeInQuad' | 'easeOutQuad';
  opacity?: [number, number];
  scale?: [number, number];
  rotate?: [number, number];
  disabled?: boolean;
}

/**
 * ParallaxWrapper - Adds parallax scrolling effect to children
 *
 * Note: Must be used within a ParallaxProvider (already set up in landing layout)
 *
 * @param speed - Parallax speed (-50 to 50, negative = opposite direction) (default: -10)
 * @param easing - Easing function for the parallax effect (default: 'easeOutQuad')
 * @param opacity - Opacity range as [start, end] (optional)
 * @param scale - Scale range as [start, end] (optional)
 * @param rotate - Rotation range in degrees as [start, end] (optional)
 * @param disabled - Disable parallax effect (useful for reduced motion) (default: false)
 */
export function ParallaxWrapper({
  children,
  speed = -10,
  className = '',
  easing = 'easeOutQuad',
  opacity,
  scale,
  rotate,
  disabled = false,
}: ParallaxWrapperProps) {
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Parallax
      speed={speed}
      easing={easing}
      opacity={opacity}
      scale={scale}
      rotate={rotate}
      className={className}
    >
      {children}
    </Parallax>
  );
}
