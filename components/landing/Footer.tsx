'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: 'rgba(255, 255, 255, 0.7)',
      }}
    >
      {/* Desktop Footer */}
      <div className="footer-desktop">
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 24px 24px',
          }}
        >
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '32px',
            }}
          >
            {/* Brand */}
            <div style={{ maxWidth: '280px' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  marginBottom: '12px',
                }}
              >
                <AppIcon size={28} color="#f26419" />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                  LifeDash
                </span>
              </Link>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                Your personal dashboard for life management.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Features', 'How It Works', 'Pricing'].map((link) => (
                    <a key={link} href="#" style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none' }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Company
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['About', 'Privacy', 'Terms'].map((link) => (
                    <a key={link} href="#" style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none' }}>
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Social */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>
              © {currentYear} LifeDash. All rights reserved.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.3)', margin: 0 }}>
              Made with <span style={{ color: '#ef4444' }}>♥</span>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Simplified */}
      <div className="footer-mobile">
        <div style={{ padding: '32px 20px 24px', textAlign: 'center' }}>
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <AppIcon size={24} color="#f26419" />
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>
              LifeDash
            </span>
          </Link>

          {/* Social Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textDecoration: 'none',
                }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>
            © {currentYear} LifeDash
          </p>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .footer-desktop {
          display: block;
        }
        .footer-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .footer-desktop {
            display: none !important;
          }
          .footer-mobile {
            display: block !important;
          }
        }
      `}</style>
    </footer>
  );
}
