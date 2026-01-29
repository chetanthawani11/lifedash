'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, ArrowRight, BookOpen, Wallet, CheckSquare, Brain } from 'lucide-react';
import { ParallaxWrapper, FloatingElement } from './ui';

interface FeatureSection {
  id: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  glowColor: string;
  reversed: boolean;
}

const featureSections: FeatureSection[] = [
  {
    id: 'journaling',
    badge: 'Journaling',
    title: 'Capture Every Thought, Build Every Habit',
    description:
      'Transform fleeting ideas into lasting insights. Our distraction-free journal helps you reflect, grow, and track your writing journey with beautiful simplicity.',
    features: [
      'Distraction-free writing environment',
      'Track your writing streak and stay motivated',
      'Rich insights into your journaling patterns',
      'Markdown support for formatting',
    ],
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glowColor: 'rgba(102, 126, 234, 0.3)',
    reversed: false,
  },
  {
    id: 'expenses',
    badge: 'Expense Tracking',
    title: 'Know Where Every Dollar Goes',
    description:
      'Beautiful expense tracking that makes budgeting feel effortless. Smart categories, multi-currency support, and insightful analytics help you take control of your finances.',
    features: [
      'Smart categorization with custom categories',
      'Multi-currency support (USD, EUR, GBP, INR & more)',
      'Monthly analytics and spending trends',
      'Daily averages and budget insights',
    ],
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    glowColor: 'rgba(17, 153, 142, 0.3)',
    reversed: true,
  },
  {
    id: 'tasks',
    badge: 'Task Management',
    title: 'Conquer Your To-Do List',
    description:
      'From simple tasks to complex projects, manage everything with priorities, due dates, recurring schedules, and subtasks. Watch your productivity soar.',
    features: [
      'Priority levels from low to urgent',
      'Recurring tasks (daily, weekly, monthly)',
      'Subtasks for complex projects',
      'Track estimated vs actual time',
    ],
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    glowColor: 'rgba(238, 9, 121, 0.3)',
    reversed: false,
  },
  {
    id: 'flashcards',
    badge: 'Learning',
    title: 'Learn Smarter, Not Harder',
    description:
      'Master any subject with our spaced repetition system. Organize decks, track progress, and build lasting knowledge that sticks.',
    features: [
      'Spaced repetition for optimal retention',
      'Organize with decks and folders',
      'Track cards reviewed and mastered',
      'Study streak tracking',
    ],
    gradient: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
    glowColor: 'rgba(127, 0, 255, 0.3)',
    reversed: true,
  },
];

// Mock UI Components for each feature
function JournalMockup({ gradient, glowColor }: { gradient: string; glowColor: string }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Main Editor */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 60px -15px ${glowColor}`,
          overflow: 'hidden',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Morning Reflections
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                January 29, 2025
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '100px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            🔥 7 day streak
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '85%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '92%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '16px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ width: '78%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '95%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '60%', height: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Footer Stats */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            gap: '24px',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            247 words
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Auto-saved
          </span>
        </div>
      </div>

      {/* Floating Stats Card */}
      <FloatingElement amplitude={6} duration={4} delay={0.5}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            position: 'absolute',
            top: '15%',
            right: '-20px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-primary)',
          }}
          className="floating-detail-card"
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            This Month
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            12 entries
          </div>
        </motion.div>
      </FloatingElement>
    </div>
  );
}

function ExpenseMockup({ gradient, glowColor }: { gradient: string; glowColor: string }) {
  const categories = [
    { name: 'Food', amount: '$342', percent: 35, color: '#10b981' },
    { name: 'Transport', amount: '$156', percent: 16, color: '#3b82f6' },
    { name: 'Shopping', amount: '$289', percent: 30, color: '#f59e0b' },
    { name: 'Bills', amount: '$185', percent: 19, color: '#8b5cf6' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 60px -15px ${glowColor}`,
          overflow: 'hidden',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              Total Spending
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              $972.00
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={22} color="white" />
          </div>
        </div>

        {/* Chart Area */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              height: '120px',
              gap: '8px',
              alignItems: 'flex-end',
              marginBottom: '20px',
            }}
          >
            {[45, 72, 58, 85, 62, 78, 90].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: '6px',
                  background: i === 6 ? gradient : 'var(--border-secondary)',
                }}
              />
            ))}
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((cat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '3px',
                    backgroundColor: cat.color,
                  }}
                />
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {cat.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Currency Card */}
      <FloatingElement amplitude={5} duration={3.5} delay={0.3}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '-25px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="floating-detail-card"
        >
          <span style={{ fontSize: '1.25rem' }}>💱</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Multi-currency</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              USD, EUR, GBP...
            </div>
          </div>
        </motion.div>
      </FloatingElement>
    </div>
  );
}

