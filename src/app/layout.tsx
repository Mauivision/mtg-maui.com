import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { ModernFooter } from '@/components/layout/ModernFooter';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageProgress } from '@/components/ui/PageProgress';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/seo/StructuredData';
import { WebVitals } from '@/components/analytics/WebVitals';
import { ErrorReporter } from '@/components/analytics/ErrorReporter';
import { SkipLinks } from '@/components/ui/SkipLinks';
import { siteImages } from '@/lib/site-images';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MTG Maui League - Magic: The Gathering Tournament Platform',
  description:
    "Join Hawaii's premier Magic: The Gathering tournament league. Compete in Commander and Draft formats, track your progress, and climb the leaderboards with fellow players.",
  keywords:
    'Magic The Gathering, MTG, League, Tournament, Commander, Draft, Hawaii, Maui, Competitive Gaming',
  authors: [{ name: 'MTG Maui League' }],
  creator: 'MTG Maui League',
  publisher: 'MTG Maui League',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.mtg-maui.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "MTG Maui League - Hawaii's Premier MTG Tournament Platform",
    description:
      'Compete in professional Magic: The Gathering tournaments. Join Commander and Draft leagues with real-time scoring and leaderboards.',
    url: 'https://www.mtg-maui.com',
    siteName: 'MTG Maui League',
    images: [
      {
        url: siteImages.ogImage,
        width: 1200,
        height: 630,
        alt: 'MTG Maui League - Magic: The Gathering Tournament Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MTG Maui League - Hawaii's Premier MTG Tournament Platform",
    description:
      'Compete in professional Magic: The Gathering tournaments. Join Commander and Draft leagues with real-time scoring.',
    images: [siteImages.ogImage],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="theme-color" content="#b45309" />
        <meta name="msapplication-TileColor" content="#b45309" />
        <meta name="msapplication-config" content="/images/icons/browserconfig.xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="MTG Maui" />
        <meta name="application-name" content="MTG Maui League" />
      </head>
      <body className="font-sans text-gray-100 antialiased bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <SkipLinks />
        <PageProgress />
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80">
              <header id="navigation">
                <ModernHeader />
              </header>
              <main id="main-content" className="flex-1 relative">
                {children}
              </main>
              <ModernFooter />
            </div>
          </Providers>
        </ErrorBoundary>
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        <WebVitals />
        <ErrorReporter />
      </body>
    </html>
  );
}
