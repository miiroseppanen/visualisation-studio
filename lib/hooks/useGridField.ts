import { useState, useRef } from 'react'
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

export function useGridField() {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Core state
  const [gridLines, setGridLines] = useState<GridLine[]>([])
  const [poles, setPoles] = useState<Pole[]>([INITIAL_POLE])
  
  // Grid settings
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    spacing: DEFAULT_GRID_SPACING,
    lineLength: DEFAULT_LINE_LENGTH,
    type: 'rectangular',
    curveStiffness: DEFAULT_CURVE_STIFFNESS,
    showPoles: true
  })

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    isAnimating: true,
    windStrength: DEFAULT_WIND_STRENGTH,
    windSpeed: DEFAULT_WIND_SPEED,
    time: 0
  })

  // Direction settings
  const [directionSettings, setDirectionSettings] = useState<DirectionSettings>({
    enabled: true,
    angle: DEFAULT_DIRECTION_ANGLE,
    strength: DEFAULT_DIRECTION_STRENGTH
  })

  // Polarity settings
  const [polaritySettings, setPolaritySettings] = useState<PolaritySettings>({
    attractToPoles: true
  })

  // Zoom settings
  const [zoomSettings, setZoomSettings] = useState<ZoomSettings>({
    level: DEFAULT_ZOOM_LEVEL,
    baseGridSpacing: BASE_GRID_SPACING,
    baseLineLength: BASE_LINE_LENGTH
  })

  // Interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [draggedPoleId, setDraggedPoleId] = useState<string | null>(null)

  // Panel state
  const [panelState, setPanelState] = useState<PanelState>({
    gridSettingsExpanded: true,
    defaultDirectionExpanded: true,
    polesExpanded: true,
    animationExpanded: true
  })

  // Update functions
  const updateGridSettings = (updates: Partial<GridSettings>) => {
    setGridSettings(prev => ({ ...prev, ...updates }))
  }

  const updateAnimationSettings = (updates: Partial<AnimationSettings>) => {
    setAnimationSettings(prev => ({ ...prev, ...updates }))
  }

  const updateDirectionSettings = (updates: Partial<DirectionSettings>) => {
    setDirectionSettings(prev => ({ ...prev, ...updates }))
  }

  const updatePolaritySettings = (updates: Partial<PolaritySettings>) => {
    setPolaritySettings(prev => ({ ...prev, ...updates }))
  }

  const updateZoomSettings = (updates: Partial<ZoomSettings>) => {
    setZoomSettings(prev => ({ ...prev, ...updates }))
  }

  const updatePanelState = (updates: Partial<PanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }

  // Reset function
  const resetAllSettings = () => {
    setPoles([INITIAL_POLE])
    setGridSettings({
      spacing: DEFAULT_GRID_SPACING,
      lineLength: DEFAULT_LINE_LENGTH,
      type: 'rectangular',
      curveStiffness: DEFAULT_CURVE_STIFFNESS,
      showPoles: true
    })
    setAnimationSettings({
      isAnimating: true,
      windStrength: DEFAULT_WIND_STRENGTH,
      windSpeed: DEFAULT_WIND_SPEED,
      time: 0
    })
    setDirectionSettings({
      enabled: true,
      angle: DEFAULT_DIRECTION_ANGLE,
      strength: DEFAULT_DIRECTION_STRENGTH
    })
    setPolaritySettings({
      attractToPoles: true
    })
    setZoomSettings({
      level: DEFAULT_ZOOM_LEVEL,
      baseGridSpacing: BASE_GRID_SPACING,
      baseLineLength: BASE_LINE_LENGTH
    })
    setPanelState({
      gridSettingsExpanded: true,
      defaultDirectionExpanded: true,
      polesExpanded: true,
      animationExpanded: true
    })
  }

  return {
    // Refs
    canvasRef,
    animationRef,
    
    // State
    gridLines,
    setGridLines,
    poles,
    setPoles,
    gridSettings,
    animationSettings,
    directionSettings,
    polaritySettings,
    zoomSettings,
    isDragging,
    setIsDragging,
    draggedPoleId,
    setDraggedPoleId,
    panelState,
    
    // Update functions
    updateGridSettings,
    updateAnimationSettings,
    updateDirectionSettings,
    updatePolaritySettings,
    updateZoomSettings,
    updatePanelState,
    resetAllSettings
  }
} 