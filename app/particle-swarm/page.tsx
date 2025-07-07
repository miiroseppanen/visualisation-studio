'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Download, RotateCcw, Settings, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import AnimationControls from '@/components/particle-swarm/AnimationControls'
import SwarmSettings from '@/components/particle-swarm/SwarmSettings'
import BehaviorSettings from '@/components/particle-swarm/BehaviorSettings'
import type { ParticleSwarmAnimationSettings, ParticleSwarmPanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'
import { FullScreenLoader } from '@/components/ui/loader'
import { useTranslation } from 'react-i18next'

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  type: 'normal' | 'attractor' | 'repeller'
}

interface Attractor {
  x: number
  y: number
  strength: number
  radius: number
  type: 'attract' | 'repel'
}

export default function ParticleSwarmPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const renderFrameRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const attractorsRef = useRef<Attractor[]>([])
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Particle system state
  const [particles, setParticles] = useState<Particle[]>([])
  const [attractors, setAttractors] = useState<Attractor[]>([])

  // Settings state
  const [particleCount, setParticleCount] = useState(200)
  const [showParticles, setShowParticles] = useState(true)
  const [showAttractors, setShowAttractors] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [showConnections, setShowConnections] = useState(false)
  const [particleSize, setParticleSize] = useState(2)
  const [trailLength, setTrailLength] = useState(20)
  const [connectionDistance, setConnectionDistance] = useState(50)

  // Physics settings
  const [flockStrength, setFlockStrength] = useState(0.3)
  const [separationStrength, setSeparationStrength] = useState(0.8)
  const [alignmentStrength, setAlignmentStrength] = useState(0.5)
  const [attractionStrength, setAttractionStrength] = useState(0.4)
  const [maxSpeed, setMaxSpeed] = useState(2.0)
  const [friction, setFriction] = useState(0.98)

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
    animationExpanded: true
  })

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
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      setCanvasSize({ width, height });
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

  // Initialize particle system
  useEffect(() => {
    if (!isClient || canvasSize.width === 0 || canvasSize.height === 0) return

    const width = canvasSize.width
    const height = canvasSize.height

    // Create particles
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: particleSize,
        life: 1,
        maxLife: 1,
        type: 'normal'
      })
    }

    // Create attractors
    const newAttractors: Attractor[] = [
      {
        x: width * 0.25,
        y: height * 0.25,
        strength: 0.5,
        radius: 100,
        type: 'attract'
      },
      {
        x: width * 0.75,
        y: height * 0.75,
        strength: -0.3,
        radius: 80,
        type: 'repel'
      }
    ]

    setParticles(newParticles)
    setAttractors(newAttractors)
    particlesRef.current = newParticles
    attractorsRef.current = newAttractors
  }, [isClient, canvasSize, particleCount, particleSize])

  // Animation loop
  useEffect(() => {
    if (!isClient || !animationSettings.isAnimating || canvasSize.width === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    const animate = () => {
      if (!animationSettings.isAnimating) return

      // Clear canvas with fade effect
      ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update particles
      setParticles(prevParticles => {
        const currentParticles = prevParticles
        return currentParticles.map(particle => {
          // Apply flocking behavior
          let flockX = 0
          let flockY = 0
          let separationX = 0
          let separationY = 0
          let alignmentX = 0
          let alignmentY = 0
          let neighborCount = 0

          // Find neighbors
          currentParticles.forEach(other => {
            if (other.id === particle.id) return
            
            const dx = other.x - particle.x
            const dy = other.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < connectionDistance && distance > 0) {
              neighborCount++
              
              // Flocking (cohesion)
              flockX += other.x
              flockY += other.y
              
              // Separation
              const separationForce = 1 / distance
              separationX -= dx * separationForce
              separationY -= dy * separationForce
              
              // Alignment
              alignmentX += other.vx
              alignmentY += other.vy
            }
          })

          // Apply flocking forces
          if (neighborCount > 0) {
            flockX /= neighborCount
            flockY /= neighborCount
            alignmentX /= neighborCount
            alignmentY /= neighborCount
            
            particle.vx += (flockX - particle.x) * flockStrength * 0.01
            particle.vy += (flockY - particle.y) * flockStrength * 0.01
            particle.vx += separationX * separationStrength * 0.01
            particle.vy += separationY * separationStrength * 0.01
            particle.vx += alignmentX * alignmentStrength * 0.01
            particle.vy += alignmentY * alignmentStrength * 0.01
          }

          // Apply attractor forces
          attractorsRef.current.forEach(attractor => {
            const dx = attractor.x - particle.x
            const dy = attractor.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < attractor.radius && distance > 0) {
              const force = attractor.strength * (1 - distance / attractor.radius)
              particle.vx += (dx / distance) * force * attractionStrength * 0.01
              particle.vy += (dy / distance) * force * attractionStrength * 0.01
            }
          })

          // Apply friction and speed limits
          particle.vx *= friction
          particle.vy *= friction
          
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
          if (speed > maxSpeed) {
            particle.vx = (particle.vx / speed) * maxSpeed
            particle.vy = (particle.vy / speed) * maxSpeed
          }

          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = width
          if (particle.x > width) particle.x = 0
          if (particle.y < 0) particle.y = height
          if (particle.y > height) particle.y = 0

          return particle
        })
      })

      // Draw particles
      if (showParticles) {
        particlesRef.current.forEach(particle => {
          ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
          ctx.globalAlpha = 0.8
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Draw connections
      if (showConnections) {
        ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000'
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.3
        
        particlesRef.current.forEach(particle => {
          particlesRef.current.forEach(other => {
            if (particle.id >= other.id) return
            
            const dx = other.x - particle.x
            const dy = other.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < connectionDistance) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(other.x, other.y)
              ctx.stroke()
            }
          })
        })
      }

      // Draw attractors
      if (showAttractors) {
        attractorsRef.current.forEach(attractor => {
          ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000'
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.4
          ctx.beginPath()
          ctx.arc(attractor.x, attractor.y, attractor.radius, 0, Math.PI * 2)
          ctx.stroke()
          
          ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
          ctx.globalAlpha = 0.6
          ctx.beginPath()
          ctx.arc(attractor.x, attractor.y, 4, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isClient, animationSettings.isAnimating, canvasSize, theme, showParticles, showAttractors, showConnections, flockStrength, separationStrength, alignmentStrength, attractionStrength, maxSpeed, friction, connectionDistance])

  // Keep refs in sync with state
  useEffect(() => {
    particlesRef.current = particles
  }, [particles])

  useEffect(() => {
    attractorsRef.current = attractors
  }, [attractors])

  // Handle zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    setZoomLevel(prev => {
      const newZoom = prev * (1 + delta * ZOOM_SENSITIVITY)
      return Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, newZoom))
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Reset animation
  const handleReset = useCallback(() => {
    setAnimationSettings(prev => ({ ...prev, time: 0 }))
    // Reinitialize particles
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const width = canvasSize.width
      const height = canvasSize.height
      
      const newParticles: Particle[] = []
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: `particle-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: particleSize,
          life: 1,
          maxLife: 1,
          type: 'normal'
        })
      }
      setParticles(newParticles)
      particlesRef.current = newParticles
    }
  }, [canvasSize, particleCount, particleSize])

  // Download canvas
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'particle-swarm.png'
    link.href = canvas.toDataURL()
    link.click()
  }, [])

  useEffect(() => {
    // Disable scrolling when this page is mounted
    document.body.style.overflow = 'hidden';
    return () => {
      // Restore scrolling when leaving the page
      document.body.style.overflow = '';
    };
  }, []);

  if (!isClient) {
    return <FullScreenLoader variant="wave" text={t('common.preparing')} />
  }

  return (
    <VisualizationLayout
      onReset={handleReset}
      onExportSVG={handleDownload}
      statusContent={
        <>
          Mode: Particle Swarm | 
          Particles: {particles.length} | 
          Attractors: {attractors.length} | 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Watch particles flock together • Adjust behavior settings • Fullscreen minimalist animation"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <AnimationControls
            settings={animationSettings}
            onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
            onReset={handleReset}
            expanded={panelState.animationExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, animationExpanded: !prev.animationExpanded }))}
          />
          <SwarmSettings
            particleCount={particleCount}
            onParticleCountChange={setParticleCount}
            particleSize={particleSize}
            onParticleSizeChange={setParticleSize}
            showParticles={showParticles}
            onShowParticlesChange={setShowParticles}
            showAttractors={showAttractors}
            onShowAttractorsChange={setShowAttractors}
            showTrails={showTrails}
            onShowTrailsChange={setShowTrails}
            showConnections={showConnections}
            onShowConnectionsChange={setShowConnections}
            trailLength={trailLength}
            onTrailLengthChange={setTrailLength}
            connectionDistance={connectionDistance}
            onConnectionDistanceChange={setConnectionDistance}
            isExpanded={panelState.swarmSettingsExpanded}
            onToggleExpanded={(expanded) => setPanelState(prev => ({ ...prev, swarmSettingsExpanded: expanded }))}
          />
          <BehaviorSettings
            flockStrength={flockStrength}
            onFlockStrengthChange={setFlockStrength}
            separationStrength={separationStrength}
            onSeparationStrengthChange={setSeparationStrength}
            alignmentStrength={alignmentStrength}
            onAlignmentStrengthChange={setAlignmentStrength}
            attractionStrength={attractionStrength}
            onAttractionStrengthChange={setAttractionStrength}
            maxSpeed={maxSpeed}
            onMaxSpeedChange={setMaxSpeed}
            friction={friction}
            onFrictionChange={setFriction}
            isExpanded={panelState.behaviorSettingsExpanded}
            onToggleExpanded={(expanded) => setPanelState(prev => ({ ...prev, behaviorSettingsExpanded: expanded }))}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen cursor-crosshair dark:invert dark:hue-rotate-180"
        style={{
          width: '100vw',
          height: '100dvh',
          minHeight: '100dvh',
          minWidth: '100vw',
          display: 'block',
          zIndex: 0,
          background: 'transparent'
        }}
      />
    </VisualizationLayout>
  )
} 