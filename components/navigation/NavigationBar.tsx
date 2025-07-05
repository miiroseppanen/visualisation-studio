'use client'

import React from 'react'
import { useNavigation } from '@/lib/hooks/useNavigation'
import NavigationBackButton from './NavigationBackButton'
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

interface NavigationBarProps {
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  className?: string
  hideNonEssential?: boolean
}

/**
 * Simple navigation bar component
 * Provides basic navigation structure without complex logic
 */
export default function NavigationBar({
  showBackButton = true,
  backButtonText = 'Home',
  backButtonFallback = '/',
  leftContent,
  rightContent,
  className = '',
  hideNonEssential = false
}: NavigationBarProps) {
  const { navigateHome } = useNavigation()

  const handleBackClick = () => {
    navigateHome()
  }

  return (
    <div className={`m-4 rounded-lg border border-border/30 bg-background/60 backdrop-blur-md hover:bg-background/80 hover:backdrop-blur-lg transition-all duration-300 dark:bg-background/40 dark:hover:bg-background/60 ${className}`}>
      <div className="w-full px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBackButton && !hideNonEssential && (
              <NavigationBackButton 
                onBack={handleBackClick}
                text={backButtonText}
              />
            )}
            {leftContent}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {!hideNonEssential && rightContent}
            {!hideNonEssential && <ThemeSwitcher />}
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
  )
} 