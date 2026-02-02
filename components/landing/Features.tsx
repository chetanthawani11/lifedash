'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  BookOpen,
  Wallet,
  CheckSquare,
  Brain,
  FileText,
  Target,
} from 'lucide-react';
import { ScrollReveal, FloatingElement } from './ui';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  size: 'large' | 'medium';
}

const features: Feature[] = [
  {
    id: 'journal',
    title: 'Journaling',
    description:
      'Capture thoughts, track moods, and build a writing habit. Watch your streak grow as you reflect daily.',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glowColor: 'rgba(102, 126, 234, 0.4)',
    size: 'large',
  },
  {
    id: 'expenses',
    title: 'Expense Tracking',
    description:
      'Know where every dollar goes. Smart categories, multi-currency support, and beautiful analytics.',
    icon: Wallet,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    glowColor: 'rgba(17, 153, 142, 0.4)',
    size: 'large',
  },
  {
    id: 'tasks',
    title: 'Task Management',
    description:
      'From quick todos to complex projects with subtasks and recurring schedules.',
    icon: CheckSquare,
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    glowColor: 'rgba(238, 9, 121, 0.4)',
    size: 'medium',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description:
      'Master any subject with spaced repetition and track your learning streaks.',
    icon: Brain,
    gradient: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
    glowColor: 'rgba(127, 0, 255, 0.4)',
    size: 'medium',
  },
  {
    id: 'notes',
    title: 'Notes',
    description:
      'Organize ideas in folders, pin what matters, and find anything instantly.',
    icon: FileText,
    gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
    glowColor: 'rgba(252, 74, 26, 0.4)',
    size: 'medium',
  },
  {
    id: 'goals',
    title: 'Goal Tracking',
    description:
      'Set meaningful goals, track progress, and celebrate milestones along the way.',
    icon: Target,
    gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    glowColor: 'rgba(0, 198, 255, 0.4)',
    size: 'medium',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={`feature-card feature-card-${feature.size}`}
      style={{
        position: 'relative',
        padding: feature.size === 'large' ? '32px' : '24px',
        borderRadius: '20px',
        backgroundColor: 'var(--glass-bg, rgba(255, 255, 255, 0.7))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.2))',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 40px -10px ${feature.glowColor}, 0 0 0 1px ${feature.glowColor}`;
        e.currentTarget.style.borderColor = feature.glowColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--glass-border, rgba(255, 255, 255, 0.2))';
      }}
    >
      {/* Background Gradient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: feature.gradient,
          opacity: 0.05,
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <FloatingElement amplitude={3} duration={3} delay={index * 0.2}>
          <div
            style={{
              width: feature.size === 'large' ? '56px' : '48px',
              height: feature.size === 'large' ? '56px' : '48px',
              borderRadius: '14px',
              background: feature.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: feature.size === 'large' ? '20px' : '16px',
              boxShadow: `0 8px 20px -4px ${feature.glowColor}`,
            }}
          >
            <Icon
              size={feature.size === 'large' ? 28 : 24}
              color="white"
              strokeWidth={2}
            />
          </div>
        </FloatingElement>

        {/* Title */}
        <h3
          style={{
            fontSize: feature.size === 'large' ? '1.5rem' : '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: feature.size === 'large' ? '1rem' : '0.925rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          {feature.description}
        </p>

        {/* Mini Visual for Large Cards */}
        {feature.size === 'large' && (
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border-primary)',
            }}
          >
            {feature.id === 'journal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    7 day streak 🔥
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: i < 5 ? '#667eea' : 'var(--bg-tertiary)',
                        opacity: i < 5 ? 0.2 + i * 0.15 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {feature.id === 'expenses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    This month
                  </span>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    $2,450
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    height: '32px',
                    alignItems: 'flex-end',
                  }}
                >
                  {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${height}%`,
                        borderRadius: '4px',
                        background: feature.gradient,
                        opacity: 0.6 + i * 0.05,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      id="features"
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorations */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.06) 0%, rgba(15, 118, 110, 0.03) 100%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.06) 0%, rgba(204, 251, 241, 0.08) 100%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div
            style={{
              textAlign: 'center',
              marginBottom: '64px',
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
              Features
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
              Everything You Need
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
              Six powerful tools, one beautiful dashboard
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        /* Glass morphism variables */
        :root {
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.3);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --glass-bg: rgba(30, 30, 40, 0.7);
            --glass-border: rgba(255, 255, 255, 0.1);
          }
        }

        /* Bento Grid Layout */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: auto auto;
          gap: 20px;
        }

        /* Large cards span 2 columns */
        .feature-card-large:nth-of-type(1) {
          grid-column: span 2;
        }
        .feature-card-large:nth-of-type(2) {
          grid-column: span 2;
        }

        /* Medium cards span 1 column each */
        .feature-card-medium {
          grid-column: span 1;
        }

        /* Tablet Layout */
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .feature-card-large {
            grid-column: span 2 !important;
          }
          .feature-card-medium {
            grid-column: span 1 !important;
          }
        }

        /* Mobile Layout */
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .feature-card-large,
          .feature-card-medium {
            grid-column: span 1 !important;
          }
          #features {
            padding: 80px 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
