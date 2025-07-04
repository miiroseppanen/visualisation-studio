'use client'

import React from 'react'
import NavigationBar from './NavigationBar'
import VisualizationSwitcher from './VisualizationSwitcher'
import NavigationActionButtons from './NavigationActionButtons'

interface DesktopNavigationProps {
  onReset?: () => void
  onExportSVG?: () => void
  additionalActionButtons?: React.ReactNode
  showBackButton?: boolean
  backButtonText?: string
  backButtonFallback?: string
  className?: string
}

/**
 * Desktop navigation component
 * Combines navigation bar with visualization switching and actions
 */
export default function DesktopNavigation({
  onReset,
  onExportSVG,
  additionalActionButtons,
  showBackButton = true,
  backButtonText = 'Home',
  backButtonFallback = '/',
  className = ''
}: DesktopNavigationProps) {
  return (
    <div className={`hidden md:block ${className}`}>
      <NavigationBar
        showBackButton={showBackButton}
        backButtonText={backButtonText}
        backButtonFallback={backButtonFallback}
        leftContent={<VisualizationSwitcher />}
        rightContent={
          <NavigationActionButtons
            onReset={onReset}
            onExportSVG={onExportSVG}
            additionalButtons={additionalActionButtons}
          />
        }
      />
    </div>
  )
} 