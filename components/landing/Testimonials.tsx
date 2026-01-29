'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';
import { ScrollReveal } from './ui';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: {
    initials: string;
    gradient: string;
  };
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah K.',
    role: 'Product Designer',
    quote: 'LifeDash replaced 5 different apps for me. Everything I need is finally in one place.',
    avatar: {
      initials: 'SK',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    rating: 5,
  },
  {
    id: '2',
    name: 'Marcus T.',
    role: 'Freelance Developer',
    quote: 'The journaling feature alone is worth it. But having my expenses and tasks alongside? Game changer.',
    avatar: {
      initials: 'MT',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
    rating: 5,
  },
  {
    id: '3',
    name: 'Emily R.',
    role: 'Graduate Student',
    quote: "I've tried every productivity app out there. LifeDash is the first one that actually stuck.",
    avatar: {
      initials: 'ER',
      gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    },
    rating: 5,
  },
  {
    id: '4',
    name: 'David L.',
    role: 'Startup Founder',
    quote: 'Clean, fast, and actually useful. The goal tracking keeps me accountable every day.',
    avatar: {
      initials: 'DL',
      gradient: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
    },
    rating: 5,
  },
  {
    id: '5',
    name: 'Priya M.',
    role: 'Content Creator',
    quote: 'The offline mode is incredible. I journal on flights and everything syncs when I land.',
    avatar: {
      initials: 'PM',
      gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
    },
    rating: 5,
  },
  {
    id: '6',
    name: 'James W.',
    role: 'Financial Analyst',
    quote: "Finally, expense tracking that doesn't feel like a chore. The analytics are beautiful.",
    avatar: {
      initials: 'JW',
      gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    },
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? '#f59e0b' : 'transparent'}
          color={i < rating ? '#f59e0b' : 'var(--border-secondary)'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
  inView,
}: {
  testimonial: Testimonial;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      style={{
        position: 'relative',
        padding: '28px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '20px',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        cursor: 'default',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'var(--border-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = 'var(--border-primary)';
      }}
    >
      {/* Decorative Quote Mark */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          opacity: 0.08,
        }}
      >
        <Quote size={48} strokeWidth={1} />
      </div>

      {/* Star Rating */}
      <div style={{ marginBottom: '16px' }}>
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Quote Text */}
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* User Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: testimonial.avatar.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {testimonial.avatar.initials}
        </div>

        {/* Name & Role */}
        <div>
          <p
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: '2px',
            }}
          >
            {testimonial.name}
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              margin: 0,
            }}
          >
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Bottom Gradient Accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: testimonial.avatar.gradient,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
        className="card-accent"
      />

      <style jsx>{`
        div:hover .card-accent {
          opacity: 1 !important;
        }
      `}</style>
    </motion.div>
  );
}

export function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        backgroundColor: 'var(--bg-secondary)',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorations */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242, 100, 25, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
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
                backgroundColor: 'rgba(242, 100, 25, 0.1)',
                borderRadius: '100px',
                marginBottom: '16px',
              }}
            >
              Testimonials
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
              Loved by Thousands
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
              See what our users have to say about their experience
            </p>
          </div>
        </ScrollReveal>

        {/* Testimonials Grid */}
        <div
          className="testimonials-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* Trust Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill="#f59e0b"
                  color="#f59e0b"
                />
              ))}
            </div>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              4.9/5
            </span>
          </div>
          <span
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-tertiary)',
            }}
          >
            from 2,000+ reviews
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '100px',
              border: '1px solid var(--border-primary)',
            }}
          >
            <span style={{ fontSize: '1rem' }}>🏆</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              #1 on Product Hunt
            </span>
          </div>
        </motion.div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 1024px) {
          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .testimonials-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
