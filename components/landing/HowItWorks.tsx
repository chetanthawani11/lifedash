'use client';

import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Sparkles, LayoutDashboard, Target } from 'lucide-react';
import { ScrollReveal } from './ui';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Sign Up in Seconds',
    description: 'Create your free account with just an email. No credit card required, no complex setup.',
    icon: Sparkles,
  },
  {
    number: 2,
    title: 'Customize Your Dashboard',
    description: 'Choose which modules matter to you. Mix and match to create your perfect workspace.',
    icon: LayoutDashboard,
  },
  {
    number: 3,
    title: 'Achieve Your Goals',
    description: 'Track progress, build habits, and watch as small daily actions compound into results.',
    icon: Target,
  },
];

function StepCard({
  step,
  index,
  inView,
}: {
  step: Step;
  index: number;
  inView: boolean;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: 0.6 + index * 0.2, // Start after line animation
        ease: [0.33, 1, 0.68, 1],
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Number Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.7 + index * 0.2,
        }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          position: 'relative',
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            border: '2px solid rgba(102, 126, 234, 0.2)',
          }}
        />
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'white',
          }}
        >
          {step.number}
        </span>
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 + index * 0.2 }}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon size={28} style={{ color: 'var(--brand-primary)' }} />
      </motion.div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '1rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          maxWidth: '280px',
          margin: 0,
        }}
      >
        {step.description}
      </p>
    </motion.div>
  );
}

function ConnectingLine({ inView }: { inView: boolean }) {
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({
        pathLength: 1,
        transition: { duration: 1, ease: 'easeOut' },
      });
    }
  }, [inView, controls]);

  return (
    <>
      {/* Desktop Line (Horizontal) */}
      <svg
        className="connecting-line-desktop"
        style={{
          position: 'absolute',
          top: '28px', // Align with center of number badges
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '4px',
          zIndex: 1,
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#764ba2" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        {/* Background line */}
        <line
          x1="0"
          y1="2"
          x2="100%"
          y2="2"
          stroke="var(--border-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Animated line */}
        <motion.line
          x1="0"
          y1="2"
          x2="100%"
          y2="2"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={controls}
          style={{ filter: 'drop-shadow(0 0 6px rgba(102, 126, 234, 0.5))' }}
        />
      </svg>

      {/* Mobile Line (Vertical) */}
      <svg
        className="connecting-line-mobile"
        style={{
          position: 'absolute',
          left: '50%',
          top: '80px',
          transform: 'translateX(-50%)',
          width: '4px',
          height: 'calc(100% - 160px)',
          zIndex: 1,
          display: 'none',
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#764ba2" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        {/* Background line */}
        <line
          x1="2"
          y1="0"
          x2="2"
          y2="100%"
          stroke="var(--border-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Animated line */}
        <motion.line
          x1="2"
          y1="0"
          x2="2"
          y2="100%"
          stroke="url(#lineGradientVertical)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={controls}
          style={{ filter: 'drop-shadow(0 0 6px rgba(102, 126, 234, 0.5))' }}
        />
      </svg>

      <style jsx global>{`
        /* Hide connecting lines on tablet and mobile */
        @media (max-width: 1024px) {
          .connecting-line-desktop,
          .connecting-line-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

export function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        backgroundColor: 'var(--bg-secondary)',
        overflow: 'hidden',
      }}
    >
      {/* Background Decoration */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div
            style={{
              textAlign: 'center',
              marginBottom: '80px',
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--brand-primary)',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                borderRadius: '100px',
                marginBottom: '16px',
              }}
            >
              How It Works
            </motion.span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              Get Started in Minutes
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'var(--text-secondary)',
                maxWidth: '500px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Three simple steps to transform your productivity
            </p>
          </div>
        </ScrollReveal>

        {/* Steps Container */}
        <div
          style={{
            position: 'relative',
          }}
        >
          {/* Connecting Line */}
          <ConnectingLine inView={inView} />

          {/* Steps Grid */}
          <div
            className="steps-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} inView={inView} />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4, duration: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '64px',
          }}
        >
          <motion.a
            href="/auth"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
            }}
          >
            Start Your Journey
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.a>
        </motion.div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
          #how-it-works {
            padding: 80px 24px !important;
          }
        }

        @media (max-width: 640px) {
          .steps-grid {
            gap: 40px !important;
          }
          #how-it-works {
            padding: 60px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
