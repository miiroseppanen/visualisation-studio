'use client'

import React from 'react'
import { useVisualizationNavigation } from '@/lib/hooks/useVisualizationNavigation'
import VisualizationDropdown from './VisualizationDropdown'

interface VisualizationSwitcherProps {
  className?: string
  hideNonEssential?: boolean
}

/**
 * Focused component for switching between visualizations
 * Handles only visualization selection logic
 */
export default function VisualizationSwitcher({
  className = '',
  hideNonEssential = false
}: VisualizationSwitcherProps) {
  const {
    currentVisualization,
    allVisualizations,
    verifiedVisualizations,
    inProgressVisualizations,
    navigateToVisualization
  } = useVisualizationNavigation()

  return (
    <VisualizationDropdown 
      currentVisualization={currentVisualization}
      allVisualizations={allVisualizations}
      verifiedVisualizations={verifiedVisualizations}
      inProgressVisualizations={inProgressVisualizations}
      onVisualizationSelect={navigateToVisualization}
      className={className}
      hideNonEssential={hideNonEssential}
    />
  )
} 