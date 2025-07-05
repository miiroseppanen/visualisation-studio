'use client'

import React from 'react'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'

interface SimpleNavigationProps {
  onReset?: () => void
  onExportSVG?: () => void
  additionalActionButtons?: React.ReactNode
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  className?: string
  hideNonEssential?: boolean
}

/**
 * Simple unified navigation component
 * Combines desktop and mobile navigation with minimal API
 */
export default function SimpleNavigation({
  onReset,
  onExportSVG,
  additionalActionButtons,
  showBackButton = true,
  backButtonText = 'Home',
  backButtonFallback = '/',
  className = '',
  hideNonEssential = false
}: SimpleNavigationProps) {
  return (
    <div className={className}>
      <DesktopNavigation
        onReset={onReset}
        onExportSVG={onExportSVG}
        additionalActionButtons={additionalActionButtons}
        showBackButton={showBackButton}
        backButtonText={backButtonText}
        backButtonFallback={backButtonFallback}
        hideNonEssential={hideNonEssential}
      />
      
      <MobileNavigation
        onReset={onReset}
        onExportSVG={onExportSVG}
        additionalActionButtons={additionalActionButtons}
        showBackButton={showBackButton}
        backButtonText={backButtonText}
        backButtonFallback={backButtonFallback}
        hideNonEssential={hideNonEssential}
      />
    </div>
  )
} 