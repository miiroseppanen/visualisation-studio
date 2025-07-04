'use client'

import { useEffect, useRef, useState } from 'react'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { TopographySettings } from '@/components/topography/TopographySettings'
import { ElevationPointControls } from '@/components/topography/ElevationPointControls'
import { TopographyDisplaySettings } from '@/components/topography/TopographyDisplaySettings'
import { AnimationControls } from '@/components/topography/AnimationControls'
import type { TopographyAnimationSettings } from '@/lib/types'
import { useTopography } from '@/lib/hooks/useTopography'
import { TopographyRenderer } from '@/lib/renderers/TopographyRenderer'

export default function TopographyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<TopographyRenderer | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const {
    topographySettings,
    displaySettings,
    animationSettings,
    panelState,
    elevationPoints,
    isDragging,
    updateTopographySettings,
    updateDisplaySettings,
    updateAnimationSettings,
    updatePanelState,
    addElevationPoint,
    removeElevationPoint,
    updateElevationPoint,
    clearAllElevationPoints,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasResize,
  } = useTopography()

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && isClient) {
      try {
        rendererRef.current = new TopographyRenderer(canvasRef.current)
        
        // Set initial canvas size
        const updateSize = () => {
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            handleCanvasResize(rect.width, rect.height)
            if (rendererRef.current) {
              rendererRef.current.resize(rect.width, rect.height)
            }
          }
        }

        updateSize()
        window.addEventListener('resize', updateSize)
        
        return () => {
          window.removeEventListener('resize', updateSize)
        }
      } catch (error) {
        console.error('Failed to initialize topography renderer:', error)
      }
    }
  }, [isClient, handleCanvasResize])

  // Client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render visualization
  useEffect(() => {
    if (rendererRef.current && isClient) {
      try {
        rendererRef.current.renderTopography(
          elevationPoints,
          topographySettings,
          displaySettings
        )
      } catch (error) {
        console.error('Rendering error:', error)
      }
    }
  }, [elevationPoints, topographySettings, displaySettings, isClient])

  const handleReset = () => {
    clearAllElevationPoints()
    // Reset to default settings
    updateTopographySettings({
      contourInterval: 50,
      minElevation: 0,
      maxElevation: 1000,
      smoothing: 0.3,
      resolution: 1.0,
    })
    updateDisplaySettings({
      showElevationPoints: true,
      showContourLines: true,
      showElevationLabels: true,
      showGradientField: false,
      lineWeight: 1.5,
      majorContourWeight: 3.0,
      majorContourInterval: 5,
    })
    updateAnimationSettings({
      isAnimating: false,
      windSpeed: 1.0,
      windDirection: 0,
      contourPulse: false,
      time: 0,
    })
  }

  const handleExportSVG = () => {
    if (rendererRef.current) {
      try {
        const svg = rendererRef.current.exportTopographySVG(
          elevationPoints,
          topographySettings,
          displaySettings
        )
        
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `topography_${Date.now()}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Export error:', error)
      }
    }
  }

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    const deltaY = e.deltaY
    const zoomChange = -deltaY * ZOOM_SENSITIVITY
    
    const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel + zoomChange))
    setZoomLevel(newZoom)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading topography visualizer...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <VisualizationNav 
        actionButtons={
          <>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={handleExportSVG}>
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
          </>
        }
      />
      
      {/* Status Display */}
      <div className="absolute top-16 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
        <div className="font-medium">Contour Mode</div>
        <div className="text-muted-foreground">
          {elevationPoints.length} elevation points • 
          {Math.floor((topographySettings.maxElevation - topographySettings.minElevation) / topographySettings.contourInterval)} contours • 
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-muted-foreground max-w-md">
        Click to add peaks, drag to move • Wheel to zoom • Use controls to adjust contour settings
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ 
            cursor: isDragging ? 'grabbing' : 'crosshair'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Controls Panel */}
        <ControlsPanel>
          <div className="space-y-6">
            <TopographySettings
              settings={topographySettings}
              panelState={panelState}
              onUpdateSettings={updateTopographySettings}
              onUpdatePanelState={updatePanelState}
            />

            <ElevationPointControls
              elevationPoints={elevationPoints}
              panelState={panelState}
              onUpdatePanelState={updatePanelState}
              onAddElevationPoint={addElevationPoint}
              onRemoveElevationPoint={removeElevationPoint}
              onUpdateElevationPoint={updateElevationPoint}
              onClearAll={clearAllElevationPoints}
            />

            <TopographyDisplaySettings
              settings={displaySettings}
              panelState={panelState}
              onUpdateSettings={updateDisplaySettings}
              onUpdatePanelState={updatePanelState}
            />

            <AnimationControls
              settings={animationSettings}
              onSettingsChange={updateAnimationSettings}
              onReset={handleReset}
              expanded={panelState.animationExpanded}
              onToggleExpanded={() => updatePanelState({ animationExpanded: !panelState.animationExpanded })}
            />
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
} 