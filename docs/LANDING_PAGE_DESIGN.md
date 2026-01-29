# LifeDash Landing Page - World-Class Design Documentation

> A comprehensive guide to building a stunning, professional landing page that converts visitors into users.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Tech Stack & Libraries](#tech-stack--libraries)
3. [Page Structure & Sections](#page-structure--sections)
4. [Design Tokens & Colors](#design-tokens--colors)
5. [Animation Guidelines](#animation-guidelines)
6. [Content & Copywriting](#content--copywriting)
7. [Implementation Tasks](#implementation-tasks)
8. [Detailed Implementation Prompts](#detailed-implementation-prompts)
9. [Assets & Resources](#assets--resources)
10. [Performance Considerations](#performance-considerations)
11. [Accessibility Requirements](#accessibility-requirements)

---

## Design Philosophy

### Core Principles

1. **"Less is More" with Impact** - Clean, spacious design with strategic moments of visual delight
2. **Motion with Purpose** - Every animation serves a purpose (guide attention, provide feedback, create delight)
3. **Progressive Disclosure** - Reveal information as users scroll, maintaining engagement
4. **Trust Through Craft** - Pixel-perfect execution signals quality and reliability
5. **Mobile-First Excellence** - Flawless experience across all devices

### Visual Identity

- **Mood**: Professional yet approachable, modern yet timeless
- **Feel**: Organized, empowering, calming
- **Inspiration**: Linear, Notion, Raycast, Arc Browser landing pages

### Key Design Elements

- Generous whitespace (breathing room)
- Subtle gradients and glass morphism effects
- Micro-interactions on hover/scroll
- High-quality mockups and illustrations
- Smooth parallax scrolling sections
- Animated statistics/numbers
- Testimonial social proof (can be placeholder initially)

---

## Tech Stack & Libraries

### Required Dependencies

```bash
# Animation & Motion
npm install framer-motion@latest

# Parallax Scrolling
npm install react-scroll-parallax@latest

# Scroll Animations (Intersection Observer)
npm install react-intersection-observer@latest

# Animated Numbers/Counters
npm install react-countup@latest

# Icons (if not already installed)
npm install lucide-react@latest

# Smooth Scrolling (optional - can use CSS)
npm install @react-spring/web@latest
```

### Library Purposes

| Library | Purpose | Usage |
|---------|---------|-------|
| `framer-motion` | Animations, transitions, gestures | Hero animations, section reveals, hover effects |
| `react-scroll-parallax` | Parallax scrolling effects | Background elements, floating decorations |
| `react-intersection-observer` | Scroll-triggered animations | Section fade-ins, counter triggers |
| `react-countup` | Animated number counters | Statistics section |
| `lucide-react` | Beautiful SVG icons | Feature icons, UI elements |

### File Structure

```
app/
├── (landing)/
│   ├── page.tsx                    # Main landing page
│   └── layout.tsx                  # Landing-specific layout (no dashboard nav)
│
components/
├── landing/
│   ├── Hero.tsx                    # Hero section with main CTA
│   ├── Features.tsx                # Feature showcase grid
│   ├── FeatureDeep.tsx             # Detailed feature sections (alternating)
│   ├── HowItWorks.tsx              # 3-step process section
│   ├── Statistics.tsx              # Animated stats/social proof
│   ├── Testimonials.tsx            # User testimonials carousel
│   ├── Pricing.tsx                 # Pricing tiers (if applicable)
│   ├── FAQ.tsx                     # Frequently asked questions
│   ├── CTA.tsx                     # Final call-to-action section
│   ├── Footer.tsx                  # Landing page footer
│   ├── Navbar.tsx                  # Landing page navigation
│   └── ui/
│       ├── AnimatedText.tsx        # Text reveal animations
│       ├── FloatingElement.tsx     # Parallax floating decorations
│       ├── GlowCard.tsx            # Glowing card component
│       ├── GradientText.tsx        # Gradient text component
│       ├── ParallaxSection.tsx     # Reusable parallax wrapper
│       ├── ScrollReveal.tsx        # Scroll-triggered reveal wrapper
│       └── MockupDisplay.tsx       # App mockup/screenshot display
│
styles/
├── landing.css                     # Landing-specific styles
```

---

## Page Structure & Sections

### Section Overview

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (Sticky, transparent → solid on scroll)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. HERO SECTION                                            │
│     - Animated headline with gradient text                  │
│     - Subheadline with typing effect                        │
│     - Primary & Secondary CTAs                              │
│     - Floating app mockup with parallax                     │
│     - Animated background shapes/gradient                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  2. TRUSTED BY / SOCIAL PROOF BAR                           │
│     - "Join 10,000+ users organizing their lives"           │
│     - Logo cloud (if applicable) or user avatars            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3. FEATURE OVERVIEW (Bento Grid)                           │
│     - 6 feature cards in modern bento layout                │
│     - Each with icon, title, short description              │
│     - Hover animations with subtle glow                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  4. FEATURE DEEP DIVES (Alternating Layout)                 │
│                                                             │
│  4a. Journaling Feature                                     │
│      [Mockup Left] | [Content Right]                        │
│                                                             │
│  4b. Expense Tracking Feature                               │
│      [Content Left] | [Mockup Right]                        │
│                                                             │
│  4c. Task Management Feature                                │
│      [Mockup Left] | [Content Right]                        │
│                                                             │
│  4d. Flashcards & Learning Feature                          │
│      [Content Left] | [Mockup Right]                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  5. STATISTICS SECTION                                      │
│     - Animated counters                                     │
│     - "50,000+ Journal Entries Created"                     │
│     - "$2M+ Expenses Tracked"                               │
│     - "100,000+ Tasks Completed"                            │
│     - "1M+ Flashcards Studied"                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  6. HOW IT WORKS                                            │
│     - 3-step visual process                                 │
│     - Step 1: Sign Up (30 seconds)                          │
│     - Step 2: Customize Your Dashboard                      │
│     - Step 3: Start Achieving Your Goals                    │
│     - Connected with animated line/path                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  7. TESTIMONIALS                                            │
│     - Carousel/grid of user testimonials                    │
│     - Star ratings, user photos, quotes                     │
│     - Subtle auto-scroll animation                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  8. PRICING (Optional - if freemium/paid)                   │
│     - Free tier vs Pro tier                                 │
│     - Feature comparison table                              │
│     - Highlighted "Most Popular" tier                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  9. FAQ SECTION                                             │
│     - Accordion-style FAQ                                   │
│     - Common questions about the app                        │
│     - Smooth expand/collapse animations                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  10. FINAL CTA SECTION                                      │
│      - Large, impactful headline                            │
│      - "Start Your Journey Today"                           │
│      - Email capture or direct sign-up button               │
│      - Gradient background with floating elements           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  11. FOOTER                                                 │
│      - Logo and tagline                                     │
│      - Navigation links                                     │
│      - Social media links                                   │
│      - Copyright and legal links                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Tokens & Colors

### Extended Color Palette for Landing Page

```css
/* Add to design-tokens.css */

:root {
  /* Landing Page Specific Colors */
  --landing-gradient-start: #667eea;
  --landing-gradient-end: #764ba2;
  --landing-gradient-accent: #f093fb;

  /* Glass Morphism */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* Glow Effects */
  --glow-primary: 0 0 40px rgba(242, 100, 25, 0.3);
  --glow-accent: 0 0 40px rgba(102, 126, 234, 0.3);

  /* Feature Card Colors */
  --feature-journal: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --feature-expense: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  --feature-tasks: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
  --feature-flashcards: linear-gradient(135deg, #7f00ff 0%, #e100ff 100%);
  --feature-notes: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
  --feature-goals: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-bg: rgba(0, 0, 0, 0.2);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}
```

### Typography Scale for Landing

```css
/* Landing page typography */
.landing-h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.landing-h2 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.landing-h3 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.3;
}

.landing-body {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.7;
  color: var(--text-secondary);
}

.landing-small {
  font-size: 0.875rem;
  line-height: 1.5;
}
```

---

## Animation Guidelines

### Animation Principles

1. **Duration**:
   - Micro-interactions: 150-200ms
   - Section reveals: 400-600ms
   - Page transitions: 300-400ms

2. **Easing**:
   - Entrances: `[0.33, 1, 0.68, 1]` (ease-out-cubic)
   - Exits: `[0.32, 0, 0.67, 0]` (ease-in-cubic)
   - Continuous: `[0.65, 0, 0.35, 1]` (ease-in-out-cubic)

3. **Stagger**: 50-100ms between elements in a list

### Framer Motion Variants

```typescript
// animations/variants.ts

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  }
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
  }
};

export const heroTextReveal = {
  hidden: { opacity: 0, y: 100 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: [0.33, 1, 0.68, 1]
    }
  })
};
```

### Scroll-Triggered Animation Pattern

```typescript
// components/landing/ui/ScrollReveal.tsx

'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className
}: ScrollRevealProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

## Content & Copywriting

### Brand Voice Guidelines

- **Tone**: Confident but not arrogant, helpful but not condescending
- **Language**: Clear, concise, action-oriented
- **Avoid**: Jargon, buzzwords, hyperbole without substance

### Hero Section Copy

**Primary Headline Options:**
1. "Your Life, Beautifully Organized"
2. "Master Your Day. Transform Your Life."
3. "One Dashboard. Infinite Possibilities."
4. "Where Productivity Meets Simplicity"

**Subheadline:**
> "Track journals, expenses, tasks, and goals in one beautifully designed space. LifeDash brings clarity to your daily chaos."

**CTA Buttons:**
- Primary: "Start Free Today" or "Get Started — It's Free"
- Secondary: "See How It Works" or "Watch Demo"

### Feature Headlines

| Feature | Headline | Description |
|---------|----------|-------------|
| **Journaling** | "Capture Every Thought" | "Transform fleeting ideas into lasting insights. Our distraction-free journal helps you reflect, grow, and track your writing journey." |
| **Expenses** | "Know Where Every Dollar Goes" | "Beautiful expense tracking that makes budgeting feel effortless. Multi-currency support, smart categories, and insightful analytics." |
| **Tasks** | "Conquer Your To-Do List" | "From simple tasks to complex projects, manage everything with priorities, due dates, recurring schedules, and subtasks." |
| **Flashcards** | "Learn Smarter, Not Harder" | "Master any subject with spaced repetition. Organize decks, track progress, and build lasting knowledge." |
| **Notes** | "Organize Your Ideas" | "Folders, pins, and powerful search. Your second brain for capturing and organizing everything that matters." |
| **Goals** | "Achieve What Matters Most" | "Set meaningful goals across all areas of your life. Track streaks, celebrate milestones, and watch your progress unfold." |

### Statistics Section Copy

```
50,000+          $2M+              100,000+         1M+
Journal          Worth of          Tasks            Flashcards
Entries          Expenses          Completed        Studied
Created          Tracked
```

### How It Works Copy

**Step 1: Sign Up in Seconds**
> "Create your free account with just an email. No credit card required, no complex setup."

**Step 2: Customize Your Space**
> "Choose which modules matter to you. Journaling, expenses, tasks, learning — mix and match to create your perfect dashboard."

**Step 3: Start Living Intentionally**
> "Track progress, build habits, and achieve your goals. Watch as small daily actions compound into remarkable results."

### Testimonials (Placeholder Examples)

```
"LifeDash replaced 5 different apps for me. Everything I need is finally in one place."
— Sarah K., Product Designer

"The journaling feature alone is worth it. But having my expenses and tasks alongside? Game changer."
— Marcus T., Freelance Developer

"I've tried every productivity app out there. LifeDash is the first one that actually stuck."
— Emily R., Graduate Student
```

### FAQ Content

**Q: Is LifeDash really free?**
> "Yes! LifeDash offers a generous free tier with all core features. We believe everyone deserves great productivity tools."

**Q: Does it work offline?**
> "Absolutely. LifeDash is a Progressive Web App (PWA) that works offline. Your data syncs automatically when you're back online."

**Q: Can I access LifeDash on my phone?**
> "Yes! LifeDash works beautifully on any device. Install it on your phone's home screen for an app-like experience."

**Q: Is my data secure?**
> "Your privacy is our priority. All data is encrypted and stored securely. We never sell or share your personal information."

**Q: Can I export my data?**
> "You own your data. Export everything anytime in standard formats."

### Final CTA Copy

**Headline:** "Ready to Take Control?"

**Subheadline:**
> "Join thousands of people who've transformed their daily routines. Your future self will thank you."

**CTA Button:** "Start Your Free Account"

**Social Proof Line:** "No credit card required • Free forever • 2-minute setup"

---

## Implementation Tasks

### Phase 1: Foundation (Task 1-4)

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 1 | Install required dependencies | High | Low |
| 2 | Create landing page file structure | High | Low |
| 3 | Extend design tokens for landing page | High | Low |
| 4 | Create reusable animation components | High | Medium |

### Phase 2: Core Sections (Task 5-10)

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 5 | Build Navbar component (sticky, transparent→solid) | High | Medium |
| 6 | Build Hero section with animations | High | High |
| 7 | Build Social Proof bar | Medium | Low |
| 8 | Build Feature Bento Grid | High | High |
| 9 | Build Feature Deep Dive sections (4x) | High | High |
| 10 | Build Statistics section with counters | Medium | Medium |

### Phase 3: Trust & Conversion (Task 11-15)

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 11 | Build How It Works section | Medium | Medium |
| 12 | Build Testimonials section | Medium | Medium |
| 13 | Build FAQ section with accordions | Medium | Low |
| 14 | Build Final CTA section | High | Medium |
| 15 | Build Footer component | Medium | Low |

### Phase 4: Polish & Optimization (Task 16-20)

| # | Task | Priority | Complexity |
|---|------|----------|------------|
| 16 | Add parallax effects throughout | Medium | Medium |
| 17 | Create/source app mockup images | High | Medium |
| 18 | Implement responsive design refinements | High | Medium |
| 19 | Add dark mode support | Medium | Medium |
| 20 | Performance optimization (lazy loading, etc.) | High | Medium |

---

## Detailed Implementation Prompts

### Prompt 1: Install Dependencies & Setup

```
Install the following npm packages for the landing page:
- framer-motion (latest)
- react-scroll-parallax (latest)
- react-intersection-observer (latest)
- react-countup (latest)
- lucide-react (latest)

Then create the following folder structure:
- components/landing/
- components/landing/ui/
- app/(landing)/ (route group for landing-specific layout)

Create a basic layout.tsx in app/(landing)/ that doesn't include the dashboard navigation.
```

### Prompt 2: Create Animation Utility Components

```
Create the following reusable animation components in components/landing/ui/:

1. ScrollReveal.tsx
   - Wrapper component that animates children when they enter viewport
   - Props: direction (up/down/left/right), delay, duration, className
   - Use framer-motion and react-intersection-observer
   - Should only animate once (triggerOnce: true)

2. AnimatedText.tsx
   - Text component that reveals character by character or word by word
   - Props: text, type ('chars' | 'words'), delay, className
   - Use framer-motion with staggerChildren

3. GradientText.tsx
   - Span component that applies animated gradient to text
   - Props: children, colors (array of colors), className
   - Subtle animation of gradient position

4. FloatingElement.tsx
   - Wrapper for elements that should float/bob gently
   - Props: children, amplitude, duration, className
   - Use framer-motion with repeat: Infinity

5. ParallaxWrapper.tsx
   - Integration with react-scroll-parallax
   - Props: children, speed, className
   - Handles parallax provider context

Use the existing design tokens for colors and transitions. Make all components 'use client'.
```

### Prompt 3: Build the Navbar Component

```
Create components/landing/Navbar.tsx with these specifications:

Visual Design:
- Fixed position at top
- Initially transparent background, becomes solid white/dark on scroll (after 50px)
- Smooth background transition (300ms)
- Contains: Logo (left), Navigation links (center), CTA button (right)
- Navigation links: Features, How It Works, FAQ
- CTA: "Get Started" button with primary styling
- Mobile: Hamburger menu that opens a slide-down menu

Behavior:
- Clicking nav links smooth-scrolls to that section
- Logo links to top of page
- Hide on scroll down, show on scroll up (optional advanced feature)

Use framer-motion for any animations. Match the existing design system colors.
The navbar should be ~70px tall on desktop, ~60px on mobile.
```

### Prompt 4: Build the Hero Section

```
Create components/landing/Hero.tsx - this is the most important section.

Layout (Desktop):
- Full viewport height (100vh), or at minimum 700px
- Content on left side (60%), floating mockup on right (40%)
- Gradient mesh background with subtle animated movement
- Floating decorative shapes with parallax effect

Content Elements:
1. Small badge/pill: "✨ Now with offline support" (optional)
2. Main headline: "Your Life, Beautifully Organized"
   - Use AnimatedText for word-by-word reveal
   - "Beautifully" should have gradient text effect
3. Subheadline: The copy from the content section
   - Fade in after headline completes
4. Two CTA buttons:
   - Primary: "Start Free Today" → links to /auth
   - Secondary: "See How It Works" → scrolls to How It Works section
   - Buttons should have hover scale effect
5. Social proof line below buttons:
   - "Join 10,000+ users" with small avatar stack

Mockup Section:
- Large app screenshot/mockup floating with parallax
- Subtle shadow and glow effect
- Should appear to float slightly above the background
- Consider a browser frame or device frame around it

Background:
- Gradient mesh using the landing gradient colors
- Add 2-3 floating blurred circles/shapes with slow parallax movement
- Optional: subtle grid pattern overlay at low opacity

Animations:
- Staggered entrance for all elements (heading → subheading → buttons → mockup)
- Parallax on scroll for the mockup (moves slower than scroll)
- Floating animation on decorative elements

Mobile:
- Stack vertically (content on top, mockup below)
- Reduce mockup size
- Maintain all animations but adjust timing

Make it visually stunning - this is the first impression.
```

### Prompt 5: Build the Feature Bento Grid

```
Create components/landing/Features.tsx

Layout:
- Section with heading "Everything You Need"
- Subheading: "Six powerful tools, one beautiful dashboard"
- Bento-style grid (not uniform - varying card sizes)
- Desktop: 3 columns, Mobile: 1 column

Grid Layout (Desktop):
┌─────────────┬─────────────┐
│   Journal   │  Expenses   │
│   (large)   │   (large)   │
├──────┬──────┼──────┬──────┤
│Tasks │Flash │Notes │Goals │
│(med) │(med) │(med) │(med) │
└──────┴──────┴──────┴──────┘

Each Card Contains:
- Gradient icon background (use feature colors from tokens)
- Icon (from lucide-react)
- Feature name
- Short description (1-2 sentences)
- Mini visual/illustration (optional)

Card Styling:
- Rounded corners (16-20px)
- Subtle border
- On hover: slight scale up (1.02), shadow increase, subtle glow
- Background: glass morphism effect (semi-transparent with blur)

Animations:
- Cards animate in with stagger when section enters viewport
- Icons have subtle continuous animation (pulse or float)

Use ScrollReveal wrapper for the section entrance.
```

### Prompt 6: Build Feature Deep Dive Sections

```
Create components/landing/FeatureDeep.tsx

This is a reusable component for detailed feature showcases. Create 4 instances:

Structure:
- Alternating layout (odd: image left/content right, even: content left/image right)
- Each section is full-width with max-width container
- Generous vertical padding (100-150px)

For each feature section:

Props interface:
- title: string
- subtitle: string
- description: string
- features: string[] (bullet points)
- image: string (path to mockup)
- gradient: string (feature gradient color)
- reversed: boolean (flip layout)

Content Side:
- Small colored pill with feature category
- Large headline
- Paragraph description
- 3-4 bullet points with checkmark icons
- "Learn more" link (optional)

Image Side:
- Large mockup/screenshot of that feature
- Floating UI elements around it (showing detail)
- Parallax effect on scroll
- Subtle glow matching feature color

Sections to create:

1. Journaling
   - Show journal editor mockup
   - Highlight: distraction-free writing, streak tracking, insights

2. Expense Tracking
   - Show expense dashboard mockup
   - Highlight: categories, multi-currency, analytics

3. Task Management
   - Show task list mockup
   - Highlight: priorities, recurring tasks, subtasks

4. Flashcards & Learning
   - Show flashcard study mockup
   - Highlight: spaced repetition, decks, progress tracking

Each should animate in when scrolled into view (content from one side, image from other).
```

### Prompt 7: Build Statistics Section

```
Create components/landing/Statistics.tsx

Visual Design:
- Contrasting background (dark section if page is light, or gradient background)
- Centered content
- 4 statistics in a row (responsive to 2x2 on mobile)

Each Stat:
- Large animated number (using react-countup)
- Unit/suffix (e.g., "+", "M+", "K+")
- Label below the number
- Optional icon above

Statistics to display:
1. 50,000+ | Journal Entries Created
2. $2M+ | Expenses Tracked
3. 100,000+ | Tasks Completed
4. 1M+ | Flashcards Studied

Behavior:
- Numbers should count up from 0 when section enters viewport
- Use react-intersection-observer to trigger
- Count duration: 2-2.5 seconds
- Easing: ease-out

Styling:
- Numbers: Large (4-5rem), bold, white or gradient text
- Labels: Smaller, muted color
- Add subtle decorative elements (dots, lines, shapes)

Animation:
- Whole section fades in
- Then numbers start counting with slight stagger
```

### Prompt 8: Build How It Works Section

```
Create components/landing/HowItWorks.tsx

Layout:
- Section heading: "Get Started in Minutes"
- 3 steps in a horizontal row (vertical on mobile)
- Connected by a line/path

Each Step:
- Number badge (1, 2, 3) with gradient background
- Icon representing the step
- Headline
- Description paragraph

Steps:
1. "Sign Up in Seconds"
   - Icon: UserPlus or Sparkles
   - "Create your free account with just an email. No credit card required."

2. "Customize Your Dashboard"
   - Icon: Layout or Sliders
   - "Choose your modules and personalize your workspace."

3. "Achieve Your Goals"
   - Icon: Target or TrendingUp
   - "Track progress and watch your productivity soar."

Connecting Line:
- Desktop: Horizontal line connecting the steps
- Animated drawing effect when section enters viewport
- Use SVG path with stroke-dasharray animation

Animations:
- Line draws first
- Then steps appear one by one with stagger
- Each step does a fade-up animation
```

### Prompt 9: Build Testimonials Section

```
Create components/landing/Testimonials.tsx

Layout:
- Section heading: "Loved by Thousands"
- Grid of testimonial cards (3 columns desktop, 1 mobile)
- Or: horizontal scrolling carousel

Each Testimonial Card:
- User avatar (placeholder image)
- User name
- User title/role
- Star rating (5 stars)
- Quote text
- Quote marks decorative element

Testimonials (placeholder - can be updated with real ones later):

1. Sarah K., Product Designer
   "LifeDash replaced 5 different apps for me. Everything I need is finally in one place."

2. Marcus T., Freelance Developer
   "The journaling feature alone is worth it. But having my expenses and tasks alongside? Game changer."

3. Emily R., Graduate Student
   "I've tried every productivity app out there. LifeDash is the first one that actually stuck."

4. David L., Startup Founder
   "Clean, fast, and actually useful. The goal tracking keeps me accountable every day."

5. Priya M., Content Creator
   "The offline mode is incredible. I journal on flights and everything syncs when I land."

6. James W., Financial Analyst
   "Finally, expense tracking that doesn't feel like a chore. The analytics are beautiful."

Card Styling:
- Soft background with subtle border
- Rounded corners
- Subtle shadow
- On hover: slight lift effect

Animation:
- Cards stagger in when section enters viewport
- Optional: auto-scrolling carousel with pause on hover
```

### Prompt 10: Build FAQ Section

```
Create components/landing/FAQ.tsx

Layout:
- Section heading: "Frequently Asked Questions"
- Accordion-style expandable questions
- Max-width container for readability

FAQ Items:
1. Is LifeDash really free?
2. Does it work offline?
3. Can I access LifeDash on my phone?
4. Is my data secure?
5. Can I export my data?
6. How do I get started?

(Use the copy from the Content section above)

Accordion Behavior:
- Click to expand/collapse
- Smooth height animation
- Plus/Minus or Chevron icon that rotates
- Only one open at a time (optional - could allow multiple)

Styling:
- Each item has subtle border/divider
- Open item has slightly different background
- Smooth transition for all state changes

Animation:
- Use framer-motion AnimatePresence for content reveal
- Icon rotation animation
- List items stagger in when section enters viewport
```

### Prompt 11: Build Final CTA Section

```
Create components/landing/CTA.tsx

This is the conversion-focused section before the footer.

Visual Design:
- Full-width gradient background (use landing gradients)
- Floating decorative elements with parallax
- Centered content
- High contrast text (white on gradient)

Content:
- Large headline: "Ready to Take Control?"
- Subheadline: "Join thousands who've transformed their daily routines."
- Primary CTA button: "Start Your Free Account" (large, prominent)
- Trust text below: "No credit card required • Free forever • 2-minute setup"

Decorative Elements:
- Floating shapes/circles with blur and low opacity
- Subtle grid or dot pattern overlay
- Optional: floating mini-mockups or icons around the edges

Animations:
- Background gradient subtle animation (shifting colors)
- Floating elements with parallax
- Button has pulse or glow animation to draw attention
- Content fades in when scrolled into view
```

### Prompt 12: Build Footer Component

```
Create components/landing/Footer.tsx

Layout:
- Dark background
- Max-width container
- Grid layout for links
- Copyright at bottom

Sections:
1. Brand Column:
   - Logo
   - Tagline: "Your personal dashboard for life management"
   - Social icons (Twitter/X, GitHub, LinkedIn - can be placeholder links)

2. Product Column:
   - Features
   - Pricing (if applicable)
   - Changelog (placeholder)
   - Roadmap (placeholder)

3. Resources Column:
   - Blog (placeholder)
   - Help Center (placeholder)
   - API Docs (placeholder)
   - Status (placeholder)

4. Company Column:
   - About (placeholder)
   - Privacy Policy
   - Terms of Service
   - Contact

Bottom Bar:
- Copyright: "© 2024 LifeDash. All rights reserved."
- Optional: Language/region selector

Styling:
- Muted text colors
- Links have subtle hover effect
- Clean, minimal design
- Adequate spacing between sections

Mobile:
- Stack columns vertically
- Collapsible sections (optional)
```

### Prompt 13: Assemble the Landing Page

```
Now assemble all components in app/(landing)/page.tsx

Structure:
1. Import all section components
2. Wrap everything in ParallaxProvider from react-scroll-parallax
3. Add smooth scroll behavior to the page
4. Ensure proper section IDs for navigation scrolling

Order of sections:
1. Navbar (fixed, outside main flow)
2. Hero (id="hero")
3. Social Proof Bar (optional standalone or part of hero)
4. Features Bento (id="features")
5. Feature Deep Dives (no ID needed, flows naturally)
6. Statistics
7. How It Works (id="how-it-works")
8. Testimonials
9. FAQ (id="faq")
10. Final CTA
11. Footer

Add smooth scroll CSS to globals.css or landing.css:
html {
  scroll-behavior: smooth;
}

Test all:
- Navigation links scroll to correct sections
- All animations trigger correctly
- Responsive design works on all breakpoints
- Dark mode support (if implemented)
```

### Prompt 14: Create App Mockups

```
For the mockup images needed throughout the landing page:

Option 1 - Screenshots:
Take actual screenshots of your dashboard and feature pages, then:
- Add a browser frame or device frame around them
- Add subtle shadows and depth
- Consider using tools like Screely, BrowserFrame, or Figma

Option 2 - Use placeholder services:
- Use placeholder mockup images temporarily
- Create simple mockup components that show a styled "preview" of the UI

Option 3 - Create mockup components:
Create components/landing/ui/MockupDisplay.tsx that:
- Renders a device frame (laptop, phone, or browser window)
- Can take children or an image src
- Has proper shadows and reflections
- Looks professional and polished

Device Frame Styling:
- Browser: Chrome-like with traffic lights and URL bar
- Laptop: MacBook-style frame with screen bezel
- Phone: iPhone-style with notch

For now, create a MockupDisplay component that can accept an image and renders it in a beautiful device frame. This can be updated with real screenshots later.
```

### Prompt 15: Performance & Polish

```
Final polish and optimization tasks:

1. Lazy Loading:
- Wrap below-fold sections in dynamic imports with next/dynamic
- Add loading skeletons for lazy-loaded sections

2. Image Optimization:
- Use next/image for all images
- Provide proper width/height/sizes attributes
- Use WebP format where possible

3. Animation Performance:
- Use transform and opacity for animations (GPU accelerated)
- Add will-change hints sparingly
- Test on low-end devices

4. Code Splitting:
- Ensure framer-motion is only loaded for landing page
- Split heavy components

5. SEO:
Add to app/(landing)/layout.tsx or page.tsx:
- Proper meta title and description
- Open Graph tags for social sharing
- Structured data (optional)

6. Accessibility:
- Ensure all animations respect prefers-reduced-motion
- All images have alt text
- Proper heading hierarchy
- Keyboard navigation works for accordion

7. Final Testing:
- Test on Chrome, Firefox, Safari
- Test on iOS and Android
- Test with slow network (3G)
- Lighthouse audit > 90 on all metrics
```

---

## Assets & Resources

### Free Image Resources

| Resource | URL | Use For |
|----------|-----|---------|
| Unsplash | unsplash.com | Background images, lifestyle photos |
| Pexels | pexels.com | Stock photos |
| unDraw | undraw.co | SVG illustrations (customizable colors) |
| Humaaans | humaaans.com | People illustrations |
| Storyset | storyset.com | Animated illustrations |
| Heroicons | heroicons.com | SVG icons |
| Lucide | lucide.dev | Icon library (already recommended) |

### Mockup Resources

| Resource | URL | Use For |
|----------|-----|---------|
| Screely | screely.com | Browser mockups |
| Mockup World | mockupworld.co | Device mockups |
| Shots.so | shots.so | Social/app mockups |
| BrowserFrame | browserframe.com | Browser frames |

### Animation Resources

| Resource | URL | Use For |
|----------|-----|---------|
| LottieFiles | lottiefiles.com | Lottie animations (optional) |
| Motion | motion.dev | Framer Motion tutorials |
| Cubic Bezier | cubic-bezier.com | Easing curve generator |

### Gradient Resources

| Resource | URL | Use For |
|----------|-----|---------|
| Mesh Gradients | meshgradient.com | Complex gradient backgrounds |
| CSS Gradient | cssgradient.io | Gradient generator |
| Gradienta | gradienta.io | Gradient backgrounds |

---

## Performance Considerations

### Target Metrics

| Metric | Target | Priority |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | High |
| Largest Contentful Paint | < 2.5s | High |
| Time to Interactive | < 3.5s | High |
| Cumulative Layout Shift | < 0.1 | High |
| Total Bundle Size | < 300KB (gzipped) | Medium |

### Optimization Techniques

1. **Critical CSS**: Inline critical styles for above-fold content
2. **Font Loading**: Use `font-display: swap` and preload key fonts
3. **Image Lazy Loading**: Load images only when near viewport
4. **Component Code Splitting**: Dynamic imports for below-fold sections
5. **Animation Optimization**: Use GPU-accelerated properties only
6. **Preconnect**: Add preconnect hints for external resources

### Bundle Size Management

```javascript
// next.config.js addition for bundle analysis
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... existing config
})
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus Indicators**: Visible focus states on all interactive elements
3. **Keyboard Navigation**: All features accessible via keyboard
4. **Screen Reader**: Proper ARIA labels and semantic HTML
5. **Reduced Motion**: Respect `prefers-reduced-motion` media query

### Reduced Motion Implementation

```typescript
// hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// Usage in components
const reducedMotion = useReducedMotion();
const animationDuration = reducedMotion ? 0 : 0.6;
```

---

## Summary Checklist

### Before Starting
- [ ] All dependencies installed
- [ ] Folder structure created
- [ ] Design tokens extended
- [ ] Animation utilities created

### Core Sections
- [ ] Navbar with scroll behavior
- [ ] Hero section with animations
- [ ] Feature bento grid
- [ ] Feature deep dives (4 sections)
- [ ] Statistics with counters
- [ ] How it works section
- [ ] Testimonials
- [ ] FAQ accordion
- [ ] Final CTA
- [ ] Footer

### Polish
- [ ] All mockup images in place
- [ ] Dark mode support
- [ ] Mobile responsive
- [ ] Animations respect reduced-motion
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Accessibility audit passed

### Launch Ready
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] Lighthouse score > 90
- [ ] All links working
- [ ] Analytics tracking (if needed)

---

*This document is the complete blueprint for building a world-class landing page for LifeDash. Follow the implementation prompts in order for best results.*

---

## Final Testing Checklist

### Performance Testing

```bash
# Run Lighthouse audit
npm run build && npm run start
# Open Chrome DevTools > Lighthouse > Generate report
```

**Target Metrics:**
| Metric | Target | Priority |
|--------|--------|----------|
| Performance | > 90 | High |
| Accessibility | > 95 | High |
| Best Practices | > 90 | Medium |
| SEO | > 95 | High |
| First Contentful Paint | < 1.5s | High |
| Largest Contentful Paint | < 2.5s | High |
| Cumulative Layout Shift | < 0.1 | High |
| Total Blocking Time | < 200ms | Medium |

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Responsive Testing

| Breakpoint | Width | Test Items |
|------------|-------|------------|
| Mobile S | 320px | Layout doesn't break |
| Mobile M | 375px | Text readable, CTAs tappable |
| Mobile L | 425px | Images scale properly |
| Tablet | 768px | Grid layouts work |
| Laptop | 1024px | All sections visible |
| Desktop | 1440px | Max-widths respected |

### Accessibility Testing

- [ ] Tab navigation works through all interactive elements
- [ ] Focus indicators visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Reduced motion preference respected
- [ ] Alt text on all images
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Accordion keyboard accessible (Enter/Space to toggle)

### Animation Testing

- [ ] Scroll animations trigger at correct threshold
- [ ] No janky animations (60fps)
- [ ] Parallax smooth on scroll
- [ ] Hover states work correctly
- [ ] CountUp numbers animate properly
- [ ] No animation flicker on initial load

### Functionality Testing

- [ ] Nav links scroll to correct sections
- [ ] CTA buttons link to /auth
- [ ] Mobile menu opens/closes
- [ ] FAQ accordion expands/collapses
- [ ] Social links open in new tab
- [ ] Logo scrolls to top

### Network Testing

- [ ] Test with 3G throttling (Chrome DevTools)
- [ ] Loading skeletons appear
- [ ] Images lazy load below fold
- [ ] No console errors
- [ ] No 404 resources

### Dark Mode Testing

- [ ] All sections readable in dark mode
- [ ] Glass morphism adjusts
- [ ] Text contrast maintained
- [ ] Gradients look good
- [ ] Images/mockups visible

### SEO Verification

```bash
# Check meta tags
curl -s http://localhost:3000 | grep -E "<title>|<meta"
```

- [ ] Title tag present and correct
- [ ] Meta description present
- [ ] Open Graph tags present
- [ ] Twitter card tags present
- [ ] Canonical URL set
- [ ] Robots meta allows indexing

### Production Checklist

Before deploying to production:

- [ ] Remove any `console.log` statements
- [ ] Update OG image URL to production
- [ ] Update canonical URL to production domain
- [ ] Test contact email link
- [ ] Verify analytics tracking (if applicable)
- [ ] Test on actual mobile devices (not just emulators)
- [ ] Run `npm run build` without errors
- [ ] Check bundle size is acceptable

---

*Last updated: January 2025*
