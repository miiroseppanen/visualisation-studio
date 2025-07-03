'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'
import PoleControls from '@/components/flow-field/PoleControls'
import ParticleSettings from '@/components/flow-field/ParticleSettings'
import { AnimationControls } from '@/components/flow-field/AnimationControls'
import type { FlowFieldAnimationSettings, FlowFieldPanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'

interface MagneticPole {
  id: string
  x: number
  y: number
  strength: number
  type: 'north' | 'south'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export default function FlowFieldPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [poles, setPoles] = useState<MagneticPole[]>([
    { id: '1', x: 200, y: 300, strength: 100, type: 'north' },
    { id: '2', x: 600, y: 300, strength: 100, type: 'south' }
  ])
  const [particles, setParticles] = useState<Particle[]>([])
  const [particleCount, setParticleCount] = useState(100)
  const [showPoles, setShowPoles] = useState(true)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [isAddingPole, setIsAddingPole] = useState(false)
  const [selectedPoleType, setSelectedPoleType] = useState<'north' | 'south'>('north')
  const [isDragging, setIsDragging] = useState(false)
  const [draggedPoleId, setDraggedPoleId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  
  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<FlowFieldAnimationSettings>({
    isAnimating: true,
    particleSpeed: 2,
    particleLife: 100,
    flowIntensity: 1.0,
    time: 0
  })
  
  // Panel state for collapsible sections
  const [panelState, setPanelState] = useState<FlowFieldPanelState>({
    fieldSettingsExpanded: true,
    polesExpanded: true,
    particleSettingsExpanded: true,
    animationExpanded: false
  })

  // Set canvas size and initialize particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to match container with proper DPR handling
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        const dpr = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()
        
        // Set the canvas size in CSS pixels
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
        
        // Set the canvas size in device pixels
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        
        // Scale the drawing context so everything draws at the correct size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
          ctx.scale(dpr, dpr)
        }
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles with canvas size
    const rect = canvas.getBoundingClientRect()
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: 0,
        vy: 0,
        life: animationSettings.particleLife
      })
    }
    setParticles(newParticles)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [particleCount, animationSettings.particleLife])

  // Calculate magnetic field at a point
  const calculateField = (x: number, y: number) => {
    let fx = 0
    let fy = 0

    poles.forEach(pole => {
      const dx = x - pole.x
      const dy = y - pole.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 0) {
        const force = pole.strength / (distance * distance)
        const angle = Math.atan2(dy, dx)
        
        // North pole attracts, south pole repels
        const direction = pole.type === 'north' ? 1 : -1
        
        fx += Math.cos(angle) * force * direction
        fy += Math.sin(angle) * force * direction
      }
    })

    return { fx, fy }
  }

  // Animate particles
  const animate = () => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        // Calculate field at particle position
        const field = calculateField(particle.x, particle.y)
        
        // Update velocity
        const intensityFactor = animationSettings.flowIntensity * 0.1
        const newVx = particle.vx + field.fx * intensityFactor
        const newVy = particle.vy + field.fy * intensityFactor
        
        // Limit speed
        const speed = Math.sqrt(newVx * newVx + newVy * newVy)
        const maxSpeed = animationSettings.particleSpeed
        const finalVx = speed > maxSpeed ? (newVx / speed) * maxSpeed : newVx
        const finalVy = speed > maxSpeed ? (newVy / speed) * maxSpeed : newVy
        
        // Update position
        const newX = particle.x + finalVx
        const newY = particle.y + finalVy
        
        // Wrap around edges
        const canvas = canvasRef.current
        const rect = canvas?.getBoundingClientRect()
        const canvasWidth = rect?.width || 800
        const canvasHeight = rect?.height || 600
        const wrappedX = newX < 0 ? canvasWidth : newX > canvasWidth ? 0 : newX
        const wrappedY = newY < 0 ? canvasHeight : newY > canvasHeight ? 0 : newY
        
        // Decrease life
        const newLife = particle.life - 1
        
        // Reset particle if life is over
        if (newLife <= 0) {
          const canvas = canvasRef.current
          const rect = canvas?.getBoundingClientRect()
          const canvasWidth = rect?.width || 800
          const canvasHeight = rect?.height || 600
          return {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            vx: 0,
            vy: 0,
            life: animationSettings.particleLife
          }
        }
        
        return {
          x: wrappedX,
          y: wrappedY,
          vx: finalVx,
          vy: finalVy,
          life: newLife
        }
      })
    })
    
    animationRef.current = requestAnimationFrame(animate)
  }

  // Animation loop with time tracking
  useEffect(() => {
    if (animationSettings.isAnimating) {
      const startTime = Date.now()
      const animateWithTime = () => {
        const currentTime = Date.now() - startTime
        setAnimationSettings(prev => ({ ...prev, time: currentTime }))
        animate()
      }
      animateWithTime()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationSettings.isAnimating, animationSettings.particleSpeed, animationSettings.particleLife, poles])

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw field lines
    if (showFieldLines) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      
      const rect = canvas.getBoundingClientRect()
      const step = 40
      for (let i = 0; i < rect.width; i += step) {
        for (let j = 0; j < rect.height; j += step) {
          const field = calculateField(i, j)
          const length = Math.sqrt(field.fx * field.fx + field.fy * field.fy)
          
          if (length > 0.01) {
            const angle = Math.atan2(field.fy, field.fx)
            const endX = i + Math.cos(angle) * 20
            const endY = j + Math.sin(angle) * 20
            
            ctx.beginPath()
            ctx.moveTo(i, j)
            ctx.lineTo(endX, endY)
            ctx.stroke()
          }
        }
      }
    }

    // Draw particles
    ctx.fillStyle = '#000'
    particles.forEach(particle => {
      const alpha = particle.life / animationSettings.particleLife
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 2, 0, 2 * Math.PI)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Draw poles
    if (showPoles) {
      poles.forEach(pole => {
        // Pole circle
        ctx.fillStyle = pole.type === 'north' ? '#000' : '#fff'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pole.x, pole.y, 12, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        
        // Pole label
        ctx.fillStyle = pole.type === 'north' ? '#fff' : '#000'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(pole.type === 'north' ? 'N' : 'S', pole.x, pole.y)
      })
    }
  }, [particles, poles, showPoles, showFieldLines])

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

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    const deltaY = e.deltaY
    const zoomChange = -deltaY * ZOOM_SENSITIVITY
    
    const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel + zoomChange))
    setZoomLevel(newZoom)
  }

  // Remove pole
  const removePole = (id: string) => {
    setPoles(prev => prev.filter(pole => pole.id !== id))
  }

  // Update pole strength
  const updatePoleStrength = (id: string, strength: number) => {
    setPoles(prev => prev.map(pole => 
      pole.id === id ? { ...pole, strength } : pole
    ))
  }

  // Export SVG
  const exportSVG = () => {
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .field-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; }
            .particle { fill: #000; }
            .pole-north { fill: #000; stroke: #000; stroke-width: 2; }
            .pole-south { fill: #fff; stroke: #000; stroke-width: 2; }
            .pole-text { font-family: sans-serif; font-weight: bold; font-size: 14px; text-anchor: middle; }
          </style>
        </defs>
        ${showFieldLines ? Array.from({ length: 20 }, (_, i) => 
          Array.from({ length: 15 }, (_, j) => {
            const x = i * 40
            const y = j * 40
            const field = calculateField(x, y)
            const length = Math.sqrt(field.fx * field.fx + field.fy * field.fy)
            
            if (length > 0.01) {
              const angle = Math.atan2(field.fy, field.fx)
              const endX = x + Math.cos(angle) * 20
              const endY = y + Math.sin(angle) * 20
              return `<line class="field-line" x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" />`
            }
            return ''
          }).join('')
        ).join('') : ''}
        ${poles.map(pole => `
          <circle class="pole-${pole.type}" cx="${pole.x}" cy="${pole.y}" r="12" />
          <text class="pole-text" x="${pole.x}" y="${pole.y}" fill="${pole.type === 'north' ? '#fff' : '#000'}">${pole.type === 'north' ? 'N' : 'S'}</text>
        `).join('')}
      </svg>
    `

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flow-field.svg'
    a.click()
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

  return (
    <div className="h-screen bg-background flex flex-col">
      <VisualizationNav 
        actionButtons={
          <>
            <Button variant="ghost" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={exportSVG}>
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
          </>
        }
      />

      <div className="flex-1 flex">
        {/* Canvas - Fullscreen */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleWheel}
          />
          <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Mode: Flow Simulation | 
            Poles: {poles.length} | 
            Particles: {particleCount} | 
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Click to add pole, drag to move • Wheel to zoom • Use controls to adjust settings
          </div>
        </div>

        {/* Floating Controls Panel */}
        <ControlsPanel title="Flow Field Controls">
          <div className="space-y-8">
            <PoleControls
              poles={poles}
              selectedPoleType={selectedPoleType}
              isAddingPole={isAddingPole}
              showPoles={showPoles}
              showFieldLines={showFieldLines}
              expanded={panelState.polesExpanded}
              onToggleExpanded={() => setPanelState(prev => ({ ...prev, polesExpanded: !prev.polesExpanded }))}
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
              onToggleExpanded={() => setPanelState(prev => ({ ...prev, particleSettingsExpanded: !prev.particleSettingsExpanded }))}
              onSetParticleCount={setParticleCount}
              onSetParticleSpeed={(speed) => setAnimationSettings(prev => ({ ...prev, particleSpeed: speed }))}
              onSetParticleLife={(life) => setAnimationSettings(prev => ({ ...prev, particleLife: life }))}
            />

            <AnimationControls
              settings={animationSettings}
              onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
              onReset={resetToDefaults}
              expanded={panelState.animationExpanded}
              onToggleExpanded={() => setPanelState(prev => ({ ...prev, animationExpanded: !prev.animationExpanded }))}
            />
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
} 