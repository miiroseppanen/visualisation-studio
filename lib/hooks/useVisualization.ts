import { useState, useRef, useCallback, useEffect } from 'react'
import type { Pole } from '../types'

// Generic types for the unified hook
export interface VisualizationState<TSettings, TAnimationSettings, TPanelState> {
  settings: TSettings
  animationSettings: TAnimationSettings
  panelState: TPanelState
  poles: Pole[]
  isDragging: boolean
  draggedItemId: string | null
  canvasSize: { width: number; height: number }
}

export interface VisualizationActions<TSettings, TAnimationSettings, TPanelState> {
  updateSettings: (updates: Partial<TSettings> | ((prev: TSettings) => Partial<TSettings>)) => void
  updateAnimationSettings: (updates: Partial<TAnimationSettings>) => void
  updatePanelState: (updates: Partial<TPanelState>) => void
  setPoles: (poles: Pole[]) => void
  setIsDragging: (dragging: boolean) => void
  setDraggedItemId: (id: string | null) => void
  setCanvasSize: (size: { width: number; height: number }) => void
  resetVisualization: () => void
}

export interface VisualizationConfig<TSettings, TAnimationSettings, TPanelState> {
  initialSettings: TSettings
  initialAnimationSettings: TAnimationSettings
  initialPanelState: TPanelState
  initialPoles: Pole[]
  animationFrameTime?: number
  resetToDefaults: () => {
    settings: TSettings
    animationSettings: TAnimationSettings
    panelState: TPanelState
    poles: Pole[]
  }
}

export function useVisualization<TSettings, TAnimationSettings, TPanelState>(
  config: VisualizationConfig<TSettings, TAnimationSettings, TPanelState>
) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Core state
  const [settings, setSettings] = useState<TSettings>(config.initialSettings)
  const [animationSettings, setAnimationSettings] = useState<TAnimationSettings>(config.initialAnimationSettings)
  const [panelState, setPanelState] = useState<TPanelState>(config.initialPanelState)
  const [poles, setPoles] = useState<Pole[]>(config.initialPoles)
  
  // Interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Update functions
  const updateSettings = useCallback((updates: Partial<TSettings> | ((prev: TSettings) => Partial<TSettings>)) => {
    if (typeof updates === 'function') {
      setSettings(prev => ({ ...prev, ...updates(prev) }))
    } else {
      setSettings(prev => ({ ...prev, ...updates }))
    }
  }, [])

  const updateAnimationSettings = useCallback((updates: Partial<TAnimationSettings>) => {
    setAnimationSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updatePanelState = useCallback((updates: Partial<TPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetVisualization = useCallback(() => {
    const defaults = config.resetToDefaults()
    setSettings(defaults.settings)
    setAnimationSettings(defaults.animationSettings)
    setPanelState(defaults.panelState)
    setPoles(defaults.poles)
    setIsDragging(false)
    setDraggedItemId(null)
  }, [config])

  // Generic animation loop
  const startAnimation = useCallback((
    isAnimating: boolean,
    updateTime: (time: number) => void,
    frameTime: number = 16
  ) => {
    if (isAnimating) {
      const animate = () => {
        updateTime(frameTime)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Canvas utilities
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      let width = rect.width
      let height = rect.height
      
      // On mobile, ensure we don't exceed viewport dimensions
      if (window.innerWidth < 768) {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        // Use the smaller of container size or viewport size
        width = Math.min(width, viewportWidth)
        height = Math.min(height, viewportHeight)
        
        // Ensure minimum size
        width = Math.max(width, 300)
        height = Math.max(height, 400)
      }
      
      setCanvasSize({ width, height })
    }

    resizeCanvas()
    
    // Use ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    
    // Also listen for window resize for viewport changes
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return {
    // Refs
    canvasRef,
    animationRef,

    // State
    settings,
    animationSettings,
    panelState,
    poles,
    isDragging,
    draggedItemId,
    canvasSize,

    // Actions
    updateSettings,
    updateAnimationSettings,
    updatePanelState,
    setPoles,
    setIsDragging,
    setDraggedItemId,
    setCanvasSize,
    resetVisualization,

    // Utilities
    startAnimation,
    setupCanvas
  }
} 