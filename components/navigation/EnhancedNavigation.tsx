'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Lightbulb, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Plus,
  Lock,
  Unlock,
  Sun,
  Moon,
  Laptop,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { H23Logo } from '@/components/ui/h23-logo'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useVisualizationNavigation } from '@/lib/hooks/useVisualizationNavigation'
import { useMobileUI } from '@/lib/hooks/useMobileUI'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EnhancedNavigationProps {
  // Page-specific props
  pageType?: 'suggestions' | 'visualization'
  
  // Suggestions page props
  isAuthenticated?: boolean
  onAdminClick?: () => void
  onLogout?: () => void
  
  // Visualization page props
  onReset?: () => void
  onExportSVG?: () => void
  additionalActionButtons?: React.ReactNode
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  
  // General props
  className?: string
  hideNonEssential?: boolean
}

export default function EnhancedNavigation({
  pageType = 'visualization',
  isAuthenticated,
  onAdminClick,
  onLogout,
  onReset,
  onExportSVG,
  additionalActionButtons,
  showBackButton = true,
  backButtonText,
  backButtonFallback = '/',
  className = '',
  hideNonEssential = false
}: EnhancedNavigationProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { navigateHome, navigateToPath } = useNavigation()
  const { theme, setTheme } = useTheme()
  const { currentVisualization, allVisualizations, verifiedVisualizations, inProgressVisualizations, navigateToVisualization } = useVisualizationNavigation()
  const { isUIVisible, isMobile, showUI } = useMobileUI()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisualizationMenuOpen, setIsVisualizationMenuOpen] = useState(false)

  // Auto-hide navigation on mobile after inactivity
  useEffect(() => {
    if (!isMobile || pageType !== 'visualization') return

    let timeoutId: NodeJS.Timeout
    const hideDelay = 3000 // 3 seconds

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        // Only hide if UI is currently visible
        if (isUIVisible) {
          // Don't actually hide the navigation, just mark it as inactive
          // The useMobileUI hook handles the actual hiding
        }
      }, hideDelay)
    }

    const handleUserActivity = () => {
      resetTimer()
    }

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [isMobile, pageType, isUIVisible])

  const handleBackClick = () => {
    navigateHome()
  }

  const handleVisualizationSelect = (id: string) => {
    navigateToVisualization(id)
    setIsVisualizationMenuOpen(false)
  }

  // Theme switcher component
  const renderThemeSwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-accent/40 transition-colors focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : 
           theme === 'light' ? <Sun className="w-5 h-5" /> : 
           theme === 'pastel' ? <Palette className="w-5 h-5" /> : 
           <Laptop className="w-5 h-5" />}
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
          <DropdownMenuRadioItem value="pastel">
            <Palette className="w-4 h-4 mr-2 inline" /> Pastel
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Laptop className="w-4 h-4 mr-2 inline" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Suggestions page navigation
  if (pageType === 'suggestions') {
    return (
      <header className={cn(
        "sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300",
        className
      )}>
        <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            {/* Logo and back button */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="p-2 hover:bg-accent/40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">{backButtonText || t('navigation.back')}</span>
                </Button>
              )}
              <button 
                onClick={() => navigateHome()}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <H23Logo size="lg" />
                <div className="text-left">
                  <h1 className="text-lg lg:text-xl font-normal leading-tight">Visualisation Studio</h1>
                </div>
              </button>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/suggestions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('suggestions.submitIdea')}
                </Link>
              </Button>
              
              <Button variant="outline" size="sm" onClick={onAdminClick}>
                {isAuthenticated ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                {isAuthenticated ? 'Admin' : 'Admin'}
              </Button>
              
              {isAuthenticated && onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              )}
              
              {renderThemeSwitcher()}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border/40">
              <div className="flex flex-col space-y-2 pt-4">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/suggestions/new">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('suggestions.submitIdea')}
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" onClick={onAdminClick} className="justify-start">
                  {isAuthenticated ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isAuthenticated ? 'Admin' : 'Admin'}
                </Button>
                
                {isAuthenticated && onLogout && (
                  <Button variant="ghost" size="sm" onClick={onLogout} className="justify-start">
                    Logout
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    )
  }

  // Visualization page navigation
  return (
    <header className={cn(
      "sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300",
      isMobile && !isUIVisible && "opacity-0 pointer-events-none",
      className
    )}>
      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between">
          {/* Logo and back button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="p-2 hover:bg-accent/40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">{backButtonText || t('navigation.back')}</span>
              </Button>
            )}
            <button 
              onClick={() => navigateHome()}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <H23Logo size="lg" />
              <div className="text-left">
                <h1 className="text-lg lg:text-xl font-normal leading-tight">Visualisation Studio</h1>
              </div>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {/* Visualization dropdown */}
            <DropdownMenu open={isVisualizationMenuOpen} onOpenChange={setIsVisualizationMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[200px] justify-between">
                  <span className="truncate">
                    {currentVisualization ? currentVisualization.name : 'Select Visualisation'}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                {/* Verified visualizations */}
                {verifiedVisualizations.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </div>
                    {verifiedVisualizations.map((viz) => (
                      <DropdownMenuItem
                        key={viz.id}
                        onClick={() => handleVisualizationSelect(viz.id)}
                        className="flex items-center space-x-2"
                      >
                        <viz.icon className="w-4 h-4" />
                        <span>{viz.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                
                {/* In progress visualizations */}
                {inProgressVisualizations.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </div>
                    {inProgressVisualizations.map((viz) => (
                      <DropdownMenuItem
                        key={viz.id}
                        onClick={() => handleVisualizationSelect(viz.id)}
                        className="flex items-center space-x-2 opacity-70"
                      >
                        <viz.icon className="w-4 h-4" />
                        <span>{viz.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Action buttons */}
            {onReset && (
              <Button variant="outline" size="sm" onClick={onReset}>
                Reset
              </Button>
            )}
            
            {onExportSVG && (
              <Button variant="outline" size="sm" onClick={onExportSVG}>
                Export SVG
              </Button>
            )}
            
            {additionalActionButtons}
            
            {renderThemeSwitcher()}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/40">
            <div className="flex flex-col space-y-2 pt-4">
              {/* Mobile visualization dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-between w-full">
                    <span className="truncate">
                      {currentVisualization ? currentVisualization.name : 'Select Visualisation'}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full max-h-96 overflow-y-auto">
                  {/* Verified visualizations */}
                  {verifiedVisualizations.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                      {verifiedVisualizations.map((viz) => (
                        <DropdownMenuItem
                          key={viz.id}
                          onClick={() => handleVisualizationSelect(viz.id)}
                          className="flex items-center space-x-2"
                        >
                          <viz.icon className="w-4 h-4" />
                          <span>{viz.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  
                  {/* In progress visualizations */}
                  {inProgressVisualizations.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                      </div>
                      {inProgressVisualizations.map((viz) => (
                        <DropdownMenuItem
                          key={viz.id}
                          onClick={() => handleVisualizationSelect(viz.id)}
                          className="flex items-center space-x-2 opacity-70"
                        >
                          <viz.icon className="w-4 h-4" />
                          <span>{viz.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile action buttons */}
              {onReset && (
                <Button variant="outline" size="sm" onClick={onReset} className="justify-start">
                  Reset
                </Button>
              )}
              
              {onExportSVG && (
                <Button variant="outline" size="sm" onClick={onExportSVG} className="justify-start">
                  Export SVG
                </Button>
              )}
              
              {additionalActionButtons}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 