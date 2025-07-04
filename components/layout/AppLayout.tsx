import React from 'react'
import AppNavigation from '@/components/navigation/AppNavigation'

interface AppLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
  navigationVariant?: 'header' | 'minimal'
}

export default function AppLayout({ 
  children, 
  showNavigation = true, 
  navigationVariant = 'header' 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <AppNavigation variant={navigationVariant} />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 