'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import AnimationControls from '@/components/wave-interference/AnimationControls'
import WaveSourceControls from '@/components/wave-interference/WaveSourceControls'
import WaveSettings from '@/components/wave-interference/WaveSettings'
import type { WaveInterferenceAnimationSettings, WaveInterferencePanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'

interface WaveSource {
  id: string
  x: number
  y: number
  frequency: number
  amplitude: number
  phase: number
  wavelength: number
  active: boolean
}

interface InterferenceLine {
  x1: number
  y1: number
  x2: number
  y2: number
  intensity: number
}

export default function WaveInterferencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const renderFrameRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()

  // Wave sources state
  const [waveSources, setWaveSources] = useState<WaveSource[]>([
    { id: '1', x: 200, y: 300, frequency: 2, amplitude: 50, phase: 0, wavelength: 100, active: true },
    { id: '2', x: 600, y: 300, frequency: 2, amplitude: 50, phase: 0, wavelength: 100, active: true },
    { id: '3', x: 400, y: 200, frequency: 1.5, amplitude: 40, phase: 0, wavelength: 120, active: true }
  ])

  // Settings state
  const [showWaveSources, setShowWaveSources] = useState(true)
  const [showInterference, setShowInterference] = useState(true)
  const [showWavefronts, setShowWavefronts] = useState(true)
  const [lineDensity, setLineDensity] = useState(50)
  const [selectedSourceType, setSelectedSourceType] = useState<'sine' | 'cosine'>('sine')
  const [isAddingSource, setIsAddingSource] = useState(false)

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<WaveInterferenceAnimationSettings>({
    isAnimating: true,
    time: 0,
    speed: 1.0,
    waveSpeed: 2.0
  })

  // Panel state
  const [panelState, setPanelState] = useState<WaveInterferencePanelState>({
    isOpen: true,
    waveSourcesExpanded: true,
    waveSettingsExpanded: true,
    animationExpanded: false
  })

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [draggedSourceId, setDraggedSourceId] = useState<string | null>(null)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Canvas setup and resize handling
  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      // Ensure the canvas context is properly scaled
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Use ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      resizeObserver.disconnect()
    }
  }, [isClient])

  // Memoized wave amplitude calculation
  const calculateWaveAmplitude = useCallback((x: number, y: number, time: number): number => {
    let totalAmplitude = 0

    waveSources.forEach(source => {
      if (!source.active) return

      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      const phase = source.phase + (time * source.frequency * animationSettings.waveSpeed)
      const wavePhase = (distance / source.wavelength) * 2 * Math.PI + phase
      
      let waveValue = 0
      if (selectedSourceType === 'sine') {
        waveValue = Math.sin(wavePhase)
      } else {
        waveValue = Math.cos(wavePhase)
      }
      
      // Amplitude decreases with distance
      const amplitudeAtPoint = source.amplitude / (1 + distance / 200)
      totalAmplitude += waveValue * amplitudeAtPoint
    })

    return totalAmplitude
  }, [waveSources, selectedSourceType, animationSettings.waveSpeed])

  // Generate interference lines
  const generateInterferenceLines = useCallback((width: number, height: number): InterferenceLine[] => {
    const lines: InterferenceLine[] = []
    const spacing = Math.max(5, Math.min(20, 1000 / lineDensity))
    
    // Generate horizontal lines
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width - spacing; x += spacing) {
        const amplitude1 = calculateWaveAmplitude(x, y, animationSettings.time)
        const amplitude2 = calculateWaveAmplitude(x + spacing, y, animationSettings.time)
        
        const intensity = Math.abs(amplitude1 - amplitude2) / 100
        if (intensity > 0.1) {
          lines.push({
            x1: x,
            y1: y,
            x2: x + spacing,
            y2: y,
            intensity: Math.min(1, intensity)
          })
        }
      }
    }
    
    // Generate vertical lines
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height - spacing; y += spacing) {
        const amplitude1 = calculateWaveAmplitude(x, y, animationSettings.time)
        const amplitude2 = calculateWaveAmplitude(x, y + spacing, animationSettings.time)
        
        const intensity = Math.abs(amplitude1 - amplitude2) / 100
        if (intensity > 0.1) {
          lines.push({
            x1: x,
            y1: y,
            x2: x,
            y2: y + spacing,
            intensity: Math.min(1, intensity)
          })
        }
      }
    }
    
    return lines
  }, [calculateWaveAmplitude, animationSettings.time, lineDensity])

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    let frameId: number | null = null

    const animate = () => {
      setAnimationSettings(prev => ({ ...prev, time: prev.time + animationSettings.speed * 0.02 }))
      
      frameId = requestAnimationFrame(animate)
      animationRef.current = frameId
      registerAnimationFrame(frameId)
    }

    frameId = requestAnimationFrame(animate)
    animationRef.current = frameId
    registerAnimationFrame(frameId)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
        unregisterAnimationFrame(frameId)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [animationSettings.isAnimating, animationSettings.speed, isClient])

  // Handle pause all animations
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      if (renderFrameRef.current) {
        cancelAnimationFrame(renderFrameRef.current)
        renderFrameRef.current = undefined
      }
    }

    const handleBeforeUnload = () => {
      handlePauseAllAnimations()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePauseAllAnimations()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      handlePauseAllAnimations()
    }
  }, [])

  // Memoized render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    // Clear canvas with theme-appropriate background
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ctx.fillStyle = isDark ? '#000000' : '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw interference pattern as lines
    if (showInterference) {
      const lines = generateInterferenceLines(width, height)
      
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000'
      ctx.lineCap = 'round'
      
      lines.forEach(line => {
        ctx.lineWidth = line.intensity * 3 + 0.5
        ctx.globalAlpha = line.intensity * 0.8 + 0.2
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()
      })
      
      ctx.globalAlpha = 1
    }

    // Draw wavefronts as circles
    if (showWavefronts) {
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000'
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3

      waveSources.forEach(source => {
        if (!source.active) return

        const phase = source.phase + (animationSettings.time * source.frequency * animationSettings.waveSpeed)
        const wavefrontCount = 6

        for (let i = 0; i < wavefrontCount; i++) {
          const radius = (i * source.wavelength) + (phase * source.wavelength / (2 * Math.PI))
          
          ctx.beginPath()
          ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
      
      ctx.globalAlpha = 1
    }

    // Draw wave sources with colors
    if (showWaveSources) {
      waveSources.forEach(source => {
        if (!source.active) return

        // Draw source circle with color
        ctx.fillStyle = source.active ? '#3b82f6' : '#6b7280'
        ctx.beginPath()
        ctx.arc(source.x, source.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw source border
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw source label
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(source.id, source.x, source.y)
      })
    }
  }, [showInterference, showWavefronts, showWaveSources, waveSources, generateInterferenceLines, animationSettings.time, theme])

  // Render loop with proper cleanup
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    // Initial render
    render()

    // Set up animation loop for continuous rendering only when animating
    if (animationSettings.isAnimating) {
      const animate = () => {
        render()
        renderFrameRef.current = requestAnimationFrame(animate)
      }
      renderFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (renderFrameRef.current) {
        cancelAnimationFrame(renderFrameRef.current)
        renderFrameRef.current = undefined
      }
    }
  }, [render, isClient, animationSettings.isAnimating])

  // Wheel event handler
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

  // Remove source
  const removeSource = useCallback((id: string) => {
    setWaveSources(prev => prev.filter(source => source.id !== id))
  }, [])

  // Update source
  const updateSource = useCallback((id: string, updates: Partial<WaveSource>) => {
    setWaveSources(prev => prev.map(source => 
      source.id === id ? { ...source, ...updates } : source
    ))
  }, [])

  // Export as SVG
  const exportSVG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio
    const lines = generateInterferenceLines(width, height)

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${lines.map(line => `
          <line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" 
                stroke="black" stroke-width="${line.intensity * 3 + 0.5}" 
                opacity="${line.intensity * 0.8 + 0.2}"/>
        `).join('')}
        ${waveSources.map(source => `
          <circle cx="${source.x}" cy="${source.y}" r="8" fill="${source.active ? '#3b82f6' : '#6b7280'}"/>
          <text x="${source.x}" y="${source.y}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12">${source.id}</text>
        `).join('')}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'wave-interference.svg'
    link.click()
    URL.revokeObjectURL(url)
  }, [waveSources, generateInterferenceLines])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setWaveSources([
      { id: '1', x: 200, y: 300, frequency: 2, amplitude: 50, phase: 0, wavelength: 100, active: true },
      { id: '2', x: 600, y: 300, frequency: 2, amplitude: 50, phase: 0, wavelength: 100, active: true },
      { id: '3', x: 400, y: 200, frequency: 1.5, amplitude: 40, phase: 0, wavelength: 120, active: true }
    ])
    setAnimationSettings({
      isAnimating: true,
      time: 0,
      speed: 1.0,
      waveSpeed: 2.0
    })
    setShowWaveSources(true)
    setShowInterference(true)
    setShowWavefronts(true)
    setLineDensity(50)
    setSelectedSourceType('sine')
    setIsAddingSource(false)
    setIsDragging(false)
    setDraggedSourceId(null)
  }, [])

  // Handle canvas mouse down for adding/dragging sources
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on an existing source for dragging
    const clickedSource = waveSources.find(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      return distance <= 15 // Click radius
    })

    if (clickedSource) {
      setIsDragging(true)
      setDraggedSourceId(clickedSource.id)
    } else if (isAddingSource) {
      // Add new source
      const newId = (Math.max(...waveSources.map(s => parseInt(s.id))) + 1).toString()
      const newSource: WaveSource = {
        id: newId,
        x,
        y,
        frequency: selectedSourceType === 'sine' ? 2 : 1.5,
        amplitude: 50,
        phase: 0,
        wavelength: 100,
        active: true
      }
      setWaveSources(prev => [...prev, newSource])
      setIsAddingSource(false)
    }
  }, [waveSources, isAddingSource, selectedSourceType])

  // Handle canvas mouse move for dragging
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedSourceId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateSource(draggedSourceId, { x, y })
  }, [isDragging, draggedSourceId, updateSource])

  // Handle canvas mouse up
  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedSourceId(null)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Wave Interference | 
          Sources: {waveSources.filter(s => s.active).length} | 
          Line Density: {lineDensity} | 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Click to add source, drag to move • Wheel to zoom • Use controls to adjust wave properties"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <WaveSourceControls
            waveSources={waveSources}
            selectedSourceType={selectedSourceType}
            isAddingSource={isAddingSource}
            showWaveSources={showWaveSources}
            showInterference={showInterference}
            showWavefronts={showWavefronts}
            expanded={panelState.waveSourcesExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, waveSourcesExpanded: !prev.waveSourcesExpanded }))}
            onSetSelectedSourceType={setSelectedSourceType}
            onSetIsAddingSource={setIsAddingSource}
            onRemoveSource={removeSource}
            onSetShowWaveSources={setShowWaveSources}
            onSetShowInterference={setShowInterference}
            onSetShowWavefronts={setShowWavefronts}
            onUpdateSource={updateSource}
          />
          
          <WaveSettings
            resolution={lineDensity}
            expanded={panelState.waveSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, waveSettingsExpanded: !prev.waveSettingsExpanded }))}
            onSetResolution={setLineDensity}
          />
          
          <AnimationControls
            settings={animationSettings}
            onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
            onReset={resetToDefaults}
            expanded={panelState.animationExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, animationExpanded: !prev.animationExpanded }))}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
        style={{ display: 'block' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </VisualizationLayout>
  )
} 