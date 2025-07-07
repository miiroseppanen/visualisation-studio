'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Plus, Unlock, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Laptop, Palette } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PageNavigationProps {
  showBackButton?: boolean
  backButtonText?: string
  backButtonPath?: string
  title?: string
  subtitle?: string
  rightContent?: React.ReactNode
  className?: string
}

/**
 * Page-level navigation component
 * Designed to be used as a sibling to content, not wrapping it
 * Similar to the main page navigation structure
 */
export default function PageNavigation({
  showBackButton = true,
  backButtonText = 'Home',
  backButtonPath = '/',
  title,
  subtitle,
  rightContent,
  className = ''
}: PageNavigationProps) {
  const { t } = useTranslation()
  return (
    <div className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/10 ${className}`}>
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            {showBackButton && (
              <Link href={backButtonPath}>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>{backButtonText}</span>
                </Button>
              </Link>
            )}
            
            {title && (
              <div>
                <h1 className="text-lg font-medium text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-foreground/60">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {rightContent}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : 
           theme === 'light' ? <Sun className="w-4 h-4" /> : 
           theme === 'pastel' ? <Palette className="w-4 h-4" /> : 
           <Laptop className="w-4 h-4" />}
        </Button>
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
}

// Specialized navigation for suggestions page
export function SuggestionsNavigation({
  isAuthenticated,
  onAdminClick,
  onLogout
}: {
  isAuthenticated?: boolean
  onAdminClick?: () => void
  onLogout?: () => void
} = {}) {
  const { t } = useTranslation()
  return (
    <PageNavigation
      showBackButton={true}
      backButtonText="Home"
      backButtonPath="/"
      title={t('suggestions.visualizationIdeas')}
      subtitle={t('suggestions.shareCreativeConcepts')}
      rightContent={
        <div className="flex items-center space-x-2">
          <Link href="/suggestions/new">
            <Button size="sm" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
                              <span>{t('suggestions.newIdea')}</span>
            </Button>
          </Link>
          {onAdminClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={isAuthenticated ? onLogout : onAdminClick}
              className="flex items-center space-x-2"
              title={isAuthenticated ? "Logout Admin" : "Admin Access"}
            >
              {isAuthenticated ? (
                <>
                  <Unlock className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Admin</span>
                </>
              )}
            </Button>
          )}
        </div>
      }
    />
  )
}

// Specialized navigation for new suggestion page
export function NewSuggestionNavigation() {
  const { t } = useTranslation()
  return (
    <PageNavigation
      showBackButton={true}
      backButtonText={t('suggestions.ideas')}
      backButtonPath="/suggestions"
      title={t('suggestions.newVisualizationIdea')}
      subtitle={t('suggestions.shareCreativeConcept')}
    />
  )
}

// Unified mobile navigation for suggestions
export function SuggestionsMobileNavigation({
  isAuthenticated,
  onAdminClick,
  onLogout
}: {
  isAuthenticated?: boolean
  onAdminClick?: () => void
  onLogout?: () => void
} = {}) {
  const { t } = useTranslation()
  return (
    <div className="md:hidden rounded-lg border border-border/30 bg-background/60 backdrop-blur-md hover:bg-background/80 hover:backdrop-blur-lg transition-all duration-300 dark:bg-background/40 dark:hover:bg-background/60">
      <div className="w-full px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="mr-2">
              <button className="p-2 rounded-lg hover:bg-accent/40 transition-colors focus:outline-none">
                <Home className="w-5 h-5" />
              </button>
            </Link>
            <div className="text-left">
              <h1 className="text-lg font-medium text-foreground leading-tight">{t('suggestions.visualizationIdeas')}</h1>
              <p className="text-sm text-foreground/60 leading-tight">{t('suggestions.shareCreativeConcepts')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onAdminClick && (
              <button
                onClick={isAuthenticated ? onLogout : onAdminClick}
                className="p-2 rounded-lg hover:bg-accent/40 transition-colors focus:outline-none"
                title={isAuthenticated ? "Logout Admin" : "Admin Access"}
              >
                {isAuthenticated ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </button>
            )}
            <Link href="/suggestions/new">
              <button className="flex items-center justify-center space-x-2 p-2 rounded-lg font-semibold shadow-sm border border-border/30 bg-background/80 text-foreground hover:bg-accent/40 transition-colors min-w-[44px]">
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">{t('suggestions.newIdea')}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Unified mobile navigation for new suggestion page
export function NewSuggestionMobileNavigation() {
  const { t } = useTranslation()
  return (
    <div className="md:hidden rounded-lg border border-border/30 bg-background/60 backdrop-blur-md hover:bg-background/80 hover:backdrop-blur-lg transition-all duration-300 dark:bg-background/40 dark:hover:bg-background/60">
      <div className="w-full px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/suggestions" className="mr-2">
              <button className="p-2 rounded-lg hover:bg-accent/40 transition-colors focus:outline-none">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="text-left">
              <h1 className="text-lg font-medium text-foreground leading-tight">{t('suggestions.newVisualizationIdea')}</h1>
              <p className="text-sm text-foreground/60 leading-tight">{t('suggestions.shareCreativeConcept')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 