'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Grid3X3, Magnet, Wind, Mountain, Radio, Sun, Moon, Laptop, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { H23Logo } from '@/components/ui/h23-logo'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useVisualizationNavigation } from '@/lib/hooks/useVisualizationNavigation'
import VisualizationDropdown from './VisualizationDropdown'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

// Page sections for main page navigation
const pageSections = [
  { id: 'tools', titleKey: 'navigation.tools' },
  { id: 'about', titleKey: 'navigation.about' },
  { id: 'suggestions', titleKey: 'navigation.ideas' }
]

interface AppNavigationProps {
  variant?: 'header' | 'minimal'
  className?: string
  showPageSections?: boolean
}

export default function AppNavigation({ 
  variant = 'header', 
  className = '',
  showPageSections = false
}: AppNavigationProps) {
  const pathname = usePathname()
  const { navigateToPath, navigateHome } = useNavigation()
  const { theme, setTheme } = useTheme()
  const { currentVisualization, allVisualizations, verifiedVisualizations, inProgressVisualizations, navigateToVisualization } = useVisualizationNavigation()
  const { t } = useTranslation()

  const handleNavigationClick = (path: string) => {
    if (path === '/') {
      navigateHome()
    } else {
      navigateToPath(path)
    }
  }

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const ThemeSwitcher = React.useMemo(() => () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-accent/40 transition-colors focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={theme} onValueChange={v => setTheme(v as any)}>
          <DropdownMenuRadioItem value="light">
            <Sun className="w-4 h-4 mr-2 inline" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="w-4 h-4 mr-2 inline" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Laptop className="w-4 h-4 mr-2 inline" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ), [theme, setTheme])

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <button 
          onClick={() => handleNavigationClick('/')}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <H23Logo size="md" />
          <span className="text-lg font-normal">Visualization Studio</span>
        </button>
      </div>
    )
  }

  return (
    <header className={`sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md ${className}`}>
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => handleNavigationClick('/')}
            className="flex items-center space-x-3 lg:space-x-4 hover:opacity-80 transition-opacity"
          >
            <H23Logo size="lg" />
            <div className="text-left">
              <h1 className="text-lg lg:text-xl font-normal leading-tight">Visualization Studio</h1>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            {/* Page sections for main page */}
            {showPageSections && pathname === '/' && (
              <>
                {pageSections.map(section => (
                  <button 
                    key={section.id}
                    onClick={() => {
                      if (section.id === 'suggestions') {
                        handleNavigationClick('/suggestions')
                      } else {
                        handleSectionClick(section.id)
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(section.titleKey)}
                  </button>
                ))}
              </>
            )}
            
            {/* Visualization dropdown for main page */}
            {pathname === '/' && (
              <VisualizationDropdown
                currentVisualization={currentVisualization}
                allVisualizations={allVisualizations}
                verifiedVisualizations={verifiedVisualizations}
                inProgressVisualizations={inProgressVisualizations}
                onVisualizationSelect={navigateToVisualization}
                className="text-sm"
              />
            )}
            
            {/* Regular navigation items for other pages */}
            {pathname !== '/' && navigationItems.map(item => {
              const isActive = pathname === item.path
              return (
                <button 
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={`text-sm transition-colors ${
                    isActive 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.title}
                </button>
              )
            })}
          </nav>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <LanguageSelector />
            <ThemeSwitcher />
            <div className="md:hidden">
              {/* Mobile menu placeholder */}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export { navigationItems } 