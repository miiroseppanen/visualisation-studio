import { useState, useEffect, useRef, useCallback } from 'react'
import type { Pole } from '../types'
import type { CircularFieldDisplaySettings, CircularFieldAnimationSettings, CircularFieldPanelState } from '../types'
import { 
  generateInteractiveCircularFieldLines, 
  filterVisibleFieldLines, 
  animateCircularFieldLines,
  type CircularFieldLine,
  type CircularFieldSettings
} from '../circular-field-physics'

export function useCircularField() {
  // Poles state
  const [poles, setPoles] = useState<Pole[]>([
    { id: '1', x: 300, y: 200, strength: 5, isPositive: true, name: 'North' },
    { id: '2', x: 500, y: 200, strength: 5, isPositive: false, name: 'South' }
  ])

  // Field settings
  const [fieldSettings, setFieldSettings] = useState<CircularFieldSettings>({
    lineCount: 8,
    lineSpacing: 25,
    lineWeight: 1.5,
    opacity: 0.8,
    showPoles: true,
    animationSpeed: 50
  })

  // Display settings
  const [displaySettings, setDisplaySettings] = useState<CircularFieldDisplaySettings>({
    showFieldLines: true,
    showPoles: true,
    showPoleLabels: true,
    lineWeight: 1.5,
    opacity: 0.8
  })

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<CircularFieldAnimationSettings>({
    isAnimating: false,
    rotationSpeed: 50,
    pulseEffect: false,
    time: 0
  })

  // Panel state
  const [panelState, setPanelState] = useState<CircularFieldPanelState>({
    fieldSettingsExpanded: true,
    polesExpanded: true,
    displaySettingsExpanded: true,
    animationExpanded: false
  })

  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [fieldLines, setFieldLines] = useState<CircularFieldLine[]>([])
  const [draggedPole, setDraggedPole] = useState<Pole | null>(null)
  
  // Animation frame ref
  const animationFrameRef = useRef<number>()

  // Generate field lines
  const generateFieldLines = useCallback(() => {
    const lines = generateInteractiveCircularFieldLines(
      poles,
      fieldSettings,
      canvasSize.width,
      canvasSize.height
    )
    
    const visibleLines = filterVisibleFieldLines(
      lines,
      canvasSize.width,
      canvasSize.height
    )
    
    setFieldLines(visibleLines)
  }, [poles, fieldSettings, canvasSize])

  // Animation loop
  useEffect(() => {
    if (animationSettings.isAnimating) {
      const animate = () => {
        setAnimationSettings(prev => ({
          ...prev,
          time: prev.time + 16 // ~60fps
        }))
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animationSettings.isAnimating])

  // Apply animation to field lines
  const animatedFieldLines = animationSettings.isAnimating
    ? animateCircularFieldLines(
        fieldLines,
        animationSettings.time,
        animationSettings.rotationSpeed
      )
    : fieldLines

  // Regenerate field lines when dependencies change
  useEffect(() => {
    generateFieldLines()
  }, [generateFieldLines])

  // Pole management functions
  const addPole = useCallback((x: number, y: number) => {
    const newPole: Pole = {
      id: Date.now().toString(),
      x,
      y,
      strength: 5,
      isPositive: Math.random() > 0.5,
      name: `Pole ${poles.length + 1}`
    }
    setPoles(prev => [...prev, newPole])
  }, [poles.length])

  const updatePole = useCallback((id: string, updates: Partial<Pole>) => {
    setPoles(prev => prev.map(pole => 
      pole.id === id ? { ...pole, ...updates } : pole
    ))
  }, [])

  const removePole = useCallback((id: string) => {
    setPoles(prev => prev.filter(pole => pole.id !== id))
  }, [])

  const movePole = useCallback((id: string, x: number, y: number) => {
    setPoles(prev => prev.map(pole => 
      pole.id === id ? { ...pole, x, y } : pole
    ))
  }, [])

  // Mouse interaction handlers
  const handleMouseDown = useCallback((x: number, y: number, findPoleAt: (x: number, y: number) => Pole | null) => {
    const pole = findPoleAt(x, y)
    if (pole) {
      setDraggedPole(pole)
    }
  }, [])

  const handleMouseMove = useCallback((x: number, y: number) => {
    if (draggedPole) {
      movePole(draggedPole.id, x, y)
    }
  }, [draggedPole, movePole])

  const handleMouseUp = useCallback(() => {
    setDraggedPole(null)
  }, [])

  const handleDoubleClick = useCallback((x: number, y: number) => {
    addPole(x, y)
  }, [addPole])

  // Settings update functions
  const updateFieldSettings = useCallback((updates: Partial<CircularFieldSettings>) => {
    setFieldSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateDisplaySettings = useCallback((updates: Partial<CircularFieldDisplaySettings>) => {
    setDisplaySettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateAnimationSettings = useCallback((updates: Partial<CircularFieldAnimationSettings>) => {
    setAnimationSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updatePanelState = useCallback((updates: Partial<CircularFieldPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset function
  const resetVisualization = useCallback(() => {
    setPoles([
      { id: '1', x: 300, y: 200, strength: 5, isPositive: true, name: 'North' },
      { id: '2', x: 500, y: 200, strength: 5, isPositive: false, name: 'South' }
    ])
    setFieldSettings({
      lineCount: 8,
      lineSpacing: 25,
      lineWeight: 1.5,
      opacity: 0.8,
      showPoles: true,
      animationSpeed: 50
    })
    setAnimationSettings(prev => ({ ...prev, isAnimating: false, time: 0 }))
  }, [])

  return {
    // State
    poles,
    fieldSettings,
    displaySettings,
    animationSettings,
    panelState,
    canvasSize,
    fieldLines: animatedFieldLines,
    draggedPole,

    // Actions
    addPole,
    updatePole,
    removePole,
    movePole,
    updateFieldSettings,
    updateDisplaySettings,
    updateAnimationSettings,
    updatePanelState,
    setCanvasSize,
    resetVisualization,

    // Mouse handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  }
} 