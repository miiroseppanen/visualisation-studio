'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { CircularFieldRenderer } from '@/lib/renderers/CircularFieldRenderer'
import { useCircularField } from '@/lib/hooks/useCircularField'
import { FieldSettings } from '@/components/circular-field/FieldSettings'
import { CircularPoleControls } from '@/components/circular-field/PoleControls'
import { DisplaySettings } from '@/components/circular-field/DisplaySettings'
import { AnimationControls } from '@/components/circular-field/AnimationControls'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import { useTouchEvents } from '@/lib/hooks/useTouchEvents'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'
import { useTheme } from '@/components/ui/ThemeProvider'

export default function CircularFieldPage() {
  const rendererRef = useRef<CircularFieldRenderer | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { isMobile } = useMobileDetection()
  const { theme } = useTheme()

  const {
    canvasRef,
    fieldLines,
    poles,
    fieldSettings,
    displaySettings,
    animationSettings,
    panelState,
    updateFieldSettings,
    updateDisplaySettings,
    updateAnimationSettings,
    updatePanelState,
    setCanvasSize,
    resetVisualization,
    draggedPole,
    updatePole,
    removePole,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  } = useCircularField()

  // Touch event handlers for mobile
  const handleTouchStart = (x: number, y: number) => {
    if (!rendererRef.current) return
    const coords = { x, y }
    const findPoleAt = (x: number, y: number) => {
      for (const pole of poles) {
        const dx = x - pole.x
        const dy = y - pole.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= 20) { // Larger touch target for mobile
          return pole
        }
      }
      return null
    }
    
    const existingPole = findPoleAt(coords.x, coords.y)
    if (!existingPole) {
      // Add new pole with touch
      handleDoubleClick(coords.x, coords.y)
    } else {
      // Handle dragging existing pole
      handleMouseDown(coords.x, coords.y, findPoleAt)
    }
  }

  const handleTouchMove = (x: number, y: number) => {
    if (!rendererRef.current) return
    const coords = { x, y }
    handleMouseMove(coords.x, coords.y)
  }

  const handleTouchEnd = (x: number, y: number) => {
    handleMouseUp()
  }

  const handlePinchZoom = (scale: number, centerX: number, centerY: number) => {
    const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel * scale))
    setZoomLevel(newZoom)
  }

  const handleLongPress = (x: number, y: number) => {
    if (!rendererRef.current) return
    // Long press to add pole on mobile
    handleDoubleClick(x, y)
  }

  // Initialize touch events for mobile
  useTouchEvents(canvasRef, {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onPinchZoom: handlePinchZoom,
    onLongPress: handleLongPress
  }, {
    enablePinchZoom: true,
    enableLongPress: true,
    longPressDelay: 500
  })

  // Initialize canvas and renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new CircularFieldRenderer(canvas)
    rendererRef.current = renderer
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      // Use lower DPI on mobile for better performance
      const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
      
      renderer.setupCanvas()
      setCanvasSize({ width, height })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [setCanvasSize, isMobile])

  // Render the visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !rendererRef.current) return

    rendererRef.current.renderCircularField(poles, fieldLines, displaySettings, theme)
  }, [poles, fieldLines, displaySettings, theme])

  // Wheel event handler (direct DOM listener to avoid passive event issues)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      const deltaY = e.deltaY
      const zoomChange = -deltaY * ZOOM_SENSITIVITY
      
      const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel + zoomChange))
      setZoomLevel(newZoom)
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [zoomLevel])

  // Mouse event handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!rendererRef.current) return
    const coords = rendererRef.current.getCanvasCoordinates(e.clientX, e.clientY)
    const findPoleAt = (x: number, y: number) => {
      for (const pole of poles) {
        const dx = x - pole.x
        const dy = y - pole.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= 15) {
          return pole
        }
      }
      return null
    }
    
    const existingPole = findPoleAt(coords.x, coords.y)
    if (!existingPole) {
      // Add new pole with single click instead of double-click
      handleDoubleClick(coords.x, coords.y)
    } else {
      // Handle dragging existing pole
      handleMouseDown(coords.x, coords.y, findPoleAt)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!rendererRef.current) return
    const coords = rendererRef.current.getCanvasCoordinates(e.clientX, e.clientY)
    handleMouseMove(coords.x, coords.y)
  }

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (!rendererRef.current) return
    const coords = rendererRef.current.getCanvasCoordinates(e.clientX, e.clientY)
    handleDoubleClick(coords.x, coords.y)
  }

  // Export as SVG
  const exportSVG = () => {
    if (rendererRef.current) {
      const svg = rendererRef.current.exportCircularFieldSVG(poles, fieldLines, displaySettings)
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'circular-field.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <VisualizationLayout
      onReset={resetVisualization}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Poles: {poles.length} | 
          Field Lines: {fieldLines.length} | 
          Zoom: {Math.round(zoomLevel * 100)}% | 
          Mode: {draggedPole ? 'Dragging' : 'Ready'}
          {animationSettings.isAnimating && (
            <span className="text-blue-600"> | ● Animating</span>
          )}
        </>
      }
      helpText="Click to add pole, drag to move • Wheel to zoom • Circular field lines around magnetic poles"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => updatePanelState({ isOpen: !panelState.isOpen })}
      settingsContent={
        <div className="space-y-8">
          <FieldSettings
            settings={fieldSettings}
            onSettingsChange={updateFieldSettings}
            isExpanded={panelState.fieldSettingsExpanded}
            onToggle={() => updatePanelState({ 
              fieldSettingsExpanded: !panelState.fieldSettingsExpanded 
            })}
          />

          <CircularPoleControls
            poles={poles}
            onPoleUpdate={updatePole}
            onPoleRemove={removePole}
            isExpanded={panelState.polesExpanded}
            onToggle={() => updatePanelState({ 
              polesExpanded: !panelState.polesExpanded 
            })}
          />

          <DisplaySettings
            settings={displaySettings}
            onSettingsChange={updateDisplaySettings}
            isExpanded={panelState.displaySettingsExpanded}
            onToggle={() => updatePanelState({ 
              displaySettingsExpanded: !panelState.displaySettingsExpanded 
            })}
          />

          <AnimationControls
            settings={animationSettings}
            onSettingsChange={updateAnimationSettings}
            onReset={resetVisualization}
            isExpanded={panelState.animationExpanded}
            onToggle={() => updatePanelState({ 
              animationExpanded: !panelState.animationExpanded 
            })}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full dark:invert dark:hue-rotate-180 ${
          isMobile ? 'touch-none' : 'cursor-crosshair'
        }`}
        style={{ 
          cursor: isMobile ? 'default' : (draggedPole ? 'grabbing' : 'crosshair'),
          touchAction: 'none' // Prevent default touch behaviors
        }}
        onMouseDown={!isMobile ? handleCanvasMouseDown : undefined}
        onMouseMove={!isMobile ? handleCanvasMouseMove : undefined}
        onMouseUp={!isMobile ? handleMouseUp : undefined}
        onMouseLeave={!isMobile ? handleMouseUp : undefined}
      />
    </VisualizationLayout>
  )
} 