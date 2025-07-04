'use client'

import { useEffect, useRef, useState } from 'react'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
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

  // Render the visualization
  useEffect(() => {
    if (rendererRef.current && isClient) {
      rendererRef.current.renderTopography(
        elevationPoints,
        topographySettings,
        displaySettings
      )
    }
  }, [elevationPoints, topographySettings, displaySettings, isClient])

  // Wheel event handler (direct DOM listener to avoid passive event issues)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isClient) return

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
  }, [isClient, zoomLevel])

  // Handle canvas mouse events
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMouseDown(e)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMouseMove(e)
  }

  const handleCanvasMouseUp = () => {
    handleMouseUp()
  }

  // Export as SVG
  const exportSVG = () => {
    if (rendererRef.current) {
      const svg = rendererRef.current.exportTopographySVG(
        elevationPoints,
        topographySettings,
        displaySettings
      )
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'topography.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  // Reset visualization
  const handleReset = () => {
    clearAllElevationPoints()
    setZoomLevel(1)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading topography visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={handleReset}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Contour Mode | 
          {elevationPoints.length} elevation points • 
          {Math.floor((topographySettings.maxElevation - topographySettings.minElevation) / topographySettings.contourInterval)} contours • 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Click to add peaks, drag to move • Wheel to zoom • Use controls to adjust contour settings"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => updatePanelState({ isOpen: !panelState.isOpen })}
      settingsContent={
        <div className="space-y-8">
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
            onToggleExpanded={() => updatePanelState({ 
              animationExpanded: !panelState.animationExpanded 
            })}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </VisualizationLayout>
  )
} 