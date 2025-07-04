import React, { useState, useCallback, useMemo } from 'react'
import { useVisualization } from './useVisualization'
import type { 
  TopographyDisplaySettings, 
  TopographyAnimationSettings as BaseTopographyAnimationSettings, 
  TopographyPanelState as BaseTopographyPanelState 
} from '../types'
import type { ElevationPoint, TopographySettings } from '../topography-physics'
import { generateElevationId, generateElevationName } from '../topography-physics'

// Topography-specific types that extend the base visualization types
interface TopographyVisualizationSettings extends TopographySettings {
  displaySettings: TopographyDisplaySettings
}

// Default settings
const defaultSettings: TopographyVisualizationSettings = {
  contourInterval: 50,
  minElevation: 0,
  maxElevation: 1000,
  smoothing: 0.3,
  resolution: 1.0,
  displaySettings: {
    showElevationPoints: true,
    showContourLines: true,
    showElevationLabels: true,
    showGradientField: false,
    lineWeight: 1.5,
    majorContourWeight: 3.0,
    majorContourInterval: 5,
  }
}

const defaultAnimationSettings: BaseTopographyAnimationSettings = {
  isAnimating: false,
  windSpeed: 1.0,
  windDirection: 0,
  contourPulse: false,
  time: 0,
}

const defaultPanelState: BaseTopographyPanelState = {
  isOpen: true,
  topographySettingsExpanded: true,
  elevationPointsExpanded: true,
  contourSettingsExpanded: false,
  displaySettingsExpanded: false,
  animationExpanded: false,
}

// Initial elevation points
const initialElevationPoints: ElevationPoint[] = [
  {
    id: generateElevationId(),
    name: 'Peak 1',
    x: 300,
    y: 200,
    elevation: 800,
    type: 'peak',
    radius: 150,
  },
  {
    id: generateElevationId(),
    name: 'Valley 1',
    x: 600,
    y: 400,
    elevation: 200,
    type: 'valley',
    radius: 120,
  },
  {
    id: generateElevationId(),
    name: 'Peak 2',
    x: 900,
    y: 250,
    elevation: 900,
    type: 'peak',
    radius: 100,
  },
]

