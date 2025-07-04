import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Visualization Studio',
  description: 'Professional pattern generation toolkit for creative branding and packaging design. Create unique geometric patterns, flowing textures, and dynamic visual systems with precision control.',
  icons: {
    icon: '/h23-logo.svg',
    shortcut: '/h23-logo.svg',
    apple: '/h23-logo.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
} 