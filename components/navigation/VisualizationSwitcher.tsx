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
    navigateToVisualization
  } = useVisualizationNavigation()

  return (
    <VisualizationDropdown 
      currentVisualization={currentVisualization}
      allVisualizations={allVisualizations}
      onVisualizationSelect={navigateToVisualization}
      className={className}
      hideNonEssential={hideNonEssential}
    />
  )
} 