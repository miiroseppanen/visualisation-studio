import { usePathname } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { getVisualizationsForNavigation, getVisualizationByPath, getVerifiedVisualizations, getInProgressVisualizations, type VisualizationOption } from '../navigation-config'
import { useNavigation } from './useNavigation'
import { pauseAllAnimations } from '../utils'

interface VisualizationNavigationState {
  currentVisualization: VisualizationOption | null
  allVisualizations: VisualizationOption[]
  verifiedVisualizations: VisualizationOption[]
  inProgressVisualizations: VisualizationOption[]
}

interface UseVisualizationNavigationReturn extends VisualizationNavigationState {
  navigateToVisualization: (id: string) => void
}

/**
 * Visualization-specific navigation hook
 * Combines general navigation with visualization metadata
 */
export function useVisualizationNavigation(): UseVisualizationNavigationReturn {
  const pathname = usePathname()
  const { navigateToPath } = useNavigation()

  const currentVisualization = useMemo(() => {
    return getVisualizationByPath(pathname) || null
  }, [pathname])

  const allVisualizations = useMemo(() => {
    return getVisualizationsForNavigation()
  }, [])

  const verifiedVisualizations = useMemo(() => {
    return getVerifiedVisualizations()
  }, [])

  const inProgressVisualizations = useMemo(() => {
    return getInProgressVisualizations()
  }, [])

  const navigateToVisualization = useCallback((id: string) => {
    // Pause all animations before navigating to prevent interference
    pauseAllAnimations()
    
    const visualization = allVisualizations.find(viz => viz.id === id)
    if (visualization) {
      navigateToPath(visualization.path)
    } else {
      console.warn(`No visualization found with id: ${id}`)
    }
  }, [navigateToPath, allVisualizations])

  return {
    currentVisualization,
    allVisualizations,
    verifiedVisualizations,
    inProgressVisualizations,
    navigateToVisualization,
  }
} 