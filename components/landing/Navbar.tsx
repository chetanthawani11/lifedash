'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Background change after 50px
      setIsScrolled(currentScrollY > 50);

      // Hide on scroll down, show on scroll up (only after 100px)
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
          setIsVisible(false);
          setIsMobileMenuOpen(false);
        } else if (lastScrollY - currentScrollY > 5) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '72px',
          backgroundColor: isScrolled ? 'var(--bg-elevated)' : 'transparent',
          borderBottom: isScrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
          transition: 'background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <a
            href="#top"
            onClick={(e) => scrollToSection(e, '#top')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <AppIcon size={32} color="var(--brand-primary)" />
            <span
              style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              LifeDash
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="nav-cta-desktop">
            <Link
              href="/auth"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'white',
                backgroundColor: 'var(--brand-primary)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-brand)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-brand-lg)';
                e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-brand)';
                e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="nav-menu-mobile"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              padding: 0,
              backgroundColor: isMobileMenuOpen ? 'var(--bg-secondary)' : 'transparent',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s ease',
            }}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                top: '72px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 998,
              }}
              className="nav-mobile-backdrop"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
              className="nav-mobile-menu"
              style={{
                position: 'fixed',
                top: '72px',
                left: 0,
                right: 0,
                zIndex: 999,
                backgroundColor: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-primary)',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      padding: '16px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      textAlign: 'center',
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  style={{ marginTop: '8px' }}
                >
                  <Link
                    href="/auth"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'white',
                      backgroundColor: 'var(--brand-primary)',
                      borderRadius: 'var(--radius-lg)',
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-brand)',
                      minHeight: '52px',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Responsive Styles */}
      <style jsx global>{`
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-cta-desktop {
          display: block;
        }

        .nav-menu-mobile {
          display: none !important;
        }

        .nav-mobile-menu,
        .nav-mobile-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }

          .nav-cta-desktop {
            display: none !important;
          }

          .nav-menu-mobile {
            display: flex !important;
          }

          .nav-mobile-menu,
          .nav-mobile-backdrop {
            display: block;
          }

          .navbar {
            height: 64px !important;
          }
        }
      `}</style>
    </>
  );
}
