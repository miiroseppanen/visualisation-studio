'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import PoleControls from '@/components/flow-field/PoleControls'
import ParticleSettings from '@/components/flow-field/ParticleSettings'
import { AnimationControls } from '@/components/flow-field/AnimationControls'
import type { FlowFieldAnimationSettings, FlowFieldPanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MagneticPole {
  id: string
  x: number
  y: number
  strength: number
  type: 'north' | 'south'
}

export default function FlowFieldPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Poles state
  const [poles, setPoles] = useState<MagneticPole[]>([
    { id: '1', x: 200, y: 300, strength: 100, type: 'north' },
    { id: '2', x: 600, y: 300, strength: 100, type: 'south' }
  ])

  // Particle system state
  const [particles, setParticles] = useState<Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
  }>>([])

  // Settings state
  const [particleCount, setParticleCount] = useState(100)
  const [showPoles, setShowPoles] = useState(true)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [selectedPoleType, setSelectedPoleType] = useState<'north' | 'south'>('north')

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<FlowFieldAnimationSettings>({
    isAnimating: true,
    particleSpeed: 2,
    particleLife: 100,
    flowIntensity: 1.0,
    time: 0
  })

  // Panel state
  const [panelState, setPanelState] = useState<FlowFieldPanelState>({
    isOpen: true,
    fieldSettingsExpanded: true,
    polesExpanded: true,
    particleSettingsExpanded: true,
    animationExpanded: true
  })

  // Interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [draggedPoleId, setDraggedPoleId] = useState<string | null>(null)
  const [isAddingPole, setIsAddingPole] = useState(false)

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Canvas setup
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      ctx.canvas.style.width = rect.width + 'px'
      ctx.canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [isClient])

  // Calculate magnetic field at a point
  const calculateField = (x: number, y: number): { x: number; y: number; magnitude: number } => {
    let fieldX = 0
    let fieldY = 0

    poles.forEach(pole => {
      const dx = x - pole.x
      const dy = y - pole.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 1) return // Avoid division by zero
      
      const force = pole.strength / (distance * distance)
      const angle = Math.atan2(dy, dx)
      
      // Magnetic field direction depends on pole type
      const direction = pole.type === 'north' ? 1 : -1
      
      fieldX += Math.cos(angle) * force * direction
      fieldY += Math.sin(angle) * force * direction
    })

    return {
      x: fieldX * animationSettings.flowIntensity,
      y: fieldY * animationSettings.flowIntensity,
      magnitude: Math.sqrt(fieldX * fieldX + fieldY * fieldY)
    }
  }

  // Generate particles
  useEffect(() => {
    if (!isClient) return

    const newParticles = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * (canvasRef.current?.width || 800),
        y: Math.random() * (canvasRef.current?.height || 600),
        vx: 0,
        vy: 0,
        life: Math.random() * animationSettings.particleLife,
        maxLife: animationSettings.particleLife
      })
    }
    setParticles(newParticles)
  }, [particleCount, animationSettings.particleLife, isClient])

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Calculate field at particle position
          const field = calculateField(particle.x, particle.y)
          
          // Update velocity based on field
          particle.vx += field.x * animationSettings.particleSpeed * 0.01
          particle.vy += field.y * animationSettings.particleSpeed * 0.01
          
          // Apply damping
          particle.vx *= 0.99
          particle.vy *= 0.99
          
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          
          // Update life
          particle.life -= 1
          
          // Reset particle if it's dead or out of bounds
          if (particle.life <= 0 || 
              particle.x < 0 || particle.x > (canvasRef.current?.width || 800) ||
              particle.y < 0 || particle.y > (canvasRef.current?.height || 600)) {
            return {
              x: Math.random() * (canvasRef.current?.width || 800),
              y: Math.random() * (canvasRef.current?.height || 600),
              vx: 0,
              vy: 0,
              life: animationSettings.particleLife,
              maxLife: animationSettings.particleLife
            }
          }
          
          return particle
        })
      )

      setAnimationSettings(prev => ({ ...prev, time: prev.time + 1 }))
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
        animationRef.current = undefined
      }
    }
  }, [animationSettings.isAnimating, animationSettings.particleSpeed, animationSettings.flowIntensity, isClient])

  // Listen for global pause event
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      setAnimationSettings(prev => ({ ...prev, isAnimating: false }))
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
        animationRef.current = undefined
      }
    }
  }, [])

  // Stop animation when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (navigation, tab switch, etc.) - pause animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          unregisterAnimationFrame(animationRef.current)
          animationRef.current = undefined
        }
      } else if (animationSettings.isAnimating && !animationRef.current) {
        // Page is visible again and should be animating - restart
        const animate = () => {
          // ... animation logic would go here
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
  }, [animationSettings.isAnimating, animationSettings.particleSpeed, animationSettings.flowIntensity])

  // Render loop
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    // Draw field lines
    if (showFieldLines) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      
      const gridSize = 20
      for (let x = 0; x < canvas.width / window.devicePixelRatio; x += gridSize) {
        for (let y = 0; y < canvas.height / window.devicePixelRatio; y += gridSize) {
          const field = calculateField(x, y)
          if (field.magnitude > 0.1) {
            const length = Math.min(20, field.magnitude * 10)
            const endX = x + (field.x / field.magnitude) * length
            const endY = y + (field.y / field.magnitude) * length
            
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(endX, endY)
            ctx.stroke()
          }
        }
      }
    }

    // Draw particles
    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 2, 0, 2 * Math.PI)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Draw poles
    if (showPoles) {
      poles.forEach(pole => {
        const color = pole.type === 'north' ? '#ef4444' : '#3b82f6'
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pole.x, pole.y, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw pole symbol
        ctx.fillStyle = 'white'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(pole.type === 'north' ? 'N' : 'S', pole.x, pole.y)
      })
    }
  }, [particles, poles, showPoles, showFieldLines, animationSettings.flowIntensity, isClient])

  // Handle canvas mouse down for adding/dragging poles
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on an existing pole for dragging
    const clickedPole = poles.find(pole => {
      const distance = Math.sqrt((x - pole.x) ** 2 + (y - pole.y) ** 2)
      return distance <= 15 // Click radius
    })

    if (clickedPole) {
      setIsDragging(true)
      setDraggedPoleId(clickedPole.id)
    } else {
      // Add new pole at click location
      const newPole: MagneticPole = {
        id: Date.now().toString(),
        x,
        y,
        strength: 100,
        type: selectedPoleType
      }
      setPoles(prev => [...prev, newPole])
      setIsDragging(true)
      setDraggedPoleId(newPole.id)
    }
  }

  // Handle canvas mouse move for dragging poles
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedPoleId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPoles(prev => prev.map(pole => 
      pole.id === draggedPoleId ? { ...pole, x, y } : pole
    ))
  }

  // Handle canvas mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedPoleId(null)
  }

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

  // Remove pole
  const removePole = (id: string) => {
    setPoles(prev => prev.filter(pole => pole.id !== id))
  }

  // Update pole
  const updatePole = (id: string, updates: Partial<MagneticPole>) => {
    setPoles(prev => prev.map(pole => 
      pole.id === id ? { ...pole, ...updates } : pole
    ))
  }

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${poles.map(pole => `
          <circle cx="${pole.x}" cy="${pole.y}" r="8" fill="${pole.type === 'north' ? '#ef4444' : '#3b82f6'}"/>
          <text x="${pole.x}" y="${pole.y}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12">${pole.type === 'north' ? 'N' : 'S'}</text>
        `).join('')}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flow-field.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setPoles([
      { id: '1', x: 200, y: 300, strength: 100, type: 'north' },
      { id: '2', x: 600, y: 300, strength: 100, type: 'south' }
    ])
    setParticleCount(100)
    setAnimationSettings({
      isAnimating: true,
      particleSpeed: 2,
      particleLife: 100,
      flowIntensity: 1.0,
      time: 0
    })
    setShowPoles(true)
    setShowFieldLines(true)
    setIsAddingPole(false)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading flow field visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Flow Simulation | 
          Poles: {poles.length} | 
          Particles: {particleCount} | 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Click to add pole, drag to move • Wheel to zoom • Use controls to adjust settings"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <PoleControls
            poles={poles}
            selectedPoleType={selectedPoleType}
            isAddingPole={isAddingPole}
            showPoles={showPoles}
            showFieldLines={showFieldLines}
            expanded={panelState.polesExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, polesExpanded: !prev.polesExpanded 
            }))}
            onSetSelectedPoleType={setSelectedPoleType}
            onSetIsAddingPole={setIsAddingPole}
            onRemovePole={removePole}
            onSetShowPoles={setShowPoles}
            onSetShowFieldLines={setShowFieldLines}
          />

          <ParticleSettings
            particleCount={particleCount}
            particleSpeed={animationSettings.particleSpeed}
            particleLife={animationSettings.particleLife}
            expanded={panelState.particleSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, particleSettingsExpanded: !prev.particleSettingsExpanded 
            }))}
            onSetParticleCount={setParticleCount}
            onSetParticleSpeed={(speed) => setAnimationSettings(prev => ({ ...prev, particleSpeed: speed }))}
            onSetParticleLife={(life) => setAnimationSettings(prev => ({ ...prev, particleLife: life }))}
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
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </VisualizationLayout>
  )
} 