function TasksMockup({ gradient, glowColor }: { gradient: string; glowColor: string }) {
  const tasks = [
    { title: 'Review project proposal', priority: 'High', done: true },
    { title: 'Team standup meeting', priority: 'Medium', done: true },
    { title: 'Update documentation', priority: 'Low', done: false },
    { title: 'Deploy new features', priority: 'Urgent', done: false },
  ];

  const priorityColors: Record<string, string> = {
    Urgent: '#ef4444',
    High: '#f59e0b',
    Medium: '#3b82f6',
    Low: '#10b981',
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 60px -15px ${glowColor}`,
          overflow: 'hidden',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={18} color="white" />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Today&apos;s Tasks
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            2/4 done
          </span>
        </div>

        {/* Tasks */}
        <div style={{ padding: '12px' }}>
          {tasks.map((task, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: task.done ? 'none' : '2px solid var(--border-secondary)',
                  backgroundColor: task.done ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {task.done && <Check size={12} color="white" strokeWidth={3} />}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: '0.9rem',
                  color: task.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  textDecoration: task.done ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </span>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: `${priorityColors[task.priority]}20`,
                  color: priorityColors[task.priority],
                }}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Recurring Card */}
      <FloatingElement amplitude={6} duration={4} delay={0.4}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '-15px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-primary)',
          }}
          className="floating-detail-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>🔄</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Recurring</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Daily, Weekly...
              </div>
            </div>
          </div>
        </motion.div>
      </FloatingElement>
    </div>
  );
}

function FlashcardsMockup({ gradient, glowColor }: { gradient: string; glowColor: string }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 60px -15px ${glowColor}`,
          overflow: 'hidden',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Brain size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Spanish Vocabulary
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Card 15 of 50
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '100px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            📚 30% mastered
          </div>
        </div>

        {/* Flashcard */}
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '48px 32px',
              border: '2px solid var(--border-primary)',
              marginBottom: '24px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              What is the Spanish word for &quot;beautiful&quot;?
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '16px',
              }}
            >
              Hermoso / Hermosa
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}
            >
              &quot;Qué día tan hermoso&quot; - What a beautiful day
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {['Again', 'Hard', 'Good', 'Easy'].map((label, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: i === 2 ? gradient : 'var(--bg-tertiary)',
                  color: i === 2 ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Progress Card */}
      <FloatingElement amplitude={5} duration={3.5} delay={0.3}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '-25px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '14px 18px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-primary)',
          }}
          className="floating-detail-card"
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
            Study Streak
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              14
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>days 🔥</span>
          </div>
        </motion.div>
      </FloatingElement>
    </div>
  );
}

function FeatureDeepSection({ feature, index }: { feature: FeatureSection; index: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const MockupComponent = {
    journaling: JournalMockup,
    expenses: ExpenseMockup,
    tasks: TasksMockup,
    flashcards: FlashcardsMockup,
  }[feature.id] as React.FC<{ gradient: string; glowColor: string }>;

  const contentVariants = {
    hidden: { opacity: 0, x: feature.reversed ? 50 : -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: feature.reversed ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.2, ease: [0.33, 1, 0.68, 1] },
    },
  };

  return (
    <section
      ref={ref}
      style={{
        padding: '120px 24px',
        backgroundColor: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '64px',
          alignItems: 'center',
        }}
        className="feature-deep-grid"
      >
        {/* Content */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ order: feature.reversed ? 2 : 1 }}
          className={feature.reversed ? 'feature-deep-content-reversed' : 'feature-deep-content'}
        >
          {/* Badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'white',
              background: feature.gradient,
              borderRadius: '100px',
              marginBottom: '20px',
            }}
          >
            {feature.badge}
          </span>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '20px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {feature.title}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: '28px',
              maxWidth: '500px',
            }}
          >
            {feature.description}
          </p>

          {/* Feature List */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0' }}>
            {feature.features.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Check size={14} color="white" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Learn More Link */}
          <a
            href="/auth"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              background: feature.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
              transition: 'gap 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.gap = '12px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.gap = '8px';
            }}
          >
            Get started free
            <ArrowRight size={18} style={{ color: feature.glowColor.replace('0.3', '1') }} />
          </a>
        </motion.div>

        {/* Mockup */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ order: feature.reversed ? 1 : 2 }}
          className={feature.reversed ? 'feature-deep-image-reversed' : 'feature-deep-image'}
        >
          <ParallaxWrapper speed={-5}>
            <MockupComponent gradient={feature.gradient} glowColor={feature.glowColor} />
          </ParallaxWrapper>
        </motion.div>
      </div>

      {/* Responsive Styles */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .feature-deep-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .feature-deep-content {
            order: 1 !important;
            padding-right: 32px;
          }
          .feature-deep-content-reversed {
            order: 2 !important;
            padding-left: 32px;
          }
          .feature-deep-image {
            order: 2 !important;
          }
          .feature-deep-image-reversed {
            order: 1 !important;
          }
        }

        @media (max-width: 1023px) {
          .feature-deep-content,
          .feature-deep-content-reversed {
            order: 1 !important;
            text-align: center;
          }
          .feature-deep-content ul,
          .feature-deep-content-reversed ul {
            display: inline-block;
            text-align: left;
          }
          .feature-deep-image,
          .feature-deep-image-reversed {
            order: 2 !important;
            max-width: 500px;
            margin: 0 auto;
          }
          .floating-detail-card {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          section {
            padding: 80px 16px !important;
          }
        }
      `}</style>
    </section>
  );
}

export function FeatureDeep() {
  return (
    <>
      {featureSections.map((feature, index) => (
        <FeatureDeepSection key={feature.id} feature={feature} index={index} />
      ))}
    </>
  );
}
