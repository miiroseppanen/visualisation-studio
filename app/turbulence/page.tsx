'use client'

import { useEffect, useRef, useState } from 'react'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { TurbulenceSettings } from '@/components/turbulence/TurbulenceSettings'
import { SourceControls } from '@/components/turbulence/SourceControls'
import { FlowControls } from '@/components/turbulence/FlowControls'
import { TurbulenceAnimationControls } from '@/components/turbulence/TurbulenceAnimationControls'
import type { TurbulenceAnimationSettings } from '@/lib/types'
import { useTurbulence } from '@/lib/hooks/useTurbulence'
import { TurbulenceRenderer } from '@/lib/turbulence-renderer'

export default function TurbulencePage() {
  const rendererRef = useRef<TurbulenceRenderer | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const {
    canvasRef,
    turbulenceSettings,
    noiseSettings,
    flowSettings,
    animationSettings,
    panelState,
    sources,
    particles,
    initializeParticles,
    updateParticles,
    isDragging,
    updateTurbulenceSettings,
    updateNoiseSettings,
    updateFlowSettings,
    updateAnimationSettings,
    updatePanelState,
    addSource,
    removeSource,
    updateSource,
    clearAllSources,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasResize,
  } = useTurbulence()

  // Initialize renderer and particles
  useEffect(() => {
    if (canvasRef.current && isClient) {
      try {
        rendererRef.current = new TurbulenceRenderer(canvasRef.current)
        
        // Set initial canvas size
        const updateSize = () => {
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            handleCanvasResize({ width: rect.width, height: rect.height })
            if (rendererRef.current) {
              rendererRef.current.resize(rect.width, rect.height)
            }
          }
        }

        updateSize()
        window.addEventListener('resize', updateSize)
        
        // Initialize particles when flowing mode is enabled
        if (turbulenceSettings.flowingMode) {
          initializeParticles(Math.floor(turbulenceSettings.lineCount / 10))
        }
        
        return () => {
          window.removeEventListener('resize', updateSize)
        }
      } catch (error) {
        console.error('Failed to initialize turbulence renderer:', error)
      }
    }
  }, [isClient, handleCanvasResize, turbulenceSettings.flowingMode, turbulenceSettings.lineCount, initializeParticles])

  // Client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Reinitialize particles when flowing mode is toggled
  useEffect(() => {
    if (isClient && turbulenceSettings.flowingMode) {
      initializeParticles(Math.floor(turbulenceSettings.lineCount / 10))
    }
  }, [isClient, turbulenceSettings.flowingMode, turbulenceSettings.lineCount, initializeParticles])

  // Animation loop for flowing particles
  useEffect(() => {
    if (!isClient || !animationSettings.isAnimating || !turbulenceSettings.flowingMode) return

    let animationId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Update particles
      updateParticles(deltaTime)

      // Update animation time
      updateAnimationSettings({ time: animationSettings.time + deltaTime * 0.01 })

      // Render
      if (rendererRef.current) {
        rendererRef.current.renderField(
          sources,
          turbulenceSettings,
          noiseSettings,
          flowSettings,
          animationSettings,
          particles
        )
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [
    isClient, 
    animationSettings.isAnimating, 
    turbulenceSettings.flowingMode,
    sources, 
    turbulenceSettings, 
    noiseSettings, 
    flowSettings, 
    animationSettings,
    particles,
    updateParticles,
    updateAnimationSettings
  ])

  // Render the visualization (for non-flowing modes)
  useEffect(() => {
    if (rendererRef.current && isClient && !turbulenceSettings.flowingMode) {
      rendererRef.current.renderField(
        sources,
        turbulenceSettings,
        noiseSettings,
        flowSettings,
        animationSettings
      )
    }
  }, [sources, turbulenceSettings, noiseSettings, flowSettings, animationSettings, isClient])

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
      const svg = rendererRef.current.exportAsSVG(
        sources,
        turbulenceSettings,
        noiseSettings,
        flowSettings,
        animationSettings
      )
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'turbulence.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  // Reset visualization
  const handleReset = () => {
    clearAllSources()
    setZoomLevel(1)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading turbulence visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={handleReset}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Turbulence Mode | 
          {sources.length} sources • 
          {turbulenceSettings.lineCount} lines • 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Click to add sources, drag to move • Wheel to zoom • Use controls to adjust turbulence settings"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => updatePanelState({ isOpen: !panelState.isOpen })}
      settingsContent={
        <div className="space-y-8">
          <TurbulenceSettings
            settings={turbulenceSettings}
            onSettingsChange={updateTurbulenceSettings}
            expanded={panelState.turbulenceExpanded}
            onToggleExpanded={() => updatePanelState({ 
              turbulenceExpanded: !panelState.turbulenceExpanded 
            })}
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