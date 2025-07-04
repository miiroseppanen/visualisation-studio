'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { CircularFieldRenderer } from '@/lib/renderers/CircularFieldRenderer'
import { useCircularField } from '@/lib/hooks/useCircularField'
import { FieldSettings } from '@/components/circular-field/FieldSettings'
import { PoleControls } from '@/components/circular-field/PoleControls'
import { DisplaySettings } from '@/components/circular-field/DisplaySettings'
import { AnimationControls } from '@/components/circular-field/AnimationControls'
import VisualizationLayout from '@/components/layout/VisualizationLayout'

export default function CircularFieldPage() {
  const rendererRef = useRef<CircularFieldRenderer | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const {
    canvasRef,
    poles,
    fieldSettings,
    displaySettings,
    animationSettings,
    panelState,
    fieldLines,
    draggedPole,
    updatePole,
    removePole,
    updateFieldSettings,
    updateDisplaySettings,
    updateAnimationSettings,
    updatePanelState,
    setCanvasSize,
    resetVisualization,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  } = useCircularField()

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
      renderer.setupCanvas()
      setCanvasSize({ width, height })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [setCanvasSize])

  // Render the visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !rendererRef.current) return

    rendererRef.current.renderCircularField(poles, fieldLines, displaySettings)
  }, [poles, fieldLines, displaySettings])

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

          <PoleControls
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
        className="w-full h-full cursor-crosshair"
        style={{ cursor: draggedPole ? 'grabbing' : 'crosshair' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </VisualizationLayout>
  )
} 