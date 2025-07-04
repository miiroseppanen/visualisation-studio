import { useState, useCallback, useMemo } from 'react'
import { useVisualization } from './useVisualization'
import type { 
  Pole, 
  GridLine, 
  GridSettings, 
  AnimationSettings, 
  DirectionSettings, 
  PolaritySettings, 
  ZoomSettings,
  PanelState 
} from '../types'
import { 
  DEFAULT_GRID_SPACING,
  DEFAULT_LINE_LENGTH, 
  DEFAULT_CURVE_STIFFNESS,
  DEFAULT_WIND_STRENGTH,
  DEFAULT_WIND_SPEED,
  DEFAULT_DIRECTION_ANGLE,
  DEFAULT_DIRECTION_STRENGTH,
  DEFAULT_ZOOM_LEVEL,
  DEFAULT_GRID_SPACING as BASE_GRID_SPACING,
  DEFAULT_LINE_LENGTH as BASE_LINE_LENGTH,
  INITIAL_POLE
} from '../constants'

// Grid-specific types that extend the base visualization types
interface GridVisualizationSettings extends GridSettings {
  directionSettings: DirectionSettings
  polaritySettings: PolaritySettings
  zoomSettings: ZoomSettings
}

interface GridAnimationSettings extends AnimationSettings {}

interface GridPanelState extends PanelState {}

export function useGridField() {
  // Grid-specific state that's not covered by the base hook
  const [gridLines, setGridLines] = useState<GridLine[]>([])

  // Use the unified visualization hook with grid-specific configuration
  const visualization = useVisualization<GridVisualizationSettings, GridAnimationSettings, GridPanelState>({
    initialSettings: {
      spacing: DEFAULT_GRID_SPACING,
      lineLength: DEFAULT_LINE_LENGTH,
      type: 'rectangular',
      curveStiffness: DEFAULT_CURVE_STIFFNESS,
      showPoles: true,
      directionSettings: {
        enabled: true,
        angle: DEFAULT_DIRECTION_ANGLE,
        strength: DEFAULT_DIRECTION_STRENGTH
      },
      polaritySettings: {
        attractToPoles: true
      },
      zoomSettings: {
        level: DEFAULT_ZOOM_LEVEL,
        baseGridSpacing: BASE_GRID_SPACING,
        baseLineLength: BASE_LINE_LENGTH
      }
    },
    initialAnimationSettings: {
      isAnimating: true,
      windStrength: DEFAULT_WIND_STRENGTH,
      windSpeed: DEFAULT_WIND_SPEED,
      time: 0
    },
    initialPanelState: {
      isOpen: true,
      gridSettingsExpanded: true,
      defaultDirectionExpanded: true,
      polesExpanded: true,
      animationExpanded: true
    },
    initialPoles: [INITIAL_POLE],
    resetToDefaults: () => ({
      settings: {
        spacing: DEFAULT_GRID_SPACING,
        lineLength: DEFAULT_LINE_LENGTH,
        type: 'rectangular',
        curveStiffness: DEFAULT_CURVE_STIFFNESS,
        showPoles: true,
        directionSettings: {
          enabled: true,
          angle: DEFAULT_DIRECTION_ANGLE,
          strength: DEFAULT_DIRECTION_STRENGTH
        },
        polaritySettings: {
          attractToPoles: true
        },
        zoomSettings: {
          level: DEFAULT_ZOOM_LEVEL,
          baseGridSpacing: BASE_GRID_SPACING,
          baseLineLength: BASE_LINE_LENGTH
        }
      },
      animationSettings: {
        isAnimating: true,
        windStrength: DEFAULT_WIND_STRENGTH,
        windSpeed: DEFAULT_WIND_SPEED,
        time: 0
      },
      panelState: {
        isOpen: true,
        gridSettingsExpanded: true,
        defaultDirectionExpanded: true,
        polesExpanded: true,
        animationExpanded: true
      },
      poles: [INITIAL_POLE]
    })
  })

  // Grid-specific update functions (convenience wrappers)
  const updateGridSettings = useCallback((updates: Partial<GridSettings>) => {
    visualization.updateSettings({ ...updates })
  }, [visualization.updateSettings])

  const updateDirectionSettings = useCallback((updates: Partial<DirectionSettings>) => {
    visualization.updateSettings((prev) => ({ 
      directionSettings: { 
        ...prev.directionSettings, 
        ...updates 
      } 
    }))
  }, [visualization.updateSettings])

  const updatePolaritySettings = useCallback((updates: Partial<PolaritySettings>) => {
    visualization.updateSettings((prev) => ({ 
      polaritySettings: { 
        ...prev.polaritySettings, 
        ...updates 
      } 
    }))
  }, [visualization.updateSettings])

  const updateZoomSettings = useCallback((updates: Partial<ZoomSettings>) => {
    visualization.updateSettings((prev) => ({ 
      zoomSettings: { 
        ...prev.zoomSettings, 
        ...updates 
      } 
    }))
  }, [visualization.updateSettings])

  // Extract nested settings for backward compatibility (memoized to prevent infinite loops)
  const gridSettings: GridSettings = useMemo(() => ({
    spacing: visualization.settings.spacing,
    lineLength: visualization.settings.lineLength,
    type: visualization.settings.type,
    curveStiffness: visualization.settings.curveStiffness,
    showPoles: visualization.settings.showPoles
  }), [
    visualization.settings.spacing,
    visualization.settings.lineLength,
    visualization.settings.type,
    visualization.settings.curveStiffness,
    visualization.settings.showPoles
  ])

  const directionSettings = useMemo(() => visualization.settings.directionSettings, [visualization.settings.directionSettings])
  const polaritySettings = useMemo(() => visualization.settings.polaritySettings, [visualization.settings.polaritySettings])
  const zoomSettings = useMemo(() => visualization.settings.zoomSettings, [visualization.settings.zoomSettings])

  return {
    // Refs (from base hook)
    canvasRef: visualization.canvasRef,
    animationRef: visualization.animationRef,
    
    // Grid-specific state
    gridLines,
    setGridLines,
    
    // State from base hook with backward compatibility
    poles: visualization.poles,
    setPoles: visualization.setPoles,
    gridSettings,
    animationSettings: visualization.animationSettings,
    directionSettings,
    polaritySettings,
    zoomSettings,
    isDragging: visualization.isDragging,
    setIsDragging: visualization.setIsDragging,
    draggedPoleId: visualization.draggedItemId,
    setDraggedPoleId: visualization.setDraggedItemId,
    panelState: visualization.panelState,
    
    // Update functions
    updateGridSettings,
    updateAnimationSettings: visualization.updateAnimationSettings,
    updateDirectionSettings,
    updatePolaritySettings,
    updateZoomSettings,
    updatePanelState: visualization.updatePanelState,
    resetAllSettings: visualization.resetVisualization
  }
} 