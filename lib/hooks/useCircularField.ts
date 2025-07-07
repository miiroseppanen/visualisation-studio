import React, { useState, useCallback } from 'react'
import { useVisualization } from './useVisualization'
import type { 
  Pole, 
  CircularFieldDisplaySettings, 
  CircularFieldAnimationSettings, 
  CircularFieldPanelState 
} from '../types'
import { 
  generateInteractiveCircularFieldLines, 
  filterVisibleFieldLines, 
  animateCircularFieldLines,
  type CircularFieldLine,
  type CircularFieldSettings
} from '../circular-field-physics'

// Circular-specific types that extend the base visualization types
interface CircularVisualizationSettings extends CircularFieldSettings {
  displaySettings: CircularFieldDisplaySettings
}

interface CircularAnimationSettings extends CircularFieldAnimationSettings {}

interface CircularPanelState extends CircularFieldPanelState {}

export function useCircularField() {
  // Circular-specific state that's not covered by the base hook
  const [fieldLines, setFieldLines] = useState<CircularFieldLine[]>([])

  // Use the unified visualization hook with circular-specific configuration
  const visualization = useVisualization<CircularVisualizationSettings, CircularAnimationSettings, CircularPanelState>({
    initialSettings: {
      lineCount: 8,
      lineSpacing: 25,
      lineWeight: 1.5,
      opacity: 0.8,
      showPoles: true,
      animationSpeed: 50,
      displaySettings: {
        showFieldLines: true,
        showPoles: true,
        showPoleLabels: true,
        lineWeight: 1.5,
        opacity: 0.8
      }
    },
    initialAnimationSettings: {
      isAnimating: true,
      rotationSpeed: 50,
      pulseEffect: true,
      time: 0
    },
    initialPanelState: {
      isOpen: true,
      fieldSettingsExpanded: true,
      polesExpanded: true,
      displaySettingsExpanded: true,
      animationExpanded: true
    },
    initialPoles: [
      { id: '1', x: 300, y: 200, strength: 12, isPositive: true, name: 'North 1' },
      { id: '2', x: 500, y: 200, strength: 10, isPositive: false, name: 'South 1' },
      { id: '3', x: 400, y: 300, strength: 8, isPositive: true, name: 'North 2' }
    ],
    resetToDefaults: () => ({
      settings: {
        lineCount: 8,
        lineSpacing: 25,
        lineWeight: 1.5,
        opacity: 0.8,
        showPoles: true,
        animationSpeed: 50,
        displaySettings: {
          showFieldLines: true,
          showPoles: true,
          showPoleLabels: true,
          lineWeight: 1.5,
          opacity: 0.8
        }
      },
      animationSettings: {
        isAnimating: true,
        rotationSpeed: 50,
        pulseEffect: true,
        time: 0
      },
      panelState: {
        isOpen: true,
        fieldSettingsExpanded: true,
        polesExpanded: true,
        displaySettingsExpanded: true,
        animationExpanded: true
      },
      poles: [
        { id: '1', x: 300, y: 200, strength: 12, isPositive: true, name: 'North 1' },
        { id: '2', x: 500, y: 200, strength: 10, isPositive: false, name: 'South 1' },
        { id: '3', x: 400, y: 300, strength: 8, isPositive: true, name: 'North 2' }
      ]
    })
  })

  // Generate field lines (using unified canvas utilities)
  const generateFieldLines = useCallback(() => {
    const lines = generateInteractiveCircularFieldLines(
      visualization.poles,
      visualization.settings,
      visualization.canvasSize.width,
      visualization.canvasSize.height
    )
    
    const visibleLines = filterVisibleFieldLines(
      lines,
      visualization.canvasSize.width,
      visualization.canvasSize.height
    )
    
    setFieldLines(visibleLines)
  }, [visualization.poles, visualization.settings, visualization.canvasSize])

  // Apply animation to field lines
  const animatedFieldLines = visualization.animationSettings.isAnimating
    ? animateCircularFieldLines(
        fieldLines,
        visualization.animationSettings.time,
        visualization.animationSettings.rotationSpeed
      )
    : fieldLines

  // Circular-specific update functions (convenience wrappers)
  const updateFieldSettings = useCallback((updates: Partial<CircularFieldSettings>) => {
    visualization.updateSettings((prev) => {
      const updatedSettings = { ...prev }
      
      // Only update the core field properties to avoid infinite loops
      if (updates.lineCount !== undefined) updatedSettings.lineCount = updates.lineCount
      if (updates.lineSpacing !== undefined) updatedSettings.lineSpacing = updates.lineSpacing
      if (updates.lineWeight !== undefined) updatedSettings.lineWeight = updates.lineWeight
      if (updates.opacity !== undefined) updatedSettings.opacity = updates.opacity
      if (updates.showPoles !== undefined) updatedSettings.showPoles = updates.showPoles
      if (updates.animationSpeed !== undefined) updatedSettings.animationSpeed = updates.animationSpeed
      
      return updatedSettings
    })
  }, [visualization.updateSettings])

  const updateDisplaySettings = useCallback((updates: Partial<CircularFieldDisplaySettings>) => {
    visualization.updateSettings((prev) => ({ 
      displaySettings: { 
        ...prev.displaySettings, 
        ...updates 
      } 
    }))
  }, [visualization.updateSettings])

  // Pole management functions (using unified utilities)
  const addPole = useCallback((x: number, y: number) => {
    const newPole: Pole = {
      id: Date.now().toString(),
      x,
      y,
      strength: 5,
      isPositive: Math.random() > 0.5,
      name: `Pole ${visualization.poles.length + 1}`
    }
    visualization.setPoles([...visualization.poles, newPole])
  }, [visualization.poles, visualization.setPoles])

  const updatePole = useCallback((id: string, updates: Partial<Pole>) => {
    visualization.setPoles(visualization.poles.map(pole => 
      pole.id === id ? { ...pole, ...updates } : pole
    ))
  }, [visualization.poles, visualization.setPoles])

  const removePole = useCallback((id: string) => {
    visualization.setPoles(visualization.poles.filter(pole => pole.id !== id))
  }, [visualization.poles, visualization.setPoles])

  const movePole = useCallback((id: string, x: number, y: number) => {
    visualization.setPoles(visualization.poles.map(pole => 
      pole.id === id ? { ...pole, x, y } : pole
    ))
  }, [visualization.poles, visualization.setPoles])

  // Mouse interaction handlers
  const handleMouseDown = useCallback((x: number, y: number, findPoleAt: (x: number, y: number) => Pole | null) => {
    const pole = findPoleAt(x, y)
    if (pole) {
      visualization.setDraggedItemId(pole.id)
      visualization.setIsDragging(true)
    }
  }, [visualization.setDraggedItemId, visualization.setIsDragging])

  const handleMouseMove = useCallback((x: number, y: number) => {
    if (visualization.isDragging && visualization.draggedItemId) {
      movePole(visualization.draggedItemId, x, y)
    }
  }, [visualization.isDragging, visualization.draggedItemId, movePole])

  const handleMouseUp = useCallback(() => {
    visualization.setIsDragging(false)
    visualization.setDraggedItemId(null)
  }, [visualization.setIsDragging, visualization.setDraggedItemId])

  const handleDoubleClick = useCallback((x: number, y: number) => {
    addPole(x, y)
  }, [addPole])

  // Panel toggle functionality
  const togglePanel = useCallback(() => {
    visualization.updatePanelState({ 
      isOpen: !(visualization.panelState as any).isOpen 
    })
  }, [visualization.updatePanelState, visualization.panelState])

  // Extract nested settings for backward compatibility
  const fieldSettings: CircularFieldSettings = {
    lineCount: visualization.settings.lineCount,
    lineSpacing: visualization.settings.lineSpacing,
    lineWeight: visualization.settings.lineWeight,
    opacity: visualization.settings.opacity,
    showPoles: visualization.settings.showPoles,
    animationSpeed: visualization.settings.animationSpeed
  }

  const displaySettings = visualization.settings.displaySettings

  // Setup field line generation effect
  React.useEffect(() => {
    generateFieldLines()
  }, [generateFieldLines])

  // Setup animation using unified utilities
  React.useEffect(() => {
    const cleanup = visualization.startAnimation(
      visualization.animationSettings.isAnimating,
      (frameTime) => {
        visualization.updateAnimationSettings({
          time: visualization.animationSettings.time + frameTime
        })
      }
    )
    return cleanup
  }, [visualization.animationSettings.isAnimating, visualization.animationSettings.time, visualization.startAnimation, visualization.updateAnimationSettings])

  return {
    // Refs (from base hook)
    canvasRef: visualization.canvasRef,
    animationRef: visualization.animationRef,
    
    // Circular-specific state
    fieldLines: animatedFieldLines,
    
    // State from base hook with backward compatibility
    poles: visualization.poles,
    fieldSettings,
    displaySettings,
    animationSettings: visualization.animationSettings,
    panelState: visualization.panelState,
    canvasSize: visualization.canvasSize,
    draggedPole: visualization.draggedItemId ? visualization.poles.find(p => p.id === visualization.draggedItemId) || null : null,
    
    // Actions
    addPole,
    updatePole,
    removePole,
    movePole,
    updateFieldSettings,
    updateDisplaySettings,
    updateAnimationSettings: visualization.updateAnimationSettings,
    updatePanelState: visualization.updatePanelState,
    setCanvasSize: visualization.setCanvasSize,
    resetVisualization: visualization.resetVisualization,
    
    // Panel controls
    panelOpen: (visualization.panelState as any).isOpen,
    togglePanel,
    
    // Mouse handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  }
} 