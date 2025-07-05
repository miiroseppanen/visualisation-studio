'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Lightbulb, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/ThemeProvider'
import { Sun, Moon, Laptop } from 'lucide-react'
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
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-foreground/5 border border-foreground/10 rounded flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-foreground/60" />
                </div>
                <div>
                  <h1 className="text-lg font-medium text-foreground">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-foreground/60">{subtitle}</p>
                  )}
                </div>
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
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
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
          <DropdownMenuRadioItem value="system">
            <Laptop className="w-4 h-4 mr-2 inline" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Specialized navigation for suggestions page
export function SuggestionsNavigation() {
  return (
    <PageNavigation
      showBackButton={true}
      backButtonText="Home"
      backButtonPath="/"
      title="Visualization Suggestions"
      subtitle="Share ideas and vote on new visualizations"
      rightContent={
        <Link href="/suggestions/new">
          <Button size="sm" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Suggestion</span>
          </Button>
        </Link>
      }
    />
  )
}

// Specialized navigation for new suggestion page
export function NewSuggestionNavigation() {
  return (
    <PageNavigation
      showBackButton={true}
      backButtonText="Suggestions"
      backButtonPath="/suggestions"
      title="New Suggestion"
      subtitle="Create a new visualization idea"
    />
  )
} 