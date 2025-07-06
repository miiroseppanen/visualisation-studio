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
  color: string
}

interface WaveParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface InterferenceField {
  x: number
  y: number
  amplitude: number
  intensity: number
  angle: number
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

  // Wave sources state with colors
  const [waveSources, setWaveSources] = useState<WaveSource[]>([
    { id: '1', x: 200, y: 300, frequency: 2, amplitude: 80, phase: 0, wavelength: 120, active: true, color: '#ff6b6b' },
    { id: '2', x: 800, y: 300, frequency: 2, amplitude: 80, phase: 0, wavelength: 120, active: true, color: '#4ecdc4' },
    { id: '3', x: 500, y: 200, frequency: 1.5, amplitude: 60, phase: 0, wavelength: 150, active: true, color: '#45b7d1' }
  ])

  // Particle system for dynamic effects
  const [particles, setParticles] = useState<WaveParticle[]>([])

  // Settings state
  const [showWaveSources, setShowWaveSources] = useState(true)
  const [showInterference, setShowInterference] = useState(true)
  const [showWavefronts, setShowWavefronts] = useState(true)
  const [showParticles, setShowParticles] = useState(true)
  const [showCircles, setShowCircles] = useState(true)
  const [smoothness, setSmoothness] = useState(12) // Higher for better quality
  const [lineDensity, setLineDensity] = useState(8) // Control for amount of lines
  const [interferenceContrast, setInterferenceContrast] = useState(1.0) // Control for interference pattern contrast
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
    const cellSize = 200
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
    const cacheKey = `${x.toFixed(1)},${y.toFixed(1)},${time.toFixed(2)}`
    const cache = waveCacheRef.current
    
    if (Math.abs(cache.time - time) < 0.01 && cache.points.has(cacheKey)) {
      return cache.points.get(cacheKey)!
    }

    let totalAmplitude = 0
    const activeSources = waveSources.filter(s => s.active)
    
    const cellSize = 200
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    const grid = spatialGridRef.current
    
    const relevantSources: WaveSource[] = []
    
    for (let r = Math.max(0, row - 1); r <= Math.min(grid.length - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(grid[0].length - 1, col + 1); c++) {
        relevantSources.push(...grid[r][c].sources)
      }
    }

    const sourcesToCheck = relevantSources.length > 0 ? relevantSources : activeSources

