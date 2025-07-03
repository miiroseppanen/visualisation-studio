'use client'

import { useRef, useEffect, useState } from 'react'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'
import { Download, RotateCcw } from 'lucide-react'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { useTurbulence } from '@/lib/hooks/useTurbulence'
import { TurbulenceRenderer } from '@/lib/turbulence-renderer'
import { TurbulenceSettings } from '@/components/turbulence/TurbulenceSettings'
import { SourceControls } from '@/components/turbulence/SourceControls'
import { FlowControls } from '@/components/turbulence/FlowControls'
import { TurbulenceAnimationControls } from '@/components/turbulence/TurbulenceAnimationControls'

export default function TurbulencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<TurbulenceRenderer | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const {
    // Settings
    turbulenceSettings,
    noiseSettings,
    flowSettings,
    animationSettings,
    panelState,
    
    // Sources
    sources,
    
    // Interaction state
    canvasSize,
    
    // Update functions
    updateTurbulenceSettings,
    updateNoiseSettings,
    updateFlowSettings,
    updateAnimationSettings,
    updatePanelState,
    
    // Source management
    addSource,
    removeSource,
    updateSource,
    clearAllSources,
    
    // Interaction handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasResize,
  } = useTurbulence()

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new TurbulenceRenderer(canvasRef.current)
      
      // Handle resize
      const handleResize = () => {
        if (canvasRef.current && rendererRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          rendererRef.current.resize(rect.width, rect.height)
          handleCanvasResize(rect.width, rect.height)
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize() // Initial size

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [handleCanvasResize])

  // Render loop
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.renderField(
        sources,
        turbulenceSettings,
        noiseSettings,
        flowSettings,
        animationSettings
      )
    }
  }, [sources, turbulenceSettings, noiseSettings, flowSettings, animationSettings])

  const handleExportSVG = () => {
    if (rendererRef.current) {
      const svgContent = rendererRef.current.exportAsSVG(
        sources,
        turbulenceSettings,
        noiseSettings,
        flowSettings,
        animationSettings
      )
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'turbulence-flow-field.svg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const resetAllSettings = () => {
    // Reset to default values - you could implement this in the hook
    clearAllSources()
    updateTurbulenceSettings({
      lineCount: 2000,
      lineLength: 30,
      showSources: true,
      streamlineMode: false,
    })
    updateNoiseSettings({
      scale: 0.01,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      seed: Math.random() * 1000,
    })
    updateFlowSettings({
      baseVelocity: 0.5,
      baseAngle: 0,
      enabled: true,
    })
    updateAnimationSettings({
      isAnimating: true,
      speed: 1.0,
      intensity: 1.0,
      time: 0,
    })
  }

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    const deltaY = e.deltaY
    const zoomChange = -deltaY * ZOOM_SENSITIVITY
    
    const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel + zoomChange))
    setZoomLevel(newZoom)
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <VisualizationNav 
        actionButtons={
          <>
            <Button variant="ghost" size="sm" onClick={resetAllSettings}>
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

      <div className="flex-1 flex">
        {/* Canvas - Fullscreen */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Mode: {turbulenceSettings.streamlineMode ? 'Streamlines' : 'Vectors'} | 
            Sources: {sources.length} | 
            Density: {turbulenceSettings.lineCount.toLocaleString()} | 
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Click to add vortex, drag to move • Wheel to zoom • Toggle visualization modes in controls
          </div>
        </div>

        {/* Floating Controls Panel */}
        <ControlsPanel title="Turbulence Controls">
          <div className="space-y-8">
            <TurbulenceSettings
              settings={turbulenceSettings}
              expanded={panelState.turbulenceExpanded}
              onToggleExpanded={() => updatePanelState({ turbulenceExpanded: !panelState.turbulenceExpanded })}
              onSettingsChange={updateTurbulenceSettings}
            />

            <SourceControls
              sources={sources}
              panelState={panelState}
              onUpdatePanelState={updatePanelState}
              onAddSource={addSource}
              onRemoveSource={removeSource}
              onUpdateSource={updateSource}
              onClearAll={clearAllSources}
            />

            <FlowControls
              flowSettings={flowSettings}
              noiseSettings={noiseSettings}
              panelState={panelState}
              onUpdatePanelState={updatePanelState}
              onFlowChange={updateFlowSettings}
              onNoiseChange={updateNoiseSettings}
            />

            <TurbulenceAnimationControls
              settings={animationSettings}
              onSettingsChange={updateAnimationSettings}
              expanded={panelState.animationExpanded}
              onToggleExpanded={() => updatePanelState({ animationExpanded: !panelState.animationExpanded })}
            />
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
} 