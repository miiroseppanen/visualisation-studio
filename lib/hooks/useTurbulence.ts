import { useState, useCallback, useMemo } from 'react'
import { useVisualization } from './useVisualization'
import type { 
  TurbulenceSettings, 
  NoiseSettings, 
  FlowSettings, 
  TurbulenceAnimationSettings, 
  TurbulencePanelState 
} from '../types'
import type { TurbulenceSource } from '../turbulence-physics'
import { generateSourceId, generateSourceName } from '../turbulence-physics'

// Turbulence-specific types that extend the base visualization types
interface TurbulenceVisualizationSettings extends TurbulenceSettings {
  noiseSettings: NoiseSettings
  flowSettings: FlowSettings
}

interface TurbulenceVisualizationAnimationSettings extends TurbulenceAnimationSettings {}

interface TurbulenceVisualizationPanelState extends TurbulencePanelState {}

// Default settings
const DEFAULT_TURBULENCE_SETTINGS: TurbulenceSettings = {
  lineCount: 2000,
  lineLength: 30,
  showSources: true,
  streamlineMode: false,
}

const DEFAULT_NOISE_SETTINGS: NoiseSettings = {
  scale: 0.01,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  seed: Math.random() * 1000,
}

const DEFAULT_FLOW_SETTINGS: FlowSettings = {
  baseVelocity: 0.5,
  baseAngle: 0,
  enabled: true,
}

const DEFAULT_ANIMATION_SETTINGS: TurbulenceAnimationSettings = {
  isAnimating: true,
  speed: 1.0,
  intensity: 1.0,
  time: 0,
}

const DEFAULT_PANEL_STATE: TurbulencePanelState = {
  isOpen: true,
  flowSettingsExpanded: false,
  sourcesExpanded: true,
  noiseExpanded: false,
  animationExpanded: true,
  turbulenceExpanded: true,
}

export function useTurbulence() {
  // Turbulence-specific state that's not covered by the base hook
  const [sources, setSources] = useState<TurbulenceSource[]>([])

  // Use the unified visualization hook with turbulence-specific configuration
  const visualization = useVisualization<
    TurbulenceVisualizationSettings, 
    TurbulenceVisualizationAnimationSettings, 
    TurbulenceVisualizationPanelState
  >({
    initialSettings: {
      ...DEFAULT_TURBULENCE_SETTINGS,
      noiseSettings: DEFAULT_NOISE_SETTINGS,
      flowSettings: DEFAULT_FLOW_SETTINGS,
    },
    initialAnimationSettings: DEFAULT_ANIMATION_SETTINGS,
    initialPanelState: DEFAULT_PANEL_STATE,
    initialPoles: [], // Turbulence uses sources instead of poles
    resetToDefaults: () => ({
      settings: {
        ...DEFAULT_TURBULENCE_SETTINGS,
        noiseSettings: DEFAULT_NOISE_SETTINGS,
        flowSettings: DEFAULT_FLOW_SETTINGS,
      },
      animationSettings: DEFAULT_ANIMATION_SETTINGS,
      panelState: DEFAULT_PANEL_STATE,
      poles: []
    })
  })

  // Turbulence-specific update functions (convenience wrappers)
  const updateTurbulenceSettings = useCallback((updates: Partial<TurbulenceSettings>) => {
    visualization.updateSettings({ ...updates })
  }, [visualization.updateSettings])

  const updateNoiseSettings = useCallback((updates: Partial<NoiseSettings>) => {
    visualization.updateSettings((prev) => ({ 
      noiseSettings: { 
        ...prev.noiseSettings, 
        ...updates 
      } 
    }))
  }, [visualization.updateSettings])

  const updateFlowSettings = useCallback((updates: Partial<FlowSettings>) => {
    visualization.updateSettings((prev) => ({ 
      flowSettings: { 
        ...prev.flowSettings, 
        ...updates 
      } 
    }))
  }, [visualization.updateSettings])

  // Source management functions
  const addSource = useCallback((type: TurbulenceSource['type'], x?: number, y?: number) => {
    const newSource: TurbulenceSource = {
      id: generateSourceId(),
      name: generateSourceName(type, sources.length),
      x: x ?? visualization.canvasSize.width / 2,
      y: y ?? visualization.canvasSize.height / 2,
      strength: 50,
      type,
      angle: 0,
    }
    setSources(prev => [...prev, newSource])
  }, [sources.length, visualization.canvasSize])

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

  // Extract nested settings for backward compatibility (memoized to prevent infinite loops)
  const turbulenceSettings: TurbulenceSettings = useMemo(() => ({
    lineCount: visualization.settings.lineCount,
    lineLength: visualization.settings.lineLength,
    showSources: visualization.settings.showSources,
    streamlineMode: visualization.settings.streamlineMode,
  }), [
    visualization.settings.lineCount,
    visualization.settings.lineLength,
    visualization.settings.showSources,
    visualization.settings.streamlineMode,
  ])

  const noiseSettings = useMemo(() => visualization.settings.noiseSettings, [visualization.settings.noiseSettings])
  const flowSettings = useMemo(() => visualization.settings.flowSettings, [visualization.settings.flowSettings])

  // Interaction handlers that work with the canvas ref from the base hook
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = visualization.canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicking on a source
    const clickedSource = sources.find(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      return distance <= 15 // Source radius for click detection
    })

    if (clickedSource) {
      visualization.setIsDragging(true)
      visualization.setDraggedItemId(clickedSource.id)
    } else {
      // Add new vortex source on click
      addSource('vortex', x, y)
    }
  }, [sources, addSource, visualization])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (visualization.isDragging && visualization.draggedItemId) {
      const canvas = visualization.canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      moveSource(visualization.draggedItemId, x, y)
    }
  }, [visualization.isDragging, visualization.draggedItemId, moveSource, visualization])

  const handleMouseUp = useCallback(() => {
    visualization.setIsDragging(false)
    visualization.setDraggedItemId(null)
  }, [visualization])

  return {
    // Refs (from base hook)
    canvasRef: visualization.canvasRef,
    animationRef: visualization.animationRef,
    
    // Turbulence-specific state
    sources,
    setSources,
    
    // State from base hook with backward compatibility
    turbulenceSettings,
    noiseSettings,
    flowSettings,
    animationSettings: visualization.animationSettings,
    panelState: visualization.panelState,
    isDragging: visualization.isDragging,
    dragSourceId: visualization.draggedItemId,
    canvasSize: visualization.canvasSize,
    
    // Update functions
    updateTurbulenceSettings,
    updateNoiseSettings,
    updateFlowSettings,
    updateAnimationSettings: visualization.updateAnimationSettings,
    updatePanelState: visualization.updatePanelState,
    
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
    handleCanvasResize: visualization.setCanvasSize,
    
    // Reset function
    resetAllSettings: visualization.resetVisualization
  }
} 