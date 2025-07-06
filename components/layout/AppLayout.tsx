import React from 'react'
import AppNavigation from '@/components/navigation/AppNavigation'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const isMainPage = pathname === '/'
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-black dark:via-black dark:to-black transition-colors duration-300">
      {showNavigation && (
        <AppNavigation 
          variant={navigationVariant} 
          showPageSections={isMainPage}
        />
      )}
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  )
} 