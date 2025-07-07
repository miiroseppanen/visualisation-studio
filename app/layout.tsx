import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { I18nProvider } from '@/components/I18nProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://visualization-studio.com'),
  title: 'Visualization Studio',
  description: 'Professional pattern generation toolkit for creative branding and packaging design. Create unique geometric patterns, flowing textures, and dynamic visual systems with precision control.',
  keywords: ['visualization', 'patterns', 'design', 'generative', 'creative', 'magnetic fields', 'waves', 'topography'],
  authors: [{ name: 'Visualization Studio' }],
  creator: 'Visualization Studio',
  publisher: 'Visualization Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/h23-logo.svg', type: 'image/svg+xml' },
      { url: '/h23-logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/h23-logo.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/h23-logo.svg',
    apple: [
      { url: '/h23-logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/h23-logo.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Visualization Studio',
    startupImage: [
      {
        url: '/h23-logo.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/h23-logo.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/h23-logo.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Visualization Studio',
    description: 'Professional pattern generation toolkit for creative branding and packaging design',
    url: 'https://visualization-studio.com',
    siteName: 'Visualization Studio',
    images: [
      {
        url: '/h23-logo.png',
        width: 512,
        height: 512,
        alt: 'Visualization Studio'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualization Studio',
    description: 'Professional pattern generation toolkit for creative branding and packaging design',
    images: ['/h23-logo.png'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Visualization Studio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <I18nProvider>
          <ThemeProvider>
            {children}
            <ServiceWorkerRegistration />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
} 