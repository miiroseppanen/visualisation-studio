import { useState, useCallback, useRef, useEffect } from 'react'
import type { 
  TurbulenceSettings, 
  NoiseSettings, 
  FlowSettings, 
  TurbulenceAnimationSettings, 
  TurbulencePanelState 
} from '../types'
import type { TurbulenceSource } from '../turbulence-physics'
import { generateSourceId, generateSourceName } from '../turbulence-physics'

export interface UseTurbulenceReturn {
  // Settings
  turbulenceSettings: TurbulenceSettings
  noiseSettings: NoiseSettings
  flowSettings: FlowSettings
  animationSettings: TurbulenceAnimationSettings
  panelState: TurbulencePanelState
  
  // Sources
  sources: TurbulenceSource[]
  
  // Interaction state
  isDragging: boolean
  dragSourceId: string | null
  canvasSize: { width: number; height: number }
  
  // Update functions
  updateTurbulenceSettings: (updates: Partial<TurbulenceSettings>) => void
  updateNoiseSettings: (updates: Partial<NoiseSettings>) => void
  updateFlowSettings: (updates: Partial<FlowSettings>) => void
  updateAnimationSettings: (updates: Partial<TurbulenceAnimationSettings>) => void
  updatePanelState: (updates: Partial<TurbulencePanelState>) => void
  
  // Source management
  addSource: (type: TurbulenceSource['type'], x?: number, y?: number) => void
  removeSource: (id: string) => void
  updateSource: (id: string, updates: Partial<TurbulenceSource>) => void
  moveSource: (id: string, x: number, y: number) => void
  clearAllSources: () => void
  
  // Interaction handlers
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: () => void
  handleCanvasResize: (width: number, height: number) => void
}

export function useTurbulence(): UseTurbulenceReturn {
  // Settings state
  const [turbulenceSettings, setTurbulenceSettings] = useState<TurbulenceSettings>({
    lineCount: 2000,
    lineLength: 30,
    showSources: true,
    streamlineMode: false,
  })

  const [noiseSettings, setNoiseSettings] = useState<NoiseSettings>({
    scale: 0.01,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    seed: Math.random() * 1000,
  })

  const [flowSettings, setFlowSettings] = useState<FlowSettings>({
    baseVelocity: 0.5,
    baseAngle: 0,
    enabled: true,
  })

  const [animationSettings, setAnimationSettings] = useState<TurbulenceAnimationSettings>({
    isAnimating: true,
    speed: 1.0,
    intensity: 1.0,
    time: 0,
  })

  const [panelState, setPanelState] = useState<TurbulencePanelState>({
    flowSettingsExpanded: false,
    sourcesExpanded: true,
    noiseExpanded: false,
    animationExpanded: true,
    turbulenceExpanded: true,
  })

  // Sources and interaction state
  const [sources, setSources] = useState<TurbulenceSource[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragSourceId, setDragSourceId] = useState<string | null>(null)
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
          time: prev.time + (deltaTime * 0.001 * prev.speed)
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
  }, [animationSettings.isAnimating, animationSettings.speed])

  // Update functions
  const updateTurbulenceSettings = useCallback((updates: Partial<TurbulenceSettings>) => {
    setTurbulenceSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateNoiseSettings = useCallback((updates: Partial<NoiseSettings>) => {
    setNoiseSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateFlowSettings = useCallback((updates: Partial<FlowSettings>) => {
    setFlowSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateAnimationSettings = useCallback((updates: Partial<TurbulenceAnimationSettings>) => {
    setAnimationSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updatePanelState = useCallback((updates: Partial<TurbulencePanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }, [])

  // Source management
  const addSource = useCallback((type: TurbulenceSource['type'], x?: number, y?: number) => {
    const newSource: TurbulenceSource = {
      id: generateSourceId(),
      name: generateSourceName(type, sources.length),
      x: x ?? canvasSize.width / 2,
      y: y ?? canvasSize.height / 2,
      strength: 50,
      type,
      angle: 0,
    }
    setSources(prev => [...prev, newSource])
  }, [sources.length, canvasSize])

  const removeSource = useCallback((id: string) => {
    setSources(prev => prev.filter(source => source.id !== id))
  }, [])

  const updateSource = useCallback((id: string, updates: Partial<TurbulenceSource>) => {
    setSources(prev => prev.map(source => 
      source.id === id ? { ...source, ...updates } : source
    ))
  }, [])

  const moveSource = useCallback((id: string, x: number, y: number) => {
    updateSource(id, { x, y })
  }, [updateSource])

  const clearAllSources = useCallback(() => {
    setSources([])
  }, [])

  // Interaction handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicking on a source
    const clickedSource = sources.find(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      return distance <= 15 // Source radius for click detection
    })

    if (clickedSource) {
      setIsDragging(true)
      setDragSourceId(clickedSource.id)
    } else {
      // Add new vortex source on click
      addSource('vortex', x, y)
    }
  }, [sources, addSource])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && dragSourceId) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      moveSource(dragSourceId, x, y)
    }
  }, [isDragging, dragSourceId, moveSource])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragSourceId(null)
  }, [])

  const handleCanvasResize = useCallback((width: number, height: number) => {
    setCanvasSize({ width, height })
  }, [])

  return {
    // Settings
    turbulenceSettings,
    noiseSettings,
    flowSettings,
    animationSettings,
    panelState,
    
    // Sources
    sources,
    
    // Interaction state
    isDragging,
    dragSourceId,
    canvasSize,
    
    // Update functions
    updateTurbulenceSettings,
    updateNoiseSettings,
    updateFlowSettings,
    updateAnimationSettings,
    updatePanelState,
    
    // Source management
    addSource,
    removeSource,
    updateSource,
    moveSource,
    clearAllSources,
    
    // Interaction handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasResize,
  }
} 