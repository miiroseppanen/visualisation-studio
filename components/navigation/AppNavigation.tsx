'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Grid3X3, Magnet, Wind, Mountain, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  title: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Grid Field',
    path: '/grid-field',
    icon: Grid3X3,
    description: 'Structured geometric patterns'
  },
  {
    title: 'Flow Field',
    path: '/flow-field',
    icon: Magnet,
    description: 'Flowing organic patterns'
  },
  {
    title: 'Turbulence',
    path: '/turbulence',
    icon: Wind,
    description: 'Complex swirling patterns'
  },
  {
    title: 'Topography',
    path: '/topography',
    icon: Mountain,
    description: 'Layered contour patterns'
  },
  {
    title: 'Circular Field',
    path: '/circular-field',
    icon: Radio,
    description: 'Concentric ring patterns'
  }
]

interface AppNavigationProps {
  variant?: 'header' | 'minimal'
  className?: string
}

export default function AppNavigation({ variant = 'header', className = '' }: AppNavigationProps) {
  const pathname = usePathname()

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-background" />
          </div>
          <span className="text-lg font-normal">Visualization Studio</span>
        </Link>
      </div>
    )
  }

  return (
    <header className={`border-b border-border/40 ${className}`}>
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <h1 className="text-xl font-normal">Visualization Studio</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map(item => {
              const isActive = pathname === item.path
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`text-sm transition-colors ${
                    isActive 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Sparkles className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export { navigationItems } 