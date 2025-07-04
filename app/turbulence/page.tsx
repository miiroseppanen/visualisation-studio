'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import VisualizationPageLayout from '@/components/layout/VisualizationPageLayout'
import { TurbulenceRenderer } from '@/lib/turbulence-renderer'
import type { TurbulenceSource } from '@/lib/turbulence-physics'
import type { TurbulenceSettings, NoiseSettings, FlowSettings, TurbulencePanelState } from '@/lib/types'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SourceControls } from '@/components/turbulence/SourceControls'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'

export default function TurbulencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<TurbulenceRenderer | null>(null)
  const animationRef = useRef<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [time, setTime] = useState(0)
  
  // Sources state
  const [sources, setSources] = useState<TurbulenceSource[]>([
    {
      id: '1',
      name: 'Vortex 1',
      x: 300,
      y: 200,
      strength: 75,
      type: 'vortex',
      angle: 0
    }
  ])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedSourceId, setDraggedSourceId] = useState<string | null>(null)
  
  // Settings state
  const [settings, setSettings] = useState<TurbulenceSettings>({
    lineCount: 300,
    lineLength: 60,
    showSources: true,
    streamlineMode: false,
    flowingMode: false,
    streamlineSteps: 150,
    streamlineStepSize: 2,
    sources: [{
      id: '1',
      name: 'Vortex 1',
      x: 300,
      y: 200,
      strength: 75,
      type: 'vortex',
      angle: 0
    }]
  })

  const [noiseSettings, setNoiseSettings] = useState<NoiseSettings>({
    scale: 0.01,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    seed: 42
  })

  const [flowSettings, setFlowSettings] = useState<FlowSettings>({
    baseVelocity: 0.5,
    baseAngle: 0,
    enabled: true
  })

  // Animation settings
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const [intensity, setIntensity] = useState(1.0)

  // Panel state
  const [panelState, setPanelState] = useState({ isOpen: true })
  const [turbulencePanelState, setTurbulencePanelState] = useState<TurbulencePanelState>({
    isOpen: true,
    turbulenceExpanded: true,
    sourcesExpanded: true,
    flowSettingsExpanded: false,
    noiseExpanded: false,
    animationExpanded: false
  })
  const [expandedSections, setExpandedSections] = useState({
    fieldSettings: true,
    animation: false,
    noiseSettings: false,
    flowSettings: false,
    sources: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current) {
      try {
        const canvas = canvasRef.current
        rendererRef.current = new TurbulenceRenderer(canvas)
        renderTurbulenceField()
      } catch (error) {
        console.error('TurbulenceRenderer initialization failed:', error)
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setTime(prev => prev + 0.01 * animationSpeed)
        const frameId = requestAnimationFrame(animate)
        animationRef.current = frameId
        registerAnimationFrame(frameId)
      }
      const frameId = requestAnimationFrame(animate)
      animationRef.current = frameId
      registerAnimationFrame(frameId)
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          unregisterAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      }
    }
  }, [isAnimating, animationSpeed])

  // Listen for global pause event
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      setIsAnimating(false)
    }

    window.addEventListener('pauseAllAnimations', handlePauseAllAnimations)
    
    return () => {
      window.removeEventListener('pauseAllAnimations', handlePauseAllAnimations)
    }
  }, [])

  // Cleanup on unmount to prevent navigation issues
  useEffect(() => {
    return () => {
      // Stop animation when component unmounts
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      // Clear renderer to prevent memory leaks
      if (rendererRef.current) {
        rendererRef.current = null
      }
    }
  }, [])

  // Stop animation when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (navigation, tab switch, etc.) - pause animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          unregisterAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      } else if (isAnimating && !animationRef.current) {
        // Page is visible again and should be animating - restart
        const animate = () => {
          setTime(prev => prev + 0.01 * animationSpeed)
          const frameId = requestAnimationFrame(animate)
          animationRef.current = frameId
          registerAnimationFrame(frameId)
        }
        const frameId = requestAnimationFrame(animate)
        animationRef.current = frameId
        registerAnimationFrame(frameId)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAnimating, animationSpeed])

  // Render turbulence field
  const renderTurbulenceField = useCallback(() => {
    if (rendererRef.current) {
      const currentSettings = { ...settings, sources }
      rendererRef.current.renderField(
        sources,
        currentSettings,
        noiseSettings,
        flowSettings,
        {
          isAnimating,
          speed: animationSpeed,
          intensity: intensity,
          time
        },
        undefined,
        1.0
      )
    }
  }, [sources, settings, noiseSettings, flowSettings, isAnimating, time, animationSpeed, intensity])

  // Re-render when settings change
  useEffect(() => {
    renderTurbulenceField()
  }, [renderTurbulenceField])

  // Mouse handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicking on a source
    const clickedSource = sources.find(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      return distance <= 15
    })

    if (clickedSource) {
      setIsDragging(true)
      setDraggedSourceId(clickedSource.id)
    } else {
      // Add new vortex source
      const newSource: TurbulenceSource = {
        id: Date.now().toString(),
        name: `Vortex ${sources.length + 1}`,
        x,
        y,
        strength: 50,
        type: 'vortex',
        angle: 0
      }
      const newSources = [...sources, newSource]
      setSources(newSources)
      setSettings(prev => ({ ...prev, sources: newSources }))
    }
  }, [sources])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && draggedSourceId) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      const newSources = sources.map(source => 
        source.id === draggedSourceId ? { ...source, x, y } : source
      )
      setSources(newSources)
      setSettings(prev => ({ ...prev, sources: newSources }))
    }
  }, [isDragging, draggedSourceId, sources])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedSourceId(null)
  }, [])

  // Settings update helpers
  const updateSetting = <K extends keyof TurbulenceSettings>(
    key: K,
    value: TurbulenceSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateNoiseSetting = <K extends keyof NoiseSettings>(
    key: K,
    value: NoiseSettings[K]
  ) => {
    setNoiseSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateFlowSetting = <K extends keyof FlowSettings>(
    key: K,
    value: FlowSettings[K]
  ) => {
    setFlowSettings(prev => ({ ...prev, [key]: value }))
  }

  // Action handlers
  const handleReset = () => {
    setSources([])
    setSettings(prev => ({ ...prev, sources: [] }))
    setTime(0)
    setIsAnimating(false)
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const addRandomSource = () => {
    const types: TurbulenceSource['type'][] = ['vortex', 'source', 'sink', 'uniform']
    const randomType = types[Math.floor(Math.random() * types.length)]
    const newSource: TurbulenceSource = {
      id: Date.now().toString(),
      name: `${randomType.charAt(0).toUpperCase() + randomType.slice(1)} ${sources.length + 1}`,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      strength: Math.random() * 50 + 25,
      type: randomType,
      angle: randomType === 'uniform' ? Math.random() * 360 : 0
    }
    const newSources = [...sources, newSource]
    setSources(newSources)
    setSettings(prev => ({ ...prev, sources: newSources }))
  }

  const addSource = (type: TurbulenceSource['type']) => {
    const newSource: TurbulenceSource = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${sources.length + 1}`,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      strength: 50,
      type: type,
      angle: type === 'uniform' ? 0 : 0
    }
    const newSources = [...sources, newSource]
    setSources(newSources)
    setSettings(prev => ({ ...prev, sources: newSources }))
  }

  const removeSource = (id: string) => {
    const newSources = sources.filter(s => s.id !== id)
    setSources(newSources)
    setSettings(prev => ({ ...prev, sources: newSources }))
  }

  const updateSource = (id: string, updates: Partial<TurbulenceSource>) => {
    const newSources = sources.map(source => 
      source.id === id ? { ...source, ...updates } : source
    )
    setSources(newSources)
    setSettings(prev => ({ ...prev, sources: newSources }))
  }

  const clearAllSources = () => {
    setSources([])
    setSettings(prev => ({ ...prev, sources: [] }))
  }

  const updateTurbulencePanelState = (updates: Partial<TurbulencePanelState>) => {
    setTurbulencePanelState(prev => ({ ...prev, ...updates }))
  }

  const exportSVG = () => {
    if (rendererRef.current) {
      const currentSettings = { ...settings, sources }
      const svg = rendererRef.current.exportAsSVG(
        sources,
        currentSettings,
        noiseSettings,
        flowSettings,
        {
          isAnimating: false,
          speed: animationSpeed,
          intensity: intensity,
          time
        },
        1.0
      )
      
      // Download SVG
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'turbulence-field.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <VisualizationPageLayout
      onReset={handleReset}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Turbulence Field | 
          {sources.length} sources • 
          {settings.lineCount} lines • 
          {settings.streamlineMode ? 'Streamlines' : 'Vector Field'}
          {isAnimating && ' • Animating'}
        </>
      }
      helpText="Click to add vortex sources • Drag to move • Use controls to adjust field visualization"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState({ isOpen: !panelState.isOpen })}
      settingsContent={
        <div className="space-y-6">
          {/* Field Settings - Top */}
          <CollapsibleSection 
            title="Field Settings" 
            defaultOpen={expandedSections.fieldSettings}
          >
            <div className="space-y-4 pb-2">
              <div className="space-y-2">
                <Label>Line Count: {settings.lineCount}</Label>
                <Slider
                  value={[settings.lineCount]}
                  onValueChange={([value]) => updateSetting('lineCount', value)}
                  min={50}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Line Length: {settings.lineLength}</Label>
                <Slider
                  value={[settings.lineLength]}
                  onValueChange={([value]) => updateSetting('lineLength', value)}
                  min={10}
                  max={120}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showSources"
                  checked={settings.showSources}
                  onCheckedChange={(checked) => updateSetting('showSources', !!checked)}
                />
                <Label htmlFor="showSources">Show Sources</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="streamlineMode"
                  checked={settings.streamlineMode}
                  onCheckedChange={(checked) => updateSetting('streamlineMode', !!checked)}
                />
                <Label htmlFor="streamlineMode">Streamline Mode</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flowingMode"
                  checked={settings.flowingMode}
                  onCheckedChange={(checked) => updateSetting('flowingMode', !!checked)}
                />
                <Label htmlFor="flowingMode">Flowing Animation</Label>
              </div>
            </div>
          </CollapsibleSection>

          {/* Source Management */}
          <SourceControls
            sources={sources}
            panelState={turbulencePanelState}
            onUpdatePanelState={updateTurbulencePanelState}
            onAddSource={addSource}
            onRemoveSource={removeSource}
            onUpdateSource={updateSource}
            onClearAll={clearAllSources}
          />

          {/* Flow Settings */}
          <CollapsibleSection 
            title="Flow" 
            defaultOpen={expandedSections.flowSettings}
          >
            <div className="space-y-4 pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flowEnabled"
                  checked={flowSettings.enabled}
                  onCheckedChange={(checked) => updateFlowSetting('enabled', !!checked)}
                />
                <Label htmlFor="flowEnabled">Enable Base Flow</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Base Velocity: {flowSettings.baseVelocity.toFixed(2)}</Label>
                <Slider
                  value={[flowSettings.baseVelocity]}
                  onValueChange={([value]) => updateFlowSetting('baseVelocity', value)}
                  min={0.0}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Base Angle: {flowSettings.baseAngle.toFixed(0)}°</Label>
                <Slider
                  value={[flowSettings.baseAngle]}
                  onValueChange={([value]) => updateFlowSetting('baseAngle', value)}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Noise Settings */}
          <CollapsibleSection 
            title="Noise" 
            defaultOpen={expandedSections.noiseSettings}
          >
            <div className="space-y-4 pb-2">
              <div className="space-y-2">
                <Label>Scale: {noiseSettings.scale.toFixed(3)}</Label>
                <Slider
                  value={[noiseSettings.scale]}
                  onValueChange={([value]) => updateNoiseSetting('scale', value)}
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Octaves: {noiseSettings.octaves}</Label>
                <Slider
                  value={[noiseSettings.octaves]}
                  onValueChange={([value]) => updateNoiseSetting('octaves', value)}
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Persistence: {noiseSettings.persistence.toFixed(2)}</Label>
                <Slider
                  value={[noiseSettings.persistence]}
                  onValueChange={([value]) => updateNoiseSetting('persistence', value)}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Lacunarity: {noiseSettings.lacunarity.toFixed(1)}</Label>
                <Slider
                  value={[noiseSettings.lacunarity]}
                  onValueChange={([value]) => updateNoiseSetting('lacunarity', value)}
                  min={1.0}
                  max={4.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Seed: {noiseSettings.seed}</Label>
                <Slider
                  value={[noiseSettings.seed]}
                  onValueChange={([value]) => updateNoiseSetting('seed', value)}
                  min={1}
                  max={1000}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Animation Settings - Bottom */}
          <CollapsibleSection 
            title="Animation" 
            defaultOpen={expandedSections.animation}
          >
            <div className="space-y-4 pb-2">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleAnimation}
                  variant={isAnimating ? "default" : "outline"}
                  size="sm"
                >
                  {isAnimating ? 'Pause' : 'Play'} Animation
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Animation Speed: {animationSpeed.toFixed(1)}x</Label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={([value]) => setAnimationSpeed(value)}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Intensity: {intensity.toFixed(1)}</Label>
                <Slider
                  value={[intensity]}
                  onValueChange={([value]) => setIntensity(value)}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>
          
          <div className="text-xs text-muted-foreground pt-4 border-t">
            Renderer: {rendererRef.current ? 'Active' : 'Inactive'} • Time: {time.toFixed(2)}s
          </div>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair dark:invert dark:hue-rotate-180"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </VisualizationPageLayout>
  )
} 