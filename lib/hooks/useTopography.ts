import { useState, useCallback, useRef, useEffect } from 'react'
import type { 
  TopographyDisplaySettings,
  TopographyAnimationSettings,
  TopographyPanelState
} from '../types'
import type { ElevationPoint, TopographySettings } from '../topography-physics'
import { generateElevationId, generateElevationName } from '../topography-physics'

export interface UseTopographyReturn {
  // Settings
  topographySettings: TopographySettings
  displaySettings: TopographyDisplaySettings
  animationSettings: TopographyAnimationSettings
  panelState: TopographyPanelState
  
  // Elevation points
  elevationPoints: ElevationPoint[]
  
  // Interaction state
  isDragging: boolean
  dragPointId: string | null
  canvasSize: { width: number; height: number }
  
  // Update functions
  updateTopographySettings: (updates: Partial<TopographySettings>) => void
  updateDisplaySettings: (updates: Partial<TopographyDisplaySettings>) => void
  updateAnimationSettings: (updates: Partial<TopographyAnimationSettings>) => void
  updatePanelState: (updates: Partial<TopographyPanelState>) => void
  
  // Elevation point management
  addElevationPoint: (type: ElevationPoint['type'], x?: number, y?: number) => void
  removeElevationPoint: (id: string) => void
  updateElevationPoint: (id: string, updates: Partial<ElevationPoint>) => void
  moveElevationPoint: (id: string, x: number, y: number) => void
  clearAllElevationPoints: () => void
  
  // Interaction handlers
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: () => void
  handleCanvasResize: (width: number, height: number) => void
}

export function useTopography(): UseTopographyReturn {
  // Settings state
  const [topographySettings, setTopographySettings] = useState<TopographySettings>({
    contourInterval: 50,
    minElevation: 0,
    maxElevation: 1000,
    smoothing: 0.3,
    resolution: 1.0,
  })

  const [displaySettings, setDisplaySettings] = useState<TopographyDisplaySettings>({
    showElevationPoints: true,
    showContourLines: true,
    showElevationLabels: true,
    showGradientField: false,
    lineWeight: 1.5,
    majorContourWeight: 3.0,
    majorContourInterval: 5, // Every 5th contour is major
  })

  const [animationSettings, setAnimationSettings] = useState<TopographyAnimationSettings>({
    isAnimating: false,
    windSpeed: 1.0,
    windDirection: 0,
    contourPulse: false,
    time: 0,
  })

  const [panelState, setPanelState] = useState<TopographyPanelState>({
    topographySettingsExpanded: true,
    elevationPointsExpanded: true,
    contourSettingsExpanded: false,
    displaySettingsExpanded: false,
    animationExpanded: false,
  })

  // Elevation points and interaction state
  const [elevationPoints, setElevationPoints] = useState<ElevationPoint[]>([
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
  ])

  const [isDragging, setIsDragging] = useState(false)
  const [dragPointId, setDragPointId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 })

  // Animation loop
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (animationSettings.isAnimating) {
      const animate = (currentTime: number) => {
        const deltaTime = currentTime - lastTimeRef.current
        lastTimeRef.current = currentTime

        setAnimationSettings(prev => ({
          ...prev,
          time: prev.time + (deltaTime * 0.001 * prev.windSpeed)
        }))

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animationSettings.isAnimating, animationSettings.windSpeed])

  // Update functions
  const updateTopographySettings = useCallback((updates: Partial<TopographySettings>) => {
    setTopographySettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateDisplaySettings = useCallback((updates: Partial<TopographyDisplaySettings>) => {
    setDisplaySettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateAnimationSettings = useCallback((updates: Partial<TopographyAnimationSettings>) => {
    setAnimationSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updatePanelState = useCallback((updates: Partial<TopographyPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }, [])

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
    // Settings
    topographySettings,
    displaySettings,
    animationSettings,
    panelState,
    
    // Elevation points
    elevationPoints,
    
    // Interaction state
    isDragging,
    dragPointId,
    canvasSize,
    
    // Update functions
    updateTopographySettings,
    updateDisplaySettings,
    updateAnimationSettings,
    updatePanelState,
    
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