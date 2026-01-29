'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
  delay?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  rotateAmount?: number;
}

/**
 * FloatingElement - Wrapper that makes children float/bob gently
 *
 * @param amplitude - How far the element moves in pixels (default: 10)
 * @param duration - Duration of one float cycle in seconds (default: 3)
 * @param delay - Delay before animation starts (default: 0)
 * @param direction - Direction of float: 'vertical', 'horizontal', or 'both' (default: 'vertical')
 * @param rotateAmount - Optional subtle rotation in degrees (default: 0)
 */
export function FloatingElement({
  children,
  amplitude = 10,
  duration = 3,
  className = '',
  delay = 0,
  direction = 'vertical',
  rotateAmount = 0,
}: FloatingElementProps) {
  const getAnimateProps = () => {
    const baseAnimation: Record<string, number[]> = {};

    if (direction === 'vertical' || direction === 'both') {
      baseAnimation.y = [0, -amplitude, 0];
    }

    if (direction === 'horizontal' || direction === 'both') {
      baseAnimation.x = [0, amplitude / 2, 0, -amplitude / 2, 0];
    }

    if (rotateAmount > 0) {
      baseAnimation.rotate = [0, rotateAmount, 0, -rotateAmount, 0];
    }

    return baseAnimation;
  };

  return (
    <motion.div
      className={className}
      animate={getAnimateProps()}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
