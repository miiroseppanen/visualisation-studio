import { usePathname } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import { visualizationOptions, getVisualizationByPath, type VisualizationOption } from '../navigation-config'
import { useNavigation } from './useNavigation'
import { pauseAllAnimations } from '../utils'

interface VisualizationNavigationState {
  currentVisualization: VisualizationOption | null
  allVisualizations: VisualizationOption[]
}

interface VisualizationNavigationActions {
  navigateToVisualization: (id: string) => void
}

export interface UseVisualizationNavigationReturn 
  extends VisualizationNavigationState, VisualizationNavigationActions {}

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

  const navigateToVisualization = useCallback((id: string) => {
    // Pause all animations before navigating to prevent interference
    pauseAllAnimations()
    
    const visualization = visualizationOptions.find(viz => viz.id === id)
    if (visualization) {
      navigateToPath(visualization.path)
    } else {
      console.warn(`No visualization found with id: ${id}`)
    }
  }, [navigateToPath])

  return {
    currentVisualization,
    allVisualizations: visualizationOptions,
    navigateToVisualization,
  }
} 