export function useTopography() {
  // Local state for elevation points and interaction
  const [elevationPoints, setElevationPoints] = useState<ElevationPoint[]>(initialElevationPoints)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPointId, setDragPointId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 })

  // Use the unified visualization hook
  const visualization = useVisualization<TopographyVisualizationSettings, BaseTopographyAnimationSettings, BaseTopographyPanelState>({
    initialSettings: defaultSettings,
    initialAnimationSettings: defaultAnimationSettings,
    initialPanelState: defaultPanelState,
    initialPoles: [],
    resetToDefaults: () => ({
      settings: defaultSettings,
      animationSettings: defaultAnimationSettings,
      panelState: defaultPanelState,
      poles: [],
    }),
  })

  // Setup animation using unified utilities
  React.useEffect(() => {
    const cleanup = visualization.startAnimation(
      visualization.animationSettings.isAnimating,
      (frameTime) => {
        visualization.updateAnimationSettings({
          time: visualization.animationSettings.time + frameTime * visualization.animationSettings.windSpeed
        })
      }
    )
    return cleanup
  }, [visualization.animationSettings.isAnimating, visualization.animationSettings.time, visualization.animationSettings.windSpeed, visualization.startAnimation, visualization.updateAnimationSettings])

  // Extract nested settings for backward compatibility (memoized to prevent infinite loops)
  const topographySettings: TopographySettings = useMemo(() => ({
    contourInterval: visualization.settings.contourInterval,
    minElevation: visualization.settings.minElevation,
    maxElevation: visualization.settings.maxElevation,
    smoothing: visualization.settings.smoothing,
    resolution: visualization.settings.resolution,
  }), [
    visualization.settings.contourInterval,
    visualization.settings.minElevation,
    visualization.settings.maxElevation,
    visualization.settings.smoothing,
    visualization.settings.resolution,
  ])

  const displaySettings = useMemo(() => visualization.settings.displaySettings, [visualization.settings.displaySettings])

  // Topography-specific update functions (convenience wrappers)
  const updateTopographySettings = useCallback((updates: Partial<TopographySettings>) => {
    visualization.updateSettings((prev) => {
      const updatedSettings = { ...prev }
      
      // Only update the core topography properties to avoid infinite loops
      if (updates.contourInterval !== undefined) updatedSettings.contourInterval = updates.contourInterval
      if (updates.minElevation !== undefined) updatedSettings.minElevation = updates.minElevation
      if (updates.maxElevation !== undefined) updatedSettings.maxElevation = updates.maxElevation
      if (updates.smoothing !== undefined) updatedSettings.smoothing = updates.smoothing
      if (updates.resolution !== undefined) updatedSettings.resolution = updates.resolution
      
      return updatedSettings
    })
  }, [visualization.updateSettings])

  const updateDisplaySettings = useCallback((updates: Partial<TopographyDisplaySettings>) => {
    visualization.updateSettings((prev) => ({
      ...prev,
      displaySettings: { 
        ...prev.displaySettings, 
        ...updates 
      }
    }))
  }, [visualization.updateSettings])

  // Elevation point management
  const addElevationPoint = useCallback((type: ElevationPoint['type'], x?: number, y?: number) => {
    const newPoint: ElevationPoint = {
      id: generateElevationId(),
      name: generateElevationName(type, elevationPoints.length),
      x: x ?? canvasSize.width / 2,
      y: y ?? canvasSize.height / 2,
      elevation: type === 'peak' ? 800 : type === 'valley' ? 200 : 500,
      type,
      radius: 100,
    }
    setElevationPoints(prev => [...prev, newPoint])
  }, [elevationPoints.length, canvasSize])

  const removeElevationPoint = useCallback((id: string) => {
    setElevationPoints(prev => prev.filter(point => point.id !== id))
  }, [])

  const updateElevationPoint = useCallback((id: string, updates: Partial<ElevationPoint>) => {
    setElevationPoints(prev => prev.map(point => 
      point.id === id ? { ...point, ...updates } : point
    ))
  }, [])

  const moveElevationPoint = useCallback((id: string, x: number, y: number) => {
    updateElevationPoint(id, { x, y })
  }, [updateElevationPoint])

  const clearAllElevationPoints = useCallback(() => {
    setElevationPoints([])
  }, [])

  // Interaction handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicking on an elevation point
    const clickedPoint = elevationPoints.find(point => {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
      return distance <= 15 // Point radius for click detection
    })

    if (clickedPoint) {
      setIsDragging(true)
      setDragPointId(clickedPoint.id)
    } else {
      // Add new peak point on click
      addElevationPoint('peak', x, y)
    }
  }, [elevationPoints, addElevationPoint])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && dragPointId) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      moveElevationPoint(dragPointId, x, y)
    }
  }, [isDragging, dragPointId, moveElevationPoint])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragPointId(null)
  }, [])

  const handleCanvasResize = useCallback((width: number, height: number) => {
    setCanvasSize({ width, height })
  }, [])

  return {
    // Unified visualization interface
    ...visualization,
    
    // Backward compatibility interface
    topographySettings,
    displaySettings,
    animationSettings: visualization.animationSettings,
    panelState: visualization.panelState,
    
    // Elevation points
    elevationPoints,
    
    // Interaction state
    isDragging,
    dragPointId,
    canvasSize,
    
    // Update functions
    updateTopographySettings,
    updateDisplaySettings,
    updateAnimationSettings: visualization.updateAnimationSettings,
    updatePanelState: visualization.updatePanelState,
    
    // Elevation point management
    addElevationPoint,
    removeElevationPoint,
    updateElevationPoint,
    moveElevationPoint,
    clearAllElevationPoints,
    
    // Interaction handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasResize,
  }
}

export type UseTopographyReturn = ReturnType<typeof useTopography> 