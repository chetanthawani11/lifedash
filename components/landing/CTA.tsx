'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { FloatingElement } from './ui';

export function CTA() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const trustPoints = [
    'No credit card required',
    'Free forever',
    '2-minute setup',
  ];

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '140px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Animated Gradient Background */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Overlay for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.5,
        }}
      />

      {/* Floating Decorative Elements */}
      <FloatingElement
        amplitude={25}
        duration={7}
        delay={0}
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      <FloatingElement
        amplitude={20}
        duration={8}
        delay={1}
        style={{
          position: 'absolute',
          top: '60%',
          right: '8%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      <FloatingElement
        amplitude={15}
        duration={6}
        delay={2}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      <FloatingElement
        amplitude={18}
        duration={9}
        delay={0.5}
        style={{
          position: 'absolute',
          top: '25%',
          right: '20%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: '20px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.2)',
          }}
        >
          Ready to Take Control?
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            lineHeight: 1.6,
          }}
        >
          Join thousands who&apos;ve transformed their daily routines.
          <br />
          Your future self will thank you.
        </motion.p>

        {/* CTA Button with Glow Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          style={{ marginBottom: '32px' }}
        >
          <Link href="/auth" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '20px 40px',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#4c1d95',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
                transition: 'box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.25)';
              }}
            >
              {/* Animated Glow Ring */}
              <motion.span
                style={{
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: '17px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(255,255,255,0.5) 100%)',
                  opacity: 0.5,
                  zIndex: -1,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              Start Your Free Account
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px 24px',
          }}
        >
          {trustPoints.map((point, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={12} color="white" strokeWidth={3} />
              </div>
              <span
                style={{
                  fontSize: '0.95rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                }}
              >
                {point}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Wave/Curve (optional decorative element) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--bg-primary)',
          clipPath: 'ellipse(60% 100% at 50% 100%)',
        }}
      />

      {/* Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .cta-floating-icon {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
