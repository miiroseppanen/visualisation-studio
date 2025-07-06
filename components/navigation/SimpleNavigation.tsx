'use client'

import React from 'react'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'
import { useTranslation } from 'react-i18next'

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
  backButtonText,
  backButtonFallback = '/',
  className = '',
  hideNonEssential = false
}: SimpleNavigationProps) {
  const { t } = useTranslation()
  const defaultBackButtonText = t('navigation.home')
  return (
    <div className={className}>
      <DesktopNavigation
        onReset={onReset}
        onExportSVG={onExportSVG}
        additionalActionButtons={additionalActionButtons}
        showBackButton={showBackButton}
        backButtonText={backButtonText || defaultBackButtonText}
        backButtonFallback={backButtonFallback}
        hideNonEssential={hideNonEssential}
      />
      
      <MobileNavigation
        onReset={onReset}
        onExportSVG={onExportSVG}
        additionalActionButtons={additionalActionButtons}
        showBackButton={showBackButton}
        backButtonText={backButtonText || defaultBackButtonText}
        backButtonFallback={backButtonFallback}
        hideNonEssential={hideNonEssential}
      />
    </div>
  )
} 