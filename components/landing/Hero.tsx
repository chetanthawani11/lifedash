'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GradientText, FloatingElement, ParallaxWrapper } from './ui';

export function Hero() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const navbarHeight = 70;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth',
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  const mockupVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.6,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        minHeight: 'max(100vh, 700px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '70px',
      }}
    >
      {/* Animated Gradient Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #fffaf5 0%, #fff0e6 50%, #fde9d4 100%)',
          zIndex: 0,
        }}
        className="hero-bg-light"
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
          zIndex: 0,
        }}
        className="hero-bg-dark"
      />

      {/* Animated Mesh Gradient Overlay */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          zIndex: 1,
        }}
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(242, 100, 25, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(227, 71, 15, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 60%, rgba(242, 100, 25, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(227, 71, 15, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(242, 100, 25, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(227, 71, 15, 0.2) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f26419' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 1,
        }}
      />

      {/* Floating Decorative Elements */}
      <FloatingElement
        amplitude={20}
        duration={6}
        delay={0}
        className="hero-float-1"
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(242, 100, 25, 0.15) 0%, rgba(227, 71, 15, 0.1) 100%)',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      <FloatingElement
        amplitude={15}
        duration={7}
        delay={1}
        className="hero-float-2"
        style={{
          position: 'absolute',
          top: '60%',
          right: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 133, 55, 0.15) 0%, rgba(188, 49, 15, 0.1) 100%)',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      <FloatingElement
        amplitude={25}
        duration={8}
        delay={2}
        className="hero-float-3"
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '30%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(253, 233, 212, 0.3) 0%, rgba(242, 100, 25, 0.1) 100%)',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </FloatingElement>

      {/* Main Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '48px',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            maxWidth: '640px',
          }}
          className="hero-content"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '100px',
                border: '1px solid var(--border-primary)',
                marginBottom: '24px',
              }}
            >
              <Sparkles size={16} style={{ color: '#f59e0b' }} />
              Now with offline support
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}
          >
            Your Life,{' '}
            <GradientText
              colors={['#f26419', '#e3470f', '#f58537', '#f26419']}
              animationDuration={4}
            >
              Beautifully
            </GradientText>{' '}
            Organized
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              maxWidth: '540px',
            }}
          >
            Track journals, expenses, tasks, and goals in one beautifully designed space.
            LifeDash brings clarity to your daily chaos.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="hero-cta-buttons"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '32px',
              justifyContent: 'center',
            }}
          >
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 28px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: 'var(--brand-primary)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(242, 100, 25, 0.3)',
                  transition: 'box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(242, 100, 25, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(242, 100, 25, 0.3)';
                }}
              >
                Start Free Today
                <ArrowRight size={18} />
              </motion.button>
            </Link>

            <motion.a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, '#how-it-works')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 28px',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            >
              See How It Works
            </motion.a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="hero-social-proof"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            {/* Avatar Stack */}
            <div style={{ display: 'flex', marginLeft: '8px' }}>
              {[
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              ].map((gradient, index) => (
                <div
                  key={index}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: gradient,
                    border: '2px solid var(--bg-primary)',
                    marginLeft: index > 0 ? '-10px' : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  {['JD', 'SK', 'MT', 'ER', 'DL'][index]}
                </div>
              ))}
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Join 10,000+ users
              </p>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-tertiary)',
                  margin: 0,
                }}
              >
                organizing their lives
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Mockup */}
        <motion.div
          variants={mockupVariants}
          initial="hidden"
          animate="visible"
          className="hero-mockup"
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ParallaxWrapper speed={-5}>
            <FloatingElement amplitude={8} duration={5}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '600px',
                }}
              >
                {/* Glow Effect Behind Mockup */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    background: 'linear-gradient(135deg, rgba(242, 100, 25, 0.2) 0%, rgba(227, 71, 15, 0.2) 100%)',
                    filter: 'blur(60px)',
                    borderRadius: '20px',
                    zIndex: -1,
                  }}
                />

                {/* Browser Frame */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Browser Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderBottom: '1px solid var(--border-primary)',
                    }}
                  >
                    {/* Traffic Lights */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#ff5f57',
                        }}
                      />
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#ffbd2e',
                        }}
                      />
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#28ca41',
                        }}
                      />
                    </div>
                    {/* URL Bar */}
                    <div
                      style={{
                        flex: 1,
                        marginLeft: '16px',
                        padding: '6px 12px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      lifedash.app/dashboard
                    </div>
                  </div>

                  {/* Screenshot Content Area */}
                  <div
                    style={{
                      aspectRatio: '16 / 10',
                      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    {/* Mock Dashboard Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            width: '140px',
                            height: '20px',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            marginBottom: '8px',
                          }}
                        />
                        <div
                          style={{
                            width: '100px',
                            height: '14px',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            opacity: 0.6,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      />
                    </div>

                    {/* Mock Analytics Cards */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        flex: 1,
                      }}
                    >
                      {[
                        { color: '#667eea', label: 'Journal' },
                        { color: '#10b981', label: 'Expenses' },
                        { color: '#f59e0b', label: 'Tasks' },
                        { color: '#8b5cf6', label: 'Learning' },
                      ].map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: `${card.color}20`,
                              marginBottom: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                backgroundColor: card.color,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              width: '60%',
                              height: '10px',
                              backgroundColor: 'var(--bg-tertiary)',
                              borderRadius: '3px',
                              marginBottom: '6px',
                            }}
                          />
                          <div
                            style={{
                              width: '40%',
                              height: '18px',
                              backgroundColor: 'var(--bg-tertiary)',
                              borderRadius: '4px',
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating UI Elements */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-30px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  className="floating-card-1"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#10b98120',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      fontSize: '1rem',
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                      Task Completed
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      +15 streak!
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  style={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '-40px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  className="floating-card-2"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#8b5cf620',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8b5cf6',
                      fontSize: '1rem',
                    }}
                  >
                    📚
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                      Cards Mastered
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      1,247 today
                    </p>
                  </div>
                </motion.div>
              </div>
            </FloatingElement>
          </ParallaxWrapper>
        </motion.div>
      </div>

      {/* Responsive Styles */}
      <style jsx global>{`
        /* Light/Dark mode backgrounds */
        @media (prefers-color-scheme: light) {
          .hero-bg-light { display: block; }
          .hero-bg-dark { display: none; }
        }
        @media (prefers-color-scheme: dark) {
          .hero-bg-light { display: none; }
          .hero-bg-dark { display: block; }
        }

        /* Desktop layout */
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1.1fr 1fr !important;
            gap: 64px !important;
            padding: 0 48px !important;
          }
          .hero-content {
            max-width: 640px !important;
          }
        }

        /* Tablet */
        @media (max-width: 1023px) and (min-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            text-align: center !important;
          }
          .hero-content {
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-mockup {
            max-width: 500px !important;
            margin: 0 auto !important;
          }
          .floating-card-1,
          .floating-card-2 {
            display: none !important;
          }
        }

        /* Mobile */
        @media (max-width: 767px) {
          #hero {
            min-height: auto !important;
            padding-top: 80px !important;
            padding-bottom: 48px !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center !important;
            padding: 0 16px !important;
          }
          .hero-content {
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-content h1 {
            font-size: 2rem !important;
          }
          .hero-content p {
            font-size: 1rem !important;
          }
          .hero-mockup {
            max-width: 100% !important;
            padding: 0 !important;
            display: none !important;
          }
          .floating-card-1,
          .floating-card-2 {
            display: none !important;
          }
          .hero-float-1,
          .hero-float-2,
          .hero-float-3 {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
