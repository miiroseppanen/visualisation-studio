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

interface InterferencePoint {
  x: number
  y: number
  amplitude: number
  gradient: number
}

// Performance optimization: Spatial partitioning for wave sources
interface SpatialCell {
  sources: WaveSource[]
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}

// Performance optimization: Memoized wave calculations
interface WaveCache {
  time: number
  points: Map<string, number>
  lastUpdate: number
}

export default function WaveInterferencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const renderFrameRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()

  // Performance optimization: Cache for wave calculations
  const waveCacheRef = useRef<WaveCache>({
    time: 0,
    points: new Map(),
    lastUpdate: 0
  })

  // Performance optimization: Spatial partitioning
  const spatialGridRef = useRef<SpatialCell[][]>([])

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
  const [smoothness, setSmoothness] = useState(8) // Controls sampling density
  const [selectedSourceType, setSelectedSourceType] = useState<'sine' | 'cosine'>('sine')
  const [isAddingSource, setIsAddingSource] = useState(false)

  // Performance optimization: Adaptive rendering
  const [frameRate, setFrameRate] = useState(60)
  const [lastFrameTime, setLastFrameTime] = useState(0)

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

  // Performance optimization: Update spatial grid when sources change
  const updateSpatialGrid = useCallback((sources: WaveSource[], width: number, height: number) => {
    const cellSize = 200 // Optimal cell size for performance
    const cols = Math.ceil(width / cellSize)
    const rows = Math.ceil(height / cellSize)
    
    const grid: SpatialCell[][] = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => ({ sources: [], bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } }))
    )

    sources.forEach(source => {
      if (!source.active) return
      
      const col = Math.floor(source.x / cellSize)
      const row = Math.floor(source.y / cellSize)
      
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        grid[row][col].sources.push(source)
        grid[row][col].bounds = {
          minX: col * cellSize,
          minY: row * cellSize,
          maxX: (col + 1) * cellSize,
          maxY: (row + 1) * cellSize
        }
      }
    })

    spatialGridRef.current = grid
  }, [])

  // Performance optimization: Memoized wave amplitude calculation with spatial partitioning
  const calculateWaveAmplitude = useCallback((x: number, y: number, time: number): number => {
    // Check cache first
    const cacheKey = `${x.toFixed(1)},${y.toFixed(1)},${time.toFixed(2)}`
    const cache = waveCacheRef.current
    
    if (Math.abs(cache.time - time) < 0.01 && cache.points.has(cacheKey)) {
      return cache.points.get(cacheKey)!
    }

    let totalAmplitude = 0
    const activeSources = waveSources.filter(s => s.active)
    
    // Use spatial partitioning to only check relevant sources
    const cellSize = 200
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    const grid = spatialGridRef.current
    
    const relevantSources: WaveSource[] = []
    
    // Check current cell and adjacent cells
    for (let r = Math.max(0, row - 1); r <= Math.min(grid.length - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(grid[0].length - 1, col + 1); c++) {
        relevantSources.push(...grid[r][c].sources)
      }
    }

    // Fallback to all sources if spatial partitioning fails
    const sourcesToCheck = relevantSources.length > 0 ? relevantSources : activeSources

    sourcesToCheck.forEach(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      
      // Performance optimization: Skip sources that are too far away
      const maxInfluence = source.amplitude * 3
      if (distance > maxInfluence) return
      
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

    // Cache the result
    cache.points.set(cacheKey, totalAmplitude)
    cache.time = time
    
    // Limit cache size for memory management
    if (cache.points.size > 10000) {
      const entries = Array.from(cache.points.entries())
      cache.points.clear()
      entries.slice(-5000).forEach(([key, value]) => cache.points.set(key, value))
    }

    return totalAmplitude
  }, [waveSources, selectedSourceType, animationSettings.waveSpeed])

  // Performance optimization: Adaptive sampling based on smoothness
  const generateSmoothInterference = useCallback((width: number, height: number): InterferencePoint[] => {
    const points: InterferencePoint[] = []
    
    // Adaptive step size based on smoothness and performance
    const baseStep = Math.max(2, Math.min(8, 20 / smoothness)) // Improved sampling density
    const adaptiveStep = Math.max(baseStep, Math.min(baseStep * 1.5, width / 80))
    
    // Performance optimization: Reduce sampling in areas with low activity
    const step = adaptiveStep
    
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const amplitude = calculateWaveAmplitude(x, y, animationSettings.time)
        
        // Skip points with very low amplitude for performance
        if (Math.abs(amplitude) < 1) continue // Lower threshold for better detail
        
        // Calculate gradient for smooth transitions
        const dx = calculateWaveAmplitude(x + step, y, animationSettings.time) - amplitude
        const dy = calculateWaveAmplitude(x, y + step, animationSettings.time) - amplitude
        const gradient = Math.sqrt(dx * dx + dy * dy)
        
        points.push({
          x,
          y,
          amplitude,
          gradient
        })
      }
    }
    
    return points
  }, [calculateWaveAmplitude, animationSettings.time, smoothness])

  // Performance optimization: Optimized drawing with reduced operations
  const drawSmoothInterference = useCallback((ctx: CanvasRenderingContext2D, points: InterferencePoint[], width: number, height: number) => {
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    // Create gradient for smooth color transitions
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    
    if (isDark) {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)')
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)')
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.4)')
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw interference patterns using smooth curves
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Draw interference lines along amplitude contours
    const contourThresholds = isDark ? [0.2, 0.4, 0.6, 0.8] : [0.2, 0.4, 0.6, 0.8]
    
    contourThresholds.forEach((threshold, index) => {
      const alpha = isDark ? 0.3 - index * 0.05 : 0.3 - index * 0.05
      const lineWidth = 2 - index * 0.3
      
      ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`
      ctx.lineWidth = lineWidth
      
      // Find contour points
      const contourPoints: { x: number; y: number }[] = []
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i]
        if (Math.abs(point.amplitude) > threshold * 50) {
          contourPoints.push({ x: point.x, y: point.y })
        }
      }
      
      // Draw smooth curves through contour points
      if (contourPoints.length > 2) {
        ctx.beginPath()
        
        // Use quadratic curves for smooth paths with performance optimization
        const step = Math.max(1, Math.floor(contourPoints.length / 100)) // Reduced for performance but still smooth
        
        for (let i = 0; i < contourPoints.length - 2; i += step) {
          const p1 = contourPoints[i]
          const p2 = contourPoints[i + 1]
          const p3 = contourPoints[i + 2]
          
          if (i === 0) {
            ctx.moveTo(p1.x, p1.y)
          }
          
          const cp1x = p1.x + (p2.x - p1.x) * 0.5
          const cp1y = p1.y + (p2.y - p1.y) * 0.5
          const cp2x = p2.x + (p3.x - p2.x) * 0.5
          const cp2y = p2.y + (p3.y - p2.y) * 0.5
          
          ctx.quadraticCurveTo(cp1x, cp1y, p2.x, p2.y)
        }
        
        ctx.stroke()
      }
    })
    
    // Draw flowing streamlines
    const streamlineCount = Math.min(30, Math.floor(width * height / 8000)) // Increased for better visual effect
    ctx.lineWidth = 1
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
    
    for (let i = 0; i < streamlineCount; i++) {
      const startX = Math.random() * width
      const startY = Math.random() * height
      
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      
      let x = startX
      let y = startY
      const steps = 40 // Increased for longer, more flowing lines
      
      for (let step = 0; step < steps; step++) {
        const amplitude = calculateWaveAmplitude(x, y, animationSettings.time)
        const dx = calculateWaveAmplitude(x + 5, y, animationSettings.time) - amplitude
        const dy = calculateWaveAmplitude(x, y + 5, animationSettings.time) - amplitude
        
        const length = Math.sqrt(dx * dx + dy * dy)
        if (length > 0) {
          x += (dx / length) * 3
          y += (dy / length) * 3
          
          if (x >= 0 && x < width && y >= 0 && y < height) {
            ctx.lineTo(x, y)
          } else {
            break
          }
        } else {
          break
        }
      }
      
      ctx.stroke()
    }
  }, [calculateWaveAmplitude, animationSettings.time, theme])

  // Performance optimization: Adaptive frame rate
  const updateFrameRate = useCallback(() => {
    const now = performance.now()
    const delta = now - lastFrameTime
    const currentFPS = 1000 / delta
    
    // Adjust frame rate based on performance
    if (currentFPS < 30) {
      setFrameRate(prev => Math.max(15, prev - 5))
    } else if (currentFPS > 55) {
      setFrameRate(prev => Math.min(60, prev + 2))
    }
    
    setLastFrameTime(now)
  }, [lastFrameTime])

  // Animation loop with performance optimization
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    let frameId: number | null = null
    let lastUpdate = 0

    const animate = (currentTime: number) => {
      // Performance optimization: Throttle updates based on frame rate
      const targetInterval = 1000 / frameRate
      if (currentTime - lastUpdate < targetInterval) {
        frameId = requestAnimationFrame(animate)
        return
      }
      
      lastUpdate = currentTime
      setAnimationSettings(prev => ({ ...prev, time: prev.time + animationSettings.speed * 0.02 }))
      updateFrameRate()
      
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
  }, [animationSettings.isAnimating, animationSettings.speed, isClient, frameRate, updateFrameRate])

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

  // Canvas setup and resize handling with performance optimization
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
      
      // Update spatial grid when canvas size changes
      updateSpatialGrid(waveSources, rect.width, rect.height)
      
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
  }, [isClient, waveSources, updateSpatialGrid])

  // Performance optimization: Update spatial grid when sources change
  useEffect(() => {
    if (!isClient) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    updateSpatialGrid(waveSources, rect.width, rect.height)
  }, [waveSources, updateSpatialGrid, isClient])

  // Memoized render function with performance optimization
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

    // Draw smooth interference pattern
    if (showInterference) {
      const points = generateSmoothInterference(width, height)
      drawSmoothInterference(ctx, points, width, height)
    }

    // Draw wavefronts as smooth circles with performance optimization
    if (showWavefronts) {
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000'
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.2

      waveSources.forEach(source => {
        if (!source.active) return

        const phase = source.phase + (animationSettings.time * source.frequency * animationSettings.waveSpeed)
        const wavefrontCount = 6 // Increased for better visual effect

        for (let i = 0; i < wavefrontCount; i++) {
          const radius = (i * source.wavelength) + (phase * source.wavelength / (2 * Math.PI))
          
          // Fade out wavefronts with distance
          const fadeAlpha = Math.max(0.1, 0.3 - (i * 0.03))
          ctx.globalAlpha = fadeAlpha
          
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
  }, [showInterference, showWavefronts, showWaveSources, waveSources, generateSmoothInterference, drawSmoothInterference, animationSettings.time, theme])

  // Render loop with performance optimization
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
    const points = generateSmoothInterference(width, height)

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${theme === 'dark' ? 'black' : 'white'}"/>
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
  }, [waveSources, generateSmoothInterference, theme])

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
    setSmoothness(8)
    setSelectedSourceType('sine')
    setIsAddingSource(false)
    setIsDragging(false)
    setDraggedSourceId(null)
    setFrameRate(60)
    
    // Clear cache
    waveCacheRef.current = {
      time: 0,
      points: new Map(),
      lastUpdate: 0
    }
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
          Smoothness: {smoothness} | 
          FPS: {frameRate} | 
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
            resolution={smoothness}
            expanded={panelState.waveSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, waveSettingsExpanded: !prev.waveSettingsExpanded }))}
            onSetResolution={setSmoothness}
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