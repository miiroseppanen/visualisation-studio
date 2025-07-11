import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { I18nProvider } from '@/components/I18nProvider'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import { cookies } from 'next/headers';
import { createI18n } from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://visualization-studio.com'),
  title: 'Visualisation Studio',
  description: 'Visualisation Studio: Instantly generate unique geometric patterns, flowing textures, and dynamic visual systems for creative branding and packaging. Explore, create, and export with precision control.',
  keywords: ['visualization', 'patterns', 'design', 'generative', 'creative', 'magnetic fields', 'waves', 'topography'],
  authors: [{ name: 'Visualisation Studio' }],
  creator: 'Visualisation Studio',
  publisher: 'Visualisation Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-192.jpg', type: 'image/png' }
    ],
    shortcut: '/favicon-192.jpg',
    apple: [
      { url: '/favicon-192.jpg', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Visualisation Studio',
    startupImage: [
      {
        url: '/favicon-192.jpg',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/favicon-192.jpg',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/favicon-192.jpg',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Visualisation Studio',
    description: 'Visualisation Studio: Instantly generate unique geometric patterns, flowing textures, and dynamic visual systems for creative branding and packaging. Explore, create, and export with precision control.',
    url: 'https://visualization-studio.com',
    siteName: 'Visualisation Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Visualisation Studio preview'
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualisation Studio',
    description: 'Visualisation Studio: Instantly generate unique geometric patterns, flowing textures, and dynamic visual systems for creative branding and packaging. Explore, create, and export with precision control.',
    images: ['/og-image.png'],
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR: Get the locale from the cookie (set by middleware)
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  // Create a per-request i18n instance for SSR
  createI18n(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Visualisation Studio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <I18nProvider initialLanguage={locale}>
            <PWAInstallBanner />
            {children}
          </I18nProvider>
          <ServiceWorkerRegistration />
          <PerformanceMonitor />
        </ThemeProvider>
      </body>
    </html>
  );
} 