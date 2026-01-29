'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from './ui';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Is LifeDash really free?',
    answer:
      'Yes! LifeDash offers a generous free tier with all core features including journaling, expense tracking, task management, flashcards, notes, and goal tracking. We believe everyone deserves great productivity tools. Premium features may be added in the future, but the core experience will always remain free.',
  },
  {
    id: '2',
    question: 'Does it work offline?',
    answer:
      'Absolutely. LifeDash is a Progressive Web App (PWA) that works completely offline. All your data is stored locally and syncs automatically when you\'re back online. You can journal on a flight, track expenses in the subway, or study flashcards anywhere—no internet required.',
  },
  {
    id: '3',
    question: 'Can I access LifeDash on my phone?',
    answer:
      'Yes! LifeDash works beautifully on any device—desktop, tablet, or phone. You can install it on your phone\'s home screen for an app-like experience. Just visit the site on your mobile browser and tap "Add to Home Screen" to get instant access with a native app feel.',
  },
  {
    id: '4',
    question: 'Is my data secure?',
    answer:
      'Your privacy is our top priority. All data is encrypted in transit and at rest using industry-standard encryption. We use Firebase\'s enterprise-grade security infrastructure. We never sell, share, or access your personal information. Your journals, expenses, and personal data belong to you alone.',
  },
  {
    id: '5',
    question: 'Can I export my data?',
    answer:
      'You own your data, always. You can export all your information anytime in standard formats (JSON, CSV). Whether it\'s journal entries, expense records, tasks, or flashcards—everything can be downloaded and used however you like. No vendor lock-in, no data hostage situations.',
  },
  {
    id: '6',
    question: 'How do I get started?',
    answer:
      'Getting started takes less than 30 seconds! Simply click "Get Started," create an account with your email, and you\'re in. No credit card required, no lengthy onboarding. Choose which modules you want to use, and start tracking your life immediately. It\'s that simple.',
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
  inView,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: 0.1 + index * 0.08,
        ease: [0.33, 1, 0.68, 1],
      }}
      style={{
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* Question Button */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '24px 0',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
      >
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: isOpen ? 'var(--brand-primary)' : 'var(--text-primary)',
            transition: 'color 0.2s ease',
            lineHeight: 1.4,
          }}
        >
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: isOpen ? 'rgba(242, 100, 25, 0.1)' : 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
        >
          <ChevronDown
            size={18}
            style={{
              color: isOpen ? 'var(--brand-primary)' : 'var(--text-secondary)',
              transition: 'color 0.2s ease',
            }}
          />
        </motion.div>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
              opacity: { duration: 0.2, delay: isOpen ? 0.1 : 0 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                paddingBottom: '24px',
                margin: 0,
              }}
            >
              {item.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>('1'); // First item open by default
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        backgroundColor: 'var(--bg-primary)',
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
          background: 'radial-gradient(circle, rgba(242, 100, 25, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div
            style={{
              textAlign: 'center',
              marginBottom: '56px',
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
              FAQ
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
              Frequently Asked Questions
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
              Everything you need to know about LifeDash
            </p>
          </div>
        </ScrollReveal>

        {/* FAQ Accordion */}
        <div
          className="faq-accordion"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '20px',
            border: '1px solid var(--border-primary)',
            padding: '8px 32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {faqItems.map((item, index) => (
            <div key={item.id} className="faq-item">
              <FAQAccordionItem
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
                index={index}
                inView={inView}
              />
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '48px',
            padding: '32px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border-primary)',
          }}
        >
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}
          >
            Still have questions? We&apos;re here to help.
          </p>
          <a
            href="mailto:support@lifedash.app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--brand-primary)',
              backgroundColor: 'rgba(242, 100, 25, 0.1)',
              border: '1px solid rgba(242, 100, 25, 0.2)',
              borderRadius: '10px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(242, 100, 25, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(242, 100, 25, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(242, 100, 25, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(242, 100, 25, 0.2)';
            }}
          >
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
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact Support
          </a>
        </motion.div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        @media (max-width: 640px) {
          #faq {
            padding: 80px 16px !important;
          }
          .faq-accordion {
            padding: 8px 20px !important;
          }
          /* Show only first 4 FAQ items on mobile */
          .faq-item:nth-child(n+5) {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
