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
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'

export default function CircularFieldPage() {
  const rendererRef = useRef<CircularFieldRenderer | null>(null)
  const [isClient, setIsClient] = useState(false)
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
    setIsClient(true)
    if (canvasRef.current) {
      rendererRef.current = new CircularFieldRenderer(canvasRef.current)
      
      const updateSize = () => {
        const canvas = canvasRef.current
        if (canvas && rendererRef.current) {
          const rect = canvas.getBoundingClientRect()
          const width = rect.width
          const height = rect.height
          rendererRef.current.resize(width, height)
          setCanvasSize({ width, height })
        }
      }

      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
  }, [setCanvasSize])

  // Render the visualization
  useEffect(() => {
    if (rendererRef.current && isClient) {
      rendererRef.current.renderCircularField(poles, fieldLines, displaySettings)
    }
  }, [poles, fieldLines, displaySettings, isClient])

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

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    const deltaY = e.deltaY
    const zoomChange = -deltaY * ZOOM_SENSITIVITY
    
    const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel + zoomChange))
    setZoomLevel(newZoom)
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
    <div className="h-screen bg-background flex flex-col">
      <VisualizationNav 
        actionButtons={
          <>
            <Button variant="ghost" size="sm" onClick={resetVisualization}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={exportSVG}>
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
          </>
        }
      />

      <div className="flex-1 relative">
        {/* Canvas - Fullscreen */}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ cursor: draggedPole ? 'grabbing' : 'crosshair' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Poles: {poles.length} | 
          Field Lines: {fieldLines.length} | 
          Zoom: {Math.round(zoomLevel * 100)}% | 
          Mode: {draggedPole ? 'Dragging' : 'Ready'}
          {animationSettings.isAnimating && (
            <span className="text-blue-600"> | ● Animating</span>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Click to add pole, drag to move • Wheel to zoom • Circular field lines around magnetic poles
        </div>
      </div>

      {/* Floating Controls Panel */}
      <ControlsPanel title="Circular Field Controls">
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
      </ControlsPanel>
    </div>
  )
} 