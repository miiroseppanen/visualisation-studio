import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { I18nProvider } from '@/components/I18nProvider'

export const metadata: Metadata = {
  title: 'Visualization Studio',
  description: 'Professional pattern generation toolkit for creative branding and packaging design. Create unique geometric patterns, flowing textures, and dynamic visual systems with precision control.',
  icons: {
    icon: '/h23-logo.svg',
    shortcut: '/h23-logo.svg',
    apple: '/h23-logo.svg'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Visualization Studio'
  },
  manifest: '/manifest.json'
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