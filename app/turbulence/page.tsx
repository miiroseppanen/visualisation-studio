'use client'

import { useRef, useEffect } from 'react'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import { useTurbulence } from '@/lib/hooks/useTurbulence'
import { TurbulenceRenderer } from '@/lib/turbulence-renderer'
import { TurbulenceSettings } from '@/components/turbulence/TurbulenceSettings'
import { SourceControls } from '@/components/turbulence/SourceControls'
import { FlowControls } from '@/components/turbulence/FlowControls'
import { TurbulenceAnimationControls } from '@/components/turbulence/TurbulenceAnimationControls'

export default function TurbulencePage() {
  const rendererRef = useRef<TurbulenceRenderer | null>(null)

  const {
    // Refs
    canvasRef,
    
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
    
    // Reset function
    resetAllSettings,
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
          handleCanvasResize({ width: rect.width, height: rect.height })
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize() // Initial size

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [canvasRef, handleCanvasResize])

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

  return (
    <VisualizationLayout
      onReset={resetAllSettings}
      onExportSVG={handleExportSVG}
      statusContent={
        <>
          Mode: {turbulenceSettings.streamlineMode ? 'Streamlines' : 'Vectors'} | 
          Sources: {sources.length} | 
          Density: {turbulenceSettings.lineCount.toLocaleString()}
        </>
      }
      helpText="Click to add vortex, drag to move • Toggle visualization modes in controls"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => updatePanelState({ isOpen: !panelState.isOpen })}
      settingsContent={
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
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </VisualizationLayout>
  )
} 