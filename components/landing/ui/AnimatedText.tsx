'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedTextProps {
  text: string;
  type?: 'chars' | 'words';
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  staggerDelay?: number;
}

/**
 * AnimatedText - Reveals text character by character or word by word
 *
 * @param text - The text to animate
 * @param type - Animation type: 'chars' for character-by-character, 'words' for word-by-word
 * @param delay - Initial delay before animation starts (default: 0)
 * @param staggerDelay - Delay between each character/word (default: 0.03 for chars, 0.08 for words)
 * @param as - HTML element to render as (default: 'p')
 */
export function AnimatedText({
  text,
  type = 'words',
  delay = 0,
  className = '',
  as: Component = 'p',
  staggerDelay,
}: AnimatedTextProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const defaultStagger = type === 'chars' ? 0.03 : 0.08;
  const stagger = staggerDelay ?? defaultStagger;

  const items = type === 'chars' ? text.split('') : text.split(' ');

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  // Use motion component with dynamic element
  const MotionComponent = motion[Component] as typeof motion.p;

  return (
    <MotionComponent
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
      aria-label={text}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {item}
          {type === 'words' && index < items.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
