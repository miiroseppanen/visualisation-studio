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
import { 
  DEFAULT_TURBULENCE_LINE_COUNT, 
  DEFAULT_TURBULENCE_LINE_LENGTH,
  DEFAULT_STREAMLINE_STEPS,
  DEFAULT_STREAMLINE_STEP_SIZE
} from '../constants'

// Turbulence-specific types that extend the base visualization types
interface TurbulenceVisualizationSettings extends TurbulenceSettings {
  noiseSettings: NoiseSettings
  flowSettings: FlowSettings
  sources: TurbulenceSource[]
}

interface TurbulenceVisualizationAnimationSettings extends TurbulenceAnimationSettings {}

interface TurbulenceVisualizationPanelState extends TurbulencePanelState {}

// Default settings
const DEFAULT_TURBULENCE_SETTINGS: TurbulenceSettings = {
  lineCount: DEFAULT_TURBULENCE_LINE_COUNT,
  lineLength: DEFAULT_TURBULENCE_LINE_LENGTH,
  showSources: true,
  streamlineMode: false,
  streamlineSteps: DEFAULT_STREAMLINE_STEPS,
  streamlineStepSize: DEFAULT_STREAMLINE_STEP_SIZE,
  sources: [],
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
  // Remove local sources state
  // const [sources, setSources] = useState<TurbulenceSource[]>([])

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
      sources: [], // Add sources to main state
    },
    initialAnimationSettings: DEFAULT_ANIMATION_SETTINGS,
    initialPanelState: DEFAULT_PANEL_STATE,
    initialPoles: [], // Turbulence uses sources instead of poles
    resetToDefaults: () => ({
      settings: {
        ...DEFAULT_TURBULENCE_SETTINGS,
        noiseSettings: DEFAULT_NOISE_SETTINGS,
        flowSettings: DEFAULT_FLOW_SETTINGS,
        sources: [],
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

  // Source management functions (now update main visualization state)
  const addSource = useCallback((type: TurbulenceSource['type'], x?: number, y?: number) => {
    const sources = visualization.settings.sources || []
    
    // Get canvas dimensions, with fallback defaults
    const canvasWidth = visualization.canvasSize?.width || 800
    const canvasHeight = visualization.canvasSize?.height || 600
    
    const newSource: TurbulenceSource = {
      id: generateSourceId(),
      name: generateSourceName(type, sources.length),
      x: x ?? canvasWidth / 2,
      y: y ?? canvasHeight / 2,
      strength: 50,
      type,
      angle: 0,
    }
    visualization.updateSettings({ sources: [...sources, newSource] })
  }, [visualization.settings.sources, visualization.canvasSize])

  const removeSource = useCallback((id: string) => {
    const sources = visualization.settings.sources || []
    visualization.updateSettings({ sources: sources.filter(source => source.id !== id) })
  }, [visualization.settings.sources])

  const updateSource = useCallback((id: string, updates: Partial<TurbulenceSource>) => {
    const sources = visualization.settings.sources || []
    visualization.updateSettings({ sources: sources.map(source => 
      source.id === id ? { ...source, ...updates } : source
    ) })
  }, [visualization.settings.sources])

  const moveSource = useCallback((id: string, x: number, y: number) => {
    updateSource(id, { x, y })
  }, [updateSource])

  const clearAllSources = useCallback(() => {
    visualization.updateSettings({ sources: [] })
  }, [])

  // Extract nested settings for backward compatibility (memoized to prevent infinite loops)
  const turbulenceSettings: TurbulenceSettings = useMemo(() => ({
    lineCount: visualization.settings.lineCount,
    lineLength: visualization.settings.lineLength,
    showSources: visualization.settings.showSources,
    streamlineMode: visualization.settings.streamlineMode,
    streamlineSteps: visualization.settings.streamlineSteps || DEFAULT_STREAMLINE_STEPS,
    streamlineStepSize: visualization.settings.streamlineStepSize || DEFAULT_STREAMLINE_STEP_SIZE,
    sources: visualization.settings.sources || [],
  }), [
    visualization.settings.lineCount,
    visualization.settings.lineLength,
    visualization.settings.showSources,
    visualization.settings.streamlineMode,
    visualization.settings.streamlineSteps,
    visualization.settings.streamlineStepSize,
    visualization.settings.sources,
  ])

  const noiseSettings = useMemo(() => visualization.settings.noiseSettings, [visualization.settings.noiseSettings])
  const flowSettings = useMemo(() => visualization.settings.flowSettings, [visualization.settings.flowSettings])
  const sources = useMemo(() => visualization.settings.sources || [], [visualization.settings.sources])

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
    setSources: undefined, // no longer needed
    
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