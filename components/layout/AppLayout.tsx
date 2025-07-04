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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-black dark:via-black dark:to-black transition-colors duration-300">
      {showNavigation && <AppNavigation variant={navigationVariant} />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 