'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import AnimationControls from '@/components/particle-swarm/AnimationControls'
import SwarmSettings from '@/components/particle-swarm/SwarmSettings'
import BehaviorSettings from '@/components/particle-swarm/BehaviorSettings'
import type { ParticleSwarmAnimationSettings, ParticleSwarmPanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  trail: { x: number; y: number; opacity: number }[]
  maxTrailLength: number
}

interface Attractor {
  id: string
  x: number
  y: number
  strength: number
  radius: number
  active: boolean
}

export default function ParticleSwarmPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()

  // Particles state
  const [particles, setParticles] = useState<Particle[]>([])
  const [attractors, setAttractors] = useState<Attractor[]>([
    { id: '1', x: 400, y: 300, strength: 0.5, radius: 100, active: true },
    { id: '2', x: 200, y: 200, strength: -0.3, radius: 80, active: true }
  ])

  // Settings state
  const [particleCount, setParticleCount] = useState(100)
  const [showAttractors, setShowAttractors] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [showParticles, setShowParticles] = useState(true)
  const [isAddingAttractor, setIsAddingAttractor] = useState(false)

  // Behavior settings
  const [cohesionStrength, setCohesionStrength] = useState(0.5)
  const [separationStrength, setSeparationStrength] = useState(0.8)
  const [alignmentStrength, setAlignmentStrength] = useState(0.3)
  const [attractionStrength, setAttractionStrength] = useState(0.4)
  const [maxSpeed, setMaxSpeed] = useState(3)
  const [perceptionRadius, setPerceptionRadius] = useState(50)

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<ParticleSwarmAnimationSettings>({
    isAnimating: true,
    time: 0,
    speed: 1.0
  })

  // Panel state
  const [panelState, setPanelState] = useState<ParticleSwarmPanelState>({
    isOpen: true,
    swarmSettingsExpanded: true,
    behaviorSettingsExpanded: true,
    animationExpanded: false
  })

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [draggedAttractorId, setDraggedAttractorId] = useState<string | null>(null)

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

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
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      setCanvasSize({ width: rect.width, height: rect.height })
    }

    resizeCanvas()
    const resizeObserver = new ResizeObserver(resizeCanvas)
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isClient])

  // Initialize particles
  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvasSize.width
    const height = canvasSize.height
    if (width === 0 || height === 0) return

    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        life: 1,
        maxLife: 1,
        color: '#3b82f6',
        trail: [],
        maxTrailLength: 20
      })
    }
    setParticles(newParticles)
  }, [particleCount, isClient, canvasSize])

  // Calculate flocking behavior
  const calculateFlockingForces = (particle: Particle, allParticles: Particle[]) => {
    let cohesionX = 0
    let cohesionY = 0
    let separationX = 0
    let separationY = 0
    let alignmentX = 0
    let alignmentY = 0
    let neighborCount = 0

    allParticles.forEach(other => {
      if (other.id === particle.id) return

      const dx = other.x - particle.x
      const dy = other.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < perceptionRadius && distance > 0) {
        neighborCount++

        // Cohesion - move toward center of neighbors
        cohesionX += other.x
        cohesionY += other.y

        // Separation - avoid crowding
        const separationForce = 1 / distance
        separationX -= dx * separationForce
        separationY -= dy * separationForce

        // Alignment - match velocity of neighbors
        alignmentX += other.vx
        alignmentY += other.vy
      }
    })

    if (neighborCount > 0) {
      cohesionX /= neighborCount
      cohesionY /= neighborCount
      alignmentX /= neighborCount
      alignmentY /= neighborCount
    }

    return {
      cohesionX: (cohesionX - particle.x) * cohesionStrength,
      cohesionY: (cohesionY - particle.y) * cohesionStrength,
      separationX: separationX * separationStrength,
      separationY: separationY * separationStrength,
      alignmentX: alignmentX * alignmentStrength,
      alignmentY: alignmentY * alignmentStrength
    }
  }

  // Calculate attraction/repulsion from attractors
  const calculateAttractorForces = (particle: Particle) => {
    let attractionX = 0
    let attractionY = 0

    attractors.forEach(attractor => {
      if (!attractor.active) return

      const dx = attractor.x - particle.x
      const dy = attractor.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < attractor.radius && distance > 0) {
        const force = (attractor.strength * attractionStrength) / (distance * distance)
        attractionX += dx * force
        attractionY += dy * force
      }
    })

    return { attractionX, attractionY }
  }

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    const animate = () => {
      setParticles(prevParticles => {
        const canvas = canvasRef.current
        if (!canvas) return prevParticles

        const width = canvas.width / window.devicePixelRatio
        const height = canvas.height / window.devicePixelRatio

        return prevParticles.map(particle => {
          // Calculate forces
          const flocking = calculateFlockingForces(particle, prevParticles)
          const attractor = calculateAttractorForces(particle)

          // Apply forces
          const ax = flocking.cohesionX + flocking.separationX + flocking.alignmentX + attractor.attractionX
          const ay = flocking.cohesionY + flocking.separationY + flocking.alignmentY + attractor.attractionY

          // Update velocity
          let newVx = particle.vx + ax * 0.1
          let newVy = particle.vy + ay * 0.1

          // Limit speed
          const speed = Math.sqrt(newVx * newVx + newVy * newVy)
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed
            newVy = (newVy / speed) * maxSpeed
          }

          // Update position
          let newX = particle.x + newVx
          let newY = particle.y + newVy

          // Wrap around edges
          if (newX < 0) newX = width
          if (newX > width) newX = 0
          if (newY < 0) newY = height
          if (newY > height) newY = 0

          // Update trail
          const newTrail = [...particle.trail, { x: particle.x, y: particle.y, opacity: 1 }]
          if (newTrail.length > particle.maxTrailLength) {
            newTrail.shift()
          }

          // Fade trail
          newTrail.forEach(point => {
            point.opacity *= 0.95
          })

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            trail: newTrail
          }
        })
      })

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
  }, [animationSettings.isAnimating, animationSettings.speed, isClient, cohesionStrength, separationStrength, alignmentStrength, attractionStrength, maxSpeed, perceptionRadius, attractors])

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

    const render = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Draw particle trails
      if (showTrails) {
        particles.forEach(particle => {
          if (particle.trail.length < 2) return

          ctx.beginPath()
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
          
          for (let i = 1; i < particle.trail.length; i++) {
            const point = particle.trail[i]
            const alpha = point.opacity * 0.3
            const color = isDark 
              ? `rgba(255, 255, 255, ${alpha})`
              : `rgba(0, 0, 0, ${alpha})`
            
            ctx.strokeStyle = color
            ctx.lineWidth = 1
            ctx.lineTo(point.x, point.y)
          }
          ctx.stroke()
        })
      }

      // Draw particles
      if (showParticles) {
        particles.forEach(particle => {
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
          const normalizedSpeed = Math.min(speed / maxSpeed, 1)
          
          // Color based on speed
          const hue = 200 + normalizedSpeed * 60 // Blue to cyan
          const color = `hsl(${hue}, 70%, 50%)`
          
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI)
          ctx.fill()
        })
      }

      // Draw attractors
      if (showAttractors) {
        attractors.forEach(attractor => {
          if (!attractor.active) return

          const color = attractor.strength > 0 ? '#10b981' : '#ef4444'
          
          // Draw attractor circle
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(attractor.x, attractor.y, 8, 0, 2 * Math.PI)
          ctx.fill()
          
          // Draw attractor border
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Draw influence radius
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.arc(attractor.x, attractor.y, attractor.radius, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.setLineDash([])
          
          // Draw attractor label
          ctx.fillStyle = 'white'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(attractor.strength > 0 ? '+' : '-', attractor.x, attractor.y)
        })
      }
    }

    // Initial render
    render()

    // Set up animation loop for continuous rendering
    if (animationSettings.isAnimating) {
      const animate = () => {
        render()
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }
  }, [particles, showParticles, showTrails, showAttractors, attractors, maxSpeed, theme, isClient, animationSettings.isAnimating])

  // Handle canvas mouse down for adding/dragging attractors
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on an existing attractor for dragging
    const clickedAttractor = attractors.find(attractor => {
      const distance = Math.sqrt((x - attractor.x) ** 2 + (y - attractor.y) ** 2)
      return distance <= 15 // Click radius
    })

    if (clickedAttractor) {
      setIsDragging(true)
      setDraggedAttractorId(clickedAttractor.id)
    } else if (isAddingAttractor) {
      // Add new attractor at click location
      const newAttractor: Attractor = {
        id: Date.now().toString(),
        x,
        y,
        strength: 0.5,
        radius: 100,
        active: true
      }
      setAttractors(prev => [...prev, newAttractor])
      setIsDragging(true)
      setDraggedAttractorId(newAttractor.id)
    }
  }

  // Handle canvas mouse move for dragging attractors
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedAttractorId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setAttractors(prev => prev.map(attractor => 
      attractor.id === draggedAttractorId ? { ...attractor, x, y } : attractor
    ))
  }

  // Handle canvas mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedAttractorId(null)
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

  // Remove attractor
  const removeAttractor = (id: string) => {
    setAttractors(prev => prev.filter(attractor => attractor.id !== id))
  }

  // Update attractor
  const updateAttractor = (id: string, updates: Partial<Attractor>) => {
    setAttractors(prev => prev.map(attractor => 
      attractor.id === id ? { ...attractor, ...updates } : attractor
    ))
  }

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${attractors.map(attractor => `
          <circle cx="${attractor.x}" cy="${attractor.y}" r="8" fill="${attractor.strength > 0 ? '#10b981' : '#ef4444'}"/>
          <text x="${attractor.x}" y="${attractor.y}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12">${attractor.strength > 0 ? '+' : '-'}</text>
        `).join('')}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'particle-swarm.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setAttractors([
      { id: '1', x: 400, y: 300, strength: 0.5, radius: 100, active: true },
      { id: '2', x: 200, y: 200, strength: -0.3, radius: 80, active: true }
    ])
    setParticleCount(100)
    setCohesionStrength(0.5)
    setSeparationStrength(0.8)
    setAlignmentStrength(0.3)
    setAttractionStrength(0.4)
    setMaxSpeed(3)
    setPerceptionRadius(50)
    setAnimationSettings({
      isAnimating: true,
      time: 0,
      speed: 1.0
    })
    setShowAttractors(true)
    setShowTrails(true)
    setShowParticles(true)
    setIsAddingAttractor(false)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading particle swarm visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Particle Swarm | 
          Particles: {particles.length} | 
          Attractors: {attractors.filter(a => a.active).length} | 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Click to add attractor, drag to move • Wheel to zoom • Use controls to adjust swarm behavior"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <SwarmSettings
            particleCount={particleCount}
            showParticles={showParticles}
            showTrails={showTrails}
            showAttractors={showAttractors}
            isAddingAttractor={isAddingAttractor}
            attractors={attractors}
            expanded={panelState.swarmSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, swarmSettingsExpanded: !prev.swarmSettingsExpanded 
            }))}
            onSetParticleCount={setParticleCount}
            onSetShowParticles={setShowParticles}
            onSetShowTrails={setShowTrails}
            onSetShowAttractors={setShowAttractors}
            onSetIsAddingAttractor={setIsAddingAttractor}
            onRemoveAttractor={removeAttractor}
            onUpdateAttractor={updateAttractor}
          />

          <BehaviorSettings
            cohesionStrength={cohesionStrength}
            separationStrength={separationStrength}
            alignmentStrength={alignmentStrength}
            attractionStrength={attractionStrength}
            maxSpeed={maxSpeed}
            perceptionRadius={perceptionRadius}
            expanded={panelState.behaviorSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, behaviorSettingsExpanded: !prev.behaviorSettingsExpanded 
            }))}
            onSetCohesionStrength={setCohesionStrength}
            onSetSeparationStrength={setSeparationStrength}
            onSetAlignmentStrength={setAlignmentStrength}
            onSetAttractionStrength={setAttractionStrength}
            onSetMaxSpeed={setMaxSpeed}
            onSetPerceptionRadius={setPerceptionRadius}
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