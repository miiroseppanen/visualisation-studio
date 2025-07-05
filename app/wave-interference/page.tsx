'use client'

import React, { useState, useRef, useEffect } from 'react'
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

export default function WaveInterferencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
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
  const [resolution, setResolution] = useState(2)
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
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isClient])

  // Calculate wave amplitude at a point
  const calculateWaveAmplitude = (x: number, y: number, time: number): number => {
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
  }

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    const animate = () => {
      setAnimationSettings(prev => ({ ...prev, time: prev.time + animationSettings.speed * 0.02 }))
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

  // Render loop
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    // Draw interference pattern
    if (showInterference) {
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      for (let x = 0; x < width; x += resolution) {
        for (let y = 0; y < height; y += resolution) {
          const amplitude = calculateWaveAmplitude(x, y, animationSettings.time)
          const normalizedAmplitude = (amplitude + 100) / 200 // Normalize to 0-1
          
          // Create interference pattern colors
          const intensity = Math.abs(normalizedAmplitude - 0.5) * 2
          const alpha = 0.3 + intensity * 0.7
          
          const color = isDark 
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(0, 0, 0, ${alpha})`
          
          ctx.fillStyle = color
          ctx.fillRect(x, y, resolution, resolution)
        }
      }
    }

    // Draw wavefronts
    if (showWavefronts) {
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const wavefrontColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
      
      ctx.strokeStyle = wavefrontColor
      ctx.lineWidth = 1

      waveSources.forEach(source => {
        if (!source.active) return

        const phase = source.phase + (animationSettings.time * source.frequency * animationSettings.waveSpeed)
        const wavefrontCount = 8

        for (let i = 0; i < wavefrontCount; i++) {
          const radius = (i * source.wavelength) + (phase * source.wavelength / (2 * Math.PI))
          
          ctx.beginPath()
          ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
    }

    // Draw wave sources
    if (showWaveSources) {
      waveSources.forEach(source => {
        if (!source.active) return

        const color = source.active ? '#3b82f6' : '#6b7280'
        
        // Draw source circle
        ctx.fillStyle = color
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
  }, [waveSources, showWaveSources, showInterference, showWavefronts, resolution, selectedSourceType, animationSettings, theme, isClient])

  // Handle canvas mouse down for adding/dragging sources
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      // Add new source at click location
      const newSource: WaveSource = {
        id: Date.now().toString(),
        x,
        y,
        frequency: 2,
        amplitude: 50,
        phase: 0,
        wavelength: 100,
        active: true
      }
      setWaveSources(prev => [...prev, newSource])
      setIsDragging(true)
      setDraggedSourceId(newSource.id)
    }
  }

  // Handle canvas mouse move for dragging sources
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedSourceId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setWaveSources(prev => prev.map(source => 
      source.id === draggedSourceId ? { ...source, x, y } : source
    ))
  }

  // Handle canvas mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedSourceId(null)
  }

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
  const removeSource = (id: string) => {
    setWaveSources(prev => prev.filter(source => source.id !== id))
  }

  // Update source
  const updateSource = (id: string, updates: Partial<WaveSource>) => {
    setWaveSources(prev => prev.map(source => 
      source.id === id ? { ...source, ...updates } : source
    ))
  }

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
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
  }

  // Reset to defaults
  const resetToDefaults = () => {
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
    setResolution(2)
    setSelectedSourceType('sine')
    setIsAddingSource(false)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading wave interference visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Wave Interference | 
          Sources: {waveSources.filter(s => s.active).length} | 
          Resolution: {resolution}px | 
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
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, waveSourcesExpanded: !prev.waveSourcesExpanded 
            }))}
            onSetSelectedSourceType={setSelectedSourceType}
            onSetIsAddingSource={setIsAddingSource}
            onRemoveSource={removeSource}
            onSetShowWaveSources={setShowWaveSources}
            onSetShowInterference={setShowInterference}
            onSetShowWavefronts={setShowWavefronts}
            onUpdateSource={updateSource}
          />

          <WaveSettings
            resolution={resolution}
            expanded={panelState.waveSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, waveSettingsExpanded: !prev.waveSettingsExpanded 
            }))}
            onSetResolution={setResolution}
          />

          <AnimationControls
            settings={animationSettings}
            onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
            onReset={resetToDefaults}
            expanded={panelState.animationExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, animationExpanded: !prev.animationExpanded 
            }))}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair dark:invert dark:hue-rotate-180"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </VisualizationLayout>
  )
} 