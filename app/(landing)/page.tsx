import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

// Critical above-the-fold components - loaded immediately
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';

// Loading skeleton component (inline to avoid client component)
function SectionSkeleton({ height = '600px' }: { height?: string }) {
  return (
    <div
      style={{
        minHeight: height,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--bg-tertiary)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
}

// Below-fold components - lazy loaded with skeletons
const Features = dynamic(
  () => import('@/components/landing/Features').then((mod) => ({ default: mod.Features })),
  {
    loading: () => <SectionSkeleton height="800px" />,
    ssr: true,
  }
);

const FeatureDeep = dynamic(
  () => import('@/components/landing/FeatureDeep').then((mod) => ({ default: mod.FeatureDeep })),
  {
    loading: () => <SectionSkeleton height="2400px" />,
    ssr: true,
  }
);

const Statistics = dynamic(
  () => import('@/components/landing/Statistics').then((mod) => ({ default: mod.Statistics })),
  {
    loading: () => <SectionSkeleton height="500px" />,
    ssr: true,
  }
);

const HowItWorks = dynamic(
  () => import('@/components/landing/HowItWorks').then((mod) => ({ default: mod.HowItWorks })),
  {
    loading: () => <SectionSkeleton height="600px" />,
    ssr: true,
  }
);

const Testimonials = dynamic(
  () => import('@/components/landing/Testimonials').then((mod) => ({ default: mod.Testimonials })),
  {
    loading: () => <SectionSkeleton height="700px" />,
    ssr: true,
  }
);

const FAQ = dynamic(
  () => import('@/components/landing/FAQ').then((mod) => ({ default: mod.FAQ })),
  {
    loading: () => <SectionSkeleton height="800px" />,
    ssr: true,
  }
);

const CTA = dynamic(
  () => import('@/components/landing/CTA').then((mod) => ({ default: mod.CTA })),
  {
    loading: () => <SectionSkeleton height="500px" />,
    ssr: true,
  }
);

const Footer = dynamic(
  () => import('@/components/landing/Footer').then((mod) => ({ default: mod.Footer })),
  {
    loading: () => <div style={{ height: '400px', backgroundColor: '#0f172a' }} />,
    ssr: true,
  }
);

/**
 * SEO Metadata for Landing Page
 */
export const metadata: Metadata = {
  title: 'LifeDash - Your Life, Beautifully Organized',
  description:
    'Track journals, expenses, tasks, and goals in one beautifully designed dashboard. LifeDash brings clarity to your daily chaos with offline support and real-time sync.',
  keywords: [
    'productivity app',
    'life dashboard',
    'journal app',
    'expense tracker',
    'task manager',
    'goal tracking',
    'flashcards',
    'notes app',
    'PWA',
    'offline app',
  ],
  authors: [{ name: 'LifeDash Team' }],
  creator: 'LifeDash',
  publisher: 'LifeDash',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lifedash.app',
    siteName: 'LifeDash',
    title: 'LifeDash - Your Life, Beautifully Organized',
    description:
      'Track journals, expenses, tasks, and goals in one beautifully designed dashboard. Free forever with offline support.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LifeDash - Personal Life Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeDash - Your Life, Beautifully Organized',
    description:
      'Track journals, expenses, tasks, and goals in one beautifully designed dashboard.',
    images: ['/og-image.png'],
    creator: '@lifedashapp',
  },
  alternates: {
    canonical: 'https://lifedash.app',
  },
  category: 'productivity',
};

/**
 * LifeDash Landing Page
 *
 * Optimized for performance with:
 * - Above-fold content loaded immediately (Navbar, Hero)
 * - Below-fold sections lazy-loaded with dynamic imports
 * - Loading skeletons for smooth transitions
 * - SSR enabled for SEO
 */
export default function LandingPage() {
  return (
    <main className="landing-main">
      {/* Critical: Above-the-fold - No lazy loading */}
      <Navbar />
      <Hero />

      {/* Below-fold: Lazy loaded with skeletons */}
      <Features />
      <FeatureDeep />
      <Statistics />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
