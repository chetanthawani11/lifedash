'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { BookOpen, Wallet, CheckSquare, Brain } from 'lucide-react';
import { FloatingElement } from './ui';

interface Stat {
  id: string;
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const stats: Stat[] = [
  {
    id: 'journals',
    value: 50000,
    suffix: '+',
    label: 'Journal Entries Created',
    icon: BookOpen,
    color: '#667eea',
  },
  {
    id: 'expenses',
    value: 2,
    prefix: '$',
    suffix: 'M+',
    label: 'Expenses Tracked',
    icon: Wallet,
    color: '#10b981',
  },
  {
    id: 'tasks',
    value: 100000,
    suffix: '+',
    label: 'Tasks Completed',
    icon: CheckSquare,
    color: '#f59e0b',
  },
  {
    id: 'flashcards',
    value: 1,
    suffix: 'M+',
    label: 'Flashcards Studied',
    icon: Brain,
    color: '#8b5cf6',
  },
];

function StatCard({
  stat,
  index,
  inView,
}: {
  stat: Stat;
  index: number;
  inView: boolean;
}) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: 0.2 + index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
      style={{
        textAlign: 'center',
        padding: '24px',
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.3 + index * 0.1,
        }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: `${stat.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Icon size={28} style={{ color: stat.color }} />
      </motion.div>

      {/* Number */}
      <div
        style={{
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {stat.prefix}
        {inView ? (
          <CountUp
            start={0}
            end={stat.value}
            duration={2.5}
            separator=","
            delay={0.3 + index * 0.15}
            useEasing={true}
            easingFn={(t, b, c, d) => {
              // ease-out-cubic
              t /= d;
              t--;
              return c * (t * t * t + 1) + b;
            }}
          />
        ) : (
          '0'
        )}
        {stat.suffix}
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          fontWeight: 500,
        }}
      >
        {stat.label}
      </p>
    </motion.div>
  );
}

export function Statistics() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
        }}
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Decorative Elements */}
      {/* Top left dots */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          opacity: 0.2,
        }}
      >
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          />
        ))}
      </div>

      {/* Bottom right dots */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          opacity: 0.2,
        }}
      >
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          />
        ))}
      </div>

      {/* Floating circles */}
      <FloatingElement
        amplitude={15}
        duration={6}
        delay={0}
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      <FloatingElement
        amplitude={20}
        duration={8}
        delay={2}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      {/* Diagonal Lines */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          transform: 'rotate(-45deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '150px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          transform: 'rotate(-45deg)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '64px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '100px',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Trusted by Thousands
          </span>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}
          >
            Numbers That Speak
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Join our growing community of productive people
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
          className="stats-grid"
        >
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} inView={inView} />
          ))}
        </div>

        {/* Bottom Accent Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
          style={{
            width: '120px',
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #8b5cf6 50%, #f59e0b 100%)',
            borderRadius: '2px',
            margin: '48px auto 0',
          }}
        />
      </div>

      {/* Styles */}
      <style jsx global>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .stats-grid > div {
            padding: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
