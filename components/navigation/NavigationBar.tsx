'use client'

import React from 'react'
import { useNavigation } from '@/lib/hooks/useNavigation'
import NavigationBackButton from './NavigationBackButton'

interface NavigationBarProps {
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  className?: string
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
  className = ''
}: NavigationBarProps) {
  const { navigateBack } = useNavigation()

  const handleBackClick = () => {
    navigateBack(backButtonFallback)
  }

  return (
    <div className={`border-b border-border/40 bg-background/95 backdrop-blur-sm ${className}`}>
      <div className="w-full px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <NavigationBackButton 
                onBack={handleBackClick}
                text={backButtonText}
              />
            )}
            {leftContent}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  )
} 