    sourcesToCheck.forEach(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      
      const maxInfluence = source.amplitude * 4
      if (distance > maxInfluence) return
      
      const phase = source.phase + (time * source.frequency * animationSettings.waveSpeed)
      const wavePhase = (distance / source.wavelength) * 2 * Math.PI + phase
      
      let waveValue = 0
      if (selectedSourceType === 'sine') {
        waveValue = Math.sin(wavePhase)
      } else {
        waveValue = Math.cos(wavePhase)
      }
      
      const amplitudeAtPoint = source.amplitude / (1 + distance / 300)
      totalAmplitude += waveValue * amplitudeAtPoint
    })

    cache.points.set(cacheKey, totalAmplitude)
    cache.time = time
    
    if (cache.points.size > 10000) {
      const entries = Array.from(cache.points.entries())
      cache.points.clear()
      entries.slice(-5000).forEach(([key, value]) => cache.points.set(key, value))
    }

    return totalAmplitude
  }, [waveSources, selectedSourceType, animationSettings.waveSpeed])

  // Generate interference field with enhanced visual effects
  const generateInterferenceField = useCallback((width: number, height: number): InterferenceField[] => {
    const fields: InterferenceField[] = []
    const step = Math.max(6, Math.min(12, 30 / smoothness)) // Base step from smoothness
    const densityStep = Math.max(step, Math.min(step * 3, step + (20 - lineDensity) * 2)) // Adjust step based on line density
    
    for (let x = 0; x < width; x += densityStep) {
      for (let y = 0; y < height; y += densityStep) {
        const amplitude = calculateWaveAmplitude(x, y, animationSettings.time)
        
        // Adjust threshold based on line density - higher density = lower threshold
        const threshold = Math.max(4, 12 - lineDensity)
        if (Math.abs(amplitude) < threshold) continue
        
        const dx = calculateWaveAmplitude(x + step, y, animationSettings.time) - amplitude
        const dy = calculateWaveAmplitude(x, y + step, animationSettings.time) - amplitude
        const intensity = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)
        
        fields.push({
          x,
          y,
          amplitude,
          intensity,
          angle
        })
      }
    }
    
    return fields
  }, [calculateWaveAmplitude, animationSettings.time, smoothness, lineDensity])

  // Update wave circles (replacing particles)
  const updateWaveCircles = useCallback((width: number, height: number) => {
    setParticles(prev => {
      const newCircles = prev.filter(circle => circle.life > 0)
      
      // Limit total circles to prevent performance issues
      if (newCircles.length > 15) { // Much fewer circles for dramatic effect
        return newCircles.slice(0, 15)
      }
      
      // Add new wave circles from wave sources
      waveSources.forEach(source => {
        if (!source.active || Math.random() > 0.8) return // Much rarer circles - only 20% chance
        
        newCircles.push({
          x: source.x,
          y: source.y,
          vx: 0, // Circles expand from center
          vy: 0,
          life: 1.0,
          maxLife: 1.0,
          size: 20, // Start larger for more impact
          color: source.color
        })
      })
      
      // Update existing circles (expand outward)
      newCircles.forEach(circle => {
        circle.size += 2 + Math.random() * 2 // Slower expansion for more dramatic effect
        // No fade - circles maintain full opacity
        
        // Remove circles only when they get too large for performance
        if (circle.size > 1000) { // Very large limit for performance
          circle.life = 0
        }
      })
      
      return newCircles
    })
  }, [waveSources])

  // Separate particle update effect
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const getCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    }

    const circleInterval = setInterval(() => {
      const { width, height } = getCanvasSize()
      updateWaveCircles(width, height)
    }, 300) // Update circles every 300ms for rarer spawning

    return () => {
      clearInterval(circleInterval)
    }
  }, [animationSettings.isAnimating, isClient, updateWaveCircles])

      // Draw immersive interference visualization
    const drawImmersiveInterference = useCallback((ctx: CanvasRenderingContext2D, fields: InterferenceField[], width: number, height: number) => {
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      // Create solid black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)
      

    
    // Draw interference lines in black and white
    if (showInterference) {
      fields.forEach(field => {
        const intensity = Math.min(1, field.intensity / 50) // Higher threshold for stability
        const adjustedIntensity = intensity * interferenceContrast // Apply contrast control
        const alpha = 0.2 + adjustedIntensity * 0.6 // Higher alpha range for black and white
        
        // Pure black and white - no colors
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})` // White lines on black background
        ctx.lineWidth = 0.8 + adjustedIntensity * 1.2 // More stable line width
        
        // Draw lines to represent interference patterns
        const length = 8 + adjustedIntensity * 12 // More stable length calculation
        const endX = field.x + Math.cos(field.angle) * length
        const endY = field.y + Math.sin(field.angle) * length
        
        ctx.beginPath()
        ctx.moveTo(field.x, field.y)
        ctx.lineTo(endX, endY)
        ctx.stroke()
        
        // Draw perpendicular lines for more detail (less frequent)
        if (adjustedIntensity > 0.7) { // Higher threshold for perpendicular lines
          const perpAngle = field.angle + Math.PI / 2
          const perpLength = 4 + adjustedIntensity * 4 // More stable perpendicular length
          const perpEndX = field.x + Math.cos(perpAngle) * perpLength
          const perpEndY = field.y + Math.sin(perpAngle) * perpLength
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})` // Slightly more transparent white
          ctx.lineWidth = 0.5 + adjustedIntensity * 0.3 // More stable perpendicular line width
          ctx.beginPath()
          ctx.moveTo(field.x, field.y)
          ctx.lineTo(perpEndX, perpEndY)
          ctx.stroke()
        }
      })
    }
    
    // Draw wavefronts with dramatic effects
    if (showWavefronts) {
      waveSources.forEach(source => {
        if (!source.active) return
        
        const phase = source.phase + (animationSettings.time * source.frequency * animationSettings.waveSpeed)
        const wavefrontCount = 12 // Increased for more detailed wavefronts
        
        for (let i = 0; i < wavefrontCount; i++) {
          const radius = (i * source.wavelength) + (phase * source.wavelength / (2 * Math.PI))
          const fadeAlpha = Math.max(0.03, 0.5 - (i * 0.04))
          
          ctx.strokeStyle = `${source.color}${Math.floor(fadeAlpha * 255).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 2.5 - (i * 0.15)
          
          ctx.beginPath()
          ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
    }
    
    // Draw interference cross patterns at high amplitude points in black and white
    if (showInterference) {
      const highAmplitudeFields = fields.filter(f => Math.abs(f.amplitude) > 30) // Higher threshold for stability
      const maxCrosses = Math.min(12, highAmplitudeFields.length) // Fewer crosses for stability
      highAmplitudeFields.slice(0, maxCrosses).forEach(field => {
        const amplitude = Math.abs(field.amplitude)
        const adjustedAmplitude = amplitude * interferenceContrast // Apply contrast control
        const alpha = Math.min(0.7, adjustedAmplitude / 100) // Higher alpha for black and white
        
        // Pure black and white - no colors
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})` // White lines on black background
        ctx.lineWidth = 1.2 * interferenceContrast // Apply contrast to line width
        
        // Draw interference cross patterns
        const crossLength = 10 + adjustedAmplitude / 25 // More stable length calculation
        
        // Horizontal line
        ctx.beginPath()
        ctx.moveTo(field.x - crossLength, field.y)
        ctx.lineTo(field.x + crossLength, field.y)
        ctx.stroke()
        
        // Vertical line
        ctx.beginPath()
        ctx.moveTo(field.x, field.y - crossLength)
        ctx.lineTo(field.x, field.y + crossLength)
        ctx.stroke()
        
        // Diagonal lines for more detail
        if (adjustedAmplitude > 50) { // Higher threshold for diagonal lines
          ctx.lineWidth = 0.8 * interferenceContrast
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})` // Slightly more transparent white
          
          // Diagonal line 1
          ctx.beginPath()
          ctx.moveTo(field.x - crossLength * 0.6, field.y - crossLength * 0.6)
          ctx.lineTo(field.x + crossLength * 0.6, field.y + crossLength * 0.6)
          ctx.stroke()
          
          // Diagonal line 2
          ctx.beginPath()
          ctx.moveTo(field.x - crossLength * 0.6, field.y + crossLength * 0.6)
          ctx.lineTo(field.x + crossLength * 0.6, field.y - crossLength * 0.6)
          ctx.stroke()
        }
      })
    }
    
    // Draw spreading wave circles (lines only)
    if (showCircles) {
      particles.forEach(circle => {
        const size = Math.max(0.1, circle.size)
        
        // Only draw if size is valid
        if (size <= 0) return
        
        // Draw main circle with source color (full opacity)
        ctx.strokeStyle = `${circle.color}ff` // Full opacity
        ctx.lineWidth = 2 // Consistent line width
        
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, size, 0, 2 * Math.PI)
        ctx.stroke()
        
        // Draw inner circle for more definition
        ctx.strokeStyle = `${circle.color}aa` // Slightly transparent inner circle
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, size * 0.7, 0, 2 * Math.PI)
        ctx.stroke()
      })
    }
    
    // Draw wave sources with dramatic styling
    if (showWaveSources) {
      waveSources.forEach(source => {
        if (!source.active) return
        
        // Source glow
        const sourceGlow = ctx.createRadialGradient(
          source.x, source.y, 0,
          source.x, source.y, 30
        )
        sourceGlow.addColorStop(0, `${source.color}80`)
        sourceGlow.addColorStop(1, 'transparent')
        
        ctx.fillStyle = sourceGlow
        ctx.beginPath()
        ctx.arc(source.x, source.y, 30, 0, 2 * Math.PI)
        ctx.fill()
        
        // Source core
        ctx.fillStyle = source.color
        ctx.beginPath()
        ctx.arc(source.x, source.y, 12, 0, 2 * Math.PI)
        ctx.fill()
        
        // Source border
        ctx.strokeStyle = isDark ? '#ffffff' : '#000000'
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Source label
        ctx.fillStyle = isDark ? '#ffffff' : '#000000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(source.id, source.x, source.y)
      })
    }
  }, [calculateWaveAmplitude, animationSettings.time, theme, waveSources, particles, showWavefronts, showParticles, showWaveSources, showInterference, showCircles, interferenceContrast])

  // Performance optimization: Adaptive frame rate
  const updateFrameRate = useCallback(() => {
    const now = performance.now()
    const delta = now - lastFrameTime
    const currentFPS = 1000 / delta
    
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
      
      updateSpatialGrid(waveSources, rect.width, rect.height)
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
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

    // Generate interference field only if enabled
    const fields = showInterference ? generateInterferenceField(width, height) : []
    
    // Always draw the visualization (background, circles, sources, etc.)
    drawImmersiveInterference(ctx, fields, width, height)
  }, [showInterference, generateInterferenceField, drawImmersiveInterference])

  // Render loop with performance optimization
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    render()

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

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${theme === 'dark' ? '#0a0a0a' : '#f8fafc'}"/>
        ${waveSources.map(source => `
          <circle cx="${source.x}" cy="${source.y}" r="12" fill="${source.color}"/>
          <text x="${source.x}" y="${source.y}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="14">${source.id}</text>
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
  }, [waveSources, theme])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setWaveSources([
      { id: '1', x: 200, y: 300, frequency: 2, amplitude: 80, phase: 0, wavelength: 120, active: true, color: '#ff6b6b' },
      { id: '2', x: 800, y: 300, frequency: 2, amplitude: 80, phase: 0, wavelength: 120, active: true, color: '#4ecdc4' },
      { id: '3', x: 500, y: 200, frequency: 1.5, amplitude: 60, phase: 0, wavelength: 150, active: true, color: '#45b7d1' }
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
    setShowParticles(true)
    setShowCircles(true)
    setShowInterference(true)
    setSmoothness(12)
    setInterferenceContrast(1.0)
    setLineDensity(8)
    setSelectedSourceType('sine')
    setIsAddingSource(false)
    setIsDragging(false)
    setDraggedSourceId(null)
    setFrameRate(60)
    setParticles([])
    
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

    const clickedSource = waveSources.find(source => {
      const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
      return distance <= 20
    })

    if (clickedSource) {
      setIsDragging(true)
      setDraggedSourceId(clickedSource.id)
    } else if (isAddingSource) {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
      const newId = (Math.max(...waveSources.map(s => parseInt(s.id))) + 1).toString()
      const newSource: WaveSource = {
        id: newId,
        x,
        y,
        frequency: selectedSourceType === 'sine' ? 2 : 1.5,
        amplitude: 80,
        phase: 0,
        wavelength: 120,
        active: true,
        color: colors[Math.floor(Math.random() * colors.length)]
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
          Circles: {particles.length} | 
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
            showCircles={showCircles}
            expanded={panelState.waveSourcesExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, waveSourcesExpanded: !prev.waveSourcesExpanded }))}
            onSetSelectedSourceType={setSelectedSourceType}
            onSetIsAddingSource={setIsAddingSource}
            onRemoveSource={removeSource}
            onSetShowWaveSources={setShowWaveSources}
            onSetShowInterference={setShowInterference}
            onSetShowWavefronts={setShowWavefronts}
            onSetShowCircles={setShowCircles}
            onUpdateSource={updateSource}
          />

          <WaveSettings
            resolution={smoothness}
            lineDensity={lineDensity}
            interferenceContrast={interferenceContrast}
            expanded={panelState.waveSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, waveSettingsExpanded: !prev.waveSettingsExpanded }))}
            onSetResolution={setSmoothness}
            onSetLineDensity={setLineDensity}
            onSetInterferenceContrast={setInterferenceContrast}
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