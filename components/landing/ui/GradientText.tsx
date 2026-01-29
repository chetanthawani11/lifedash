'use client';

import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';

interface GradientTextProps {
  children: ReactNode;
  colors?: string[];
  className?: string;
  animate?: boolean;
  animationDuration?: number;
}

/**
 * GradientText - Applies an animated gradient to text
 *
 * @param colors - Array of colors for the gradient (default: brand gradient)
 * @param animate - Whether to animate the gradient position (default: true)
 * @param animationDuration - Duration of one animation cycle in seconds (default: 3)
 */
export function GradientText({
  children,
  colors = ['#667eea', '#764ba2', '#f093fb', '#667eea'],
  className = '',
  animate = true,
  animationDuration = 3,
}: GradientTextProps) {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: animate ? '200% 100%' : '100% 100%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block',
  };

  if (!animate) {
    return (
      <span className={className} style={gradientStyle}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      style={gradientStyle}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}
