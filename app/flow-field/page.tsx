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
import { useTheme } from '@/components/ui/ThemeProvider'

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
  const { theme } = useTheme()

  // Poles state
  const [poles, setPoles] = useState<MagneticPole[]>([
    { id: '1', x: 200, y: 300, strength: 100, type: 'north' },
    { id: '2', x: 600, y: 300, strength: 100, type: 'south' }
  ])

  // Particles state
  const [particles, setParticles] = useState<Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    trail: Array<{ x: number; y: number; life: number }>
    maxTrailLength: number
    age: number
  }>>([])

  // Background noise particles state
  const [noiseParticles, setNoiseParticles] = useState<Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    size: number
  }>>([])

  // Settings state
  const [particleCount, setParticleCount] = useState(100)
  const [showPoles, setShowPoles] = useState(true)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [selectedPoleType, setSelectedPoleType] = useState<'north' | 'south'>('north')
  const [showParticleTrails, setShowParticleTrails] = useState(true)
  const [fieldLineDensity, setFieldLineDensity] = useState(15)

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
      
      // Use pole strength more directly in the force calculation
      const force = (pole.strength / 100) / (distance * distance)
      const angle = Math.atan2(dy, dx)
      
      // Magnetic field direction depends on pole type
      const direction = pole.type === 'north' ? 1 : -1
      
      fieldX += Math.cos(angle) * force * direction
      fieldY += Math.sin(angle) * force * direction
    })

    // Apply flow intensity to both field components and magnitude
    const adjustedFieldX = fieldX * animationSettings.flowIntensity
    const adjustedFieldY = fieldY * animationSettings.flowIntensity

    return {
      x: adjustedFieldX,
      y: adjustedFieldY,
      magnitude: Math.sqrt(adjustedFieldX * adjustedFieldX + adjustedFieldY * adjustedFieldY)
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
        maxLife: animationSettings.particleLife,
        trail: [],
        maxTrailLength: 20,
        age: 0
      })
    }
    setParticles(newParticles)

    // Generate background noise particles
    const newNoiseParticles = []
    const noiseCount = Math.floor(particleCount * 0.3) // 30% of main particles
    for (let i = 0; i < noiseCount; i++) {
      newNoiseParticles.push({
        x: Math.random() * (canvasRef.current?.width || 800),
        y: Math.random() * (canvasRef.current?.height || 600),
        vx: (Math.random() - 0.5) * 2, // Random initial velocity
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * animationSettings.particleLife * 0.5, // Shorter life
        maxLife: animationSettings.particleLife * 0.5,
        size: Math.random() * 3 + 1 // Increased size range
      })
    }
    setNoiseParticles(newNoiseParticles)
  }, [particleCount, animationSettings.particleLife, isClient])

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Calculate field at particle position
          const field = calculateField(particle.x, particle.y)
          
          // Update velocity based on field with improved physics
          const fieldStrength = Math.min(field.magnitude, 5)
          particle.vx += field.x * animationSettings.particleSpeed * 0.02 * fieldStrength
          particle.vy += field.y * animationSettings.particleSpeed * 0.02 * fieldStrength
          
          // Apply damping with velocity-dependent factor
          const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
          const damping = Math.max(0.95, 1 - velocity * 0.01)
          particle.vx *= damping
          particle.vy *= damping
          
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          
          // Update trail
          if (showParticleTrails) {
            particle.trail.push({ x: particle.x, y: particle.y, life: particle.life })
            if (particle.trail.length > particle.maxTrailLength) {
              particle.trail.shift()
            }
          }
          
          // Update life and age
          particle.life -= 1
          particle.age += 1
          
          // Reset particle if it's dead or out of bounds
          if (particle.life <= 0 || 
              particle.x < -50 || particle.x > (canvasRef.current?.width || 800) + 50 ||
              particle.y < -50 || particle.y > (canvasRef.current?.height || 600) + 50) {
            return {
              x: Math.random() * (canvasRef.current?.width || 800),
              y: Math.random() * (canvasRef.current?.height || 600),
              vx: 0,
              vy: 0,
              life: animationSettings.particleLife,
              maxLife: animationSettings.particleLife,
              trail: [],
              maxTrailLength: 20,
              age: 0
            }
          }
          
          return particle
        })
      )

      // Animate noise particles
      setNoiseParticles(prevNoiseParticles => 
        prevNoiseParticles.map(particle => {
          // Add some random movement
          particle.vx += (Math.random() - 0.5) * 0.5
          particle.vy += (Math.random() - 0.5) * 0.5
          
          // Apply damping
          particle.vx *= 0.98
          particle.vy *= 0.98
          
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy
          
          // Update life
          particle.life -= 1
          
          // Reset particle if it's dead or out of bounds
          if (particle.life <= 0 || 
              particle.x < -50 || particle.x > (canvasRef.current?.width || 800) + 50 ||
              particle.y < -50 || particle.y > (canvasRef.current?.height || 600) + 50) {
            return {
              x: Math.random() * (canvasRef.current?.width || 800),
              y: Math.random() * (canvasRef.current?.height || 600),
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: animationSettings.particleLife * 0.5,
              maxLife: animationSettings.particleLife * 0.5,
              size: Math.random() * 3 + 1
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
      }
    }
  }, [animationSettings.isAnimating, animationSettings.particleSpeed, animationSettings.flowIntensity, showParticleTrails, isClient])

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
      } else if (animationSettings.isAnimating) {
        const animate = () => {
          setParticles(prevParticles => 
            prevParticles.map(particle => {
              // Calculate field at particle position
              const field = calculateField(particle.x, particle.y)
              
              // Update velocity based on field with improved physics
              const fieldStrength = Math.min(field.magnitude, 5)
              particle.vx += field.x * animationSettings.particleSpeed * 0.02 * fieldStrength
              particle.vy += field.y * animationSettings.particleSpeed * 0.02 * fieldStrength
              
              // Apply damping with velocity-dependent factor
              const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
              const damping = Math.max(0.95, 1 - velocity * 0.01)
              particle.vx *= damping
              particle.vy *= damping
              
              // Update position
              particle.x += particle.vx
              particle.y += particle.vy
              
              // Update trail
              if (showParticleTrails) {
                particle.trail.push({ x: particle.x, y: particle.y, life: particle.life })
                if (particle.trail.length > particle.maxTrailLength) {
                  particle.trail.shift()
                }
              }
              
              // Update life and age
              particle.life -= 1
              particle.age += 1
              
              // Reset particle if it's dead or out of bounds
              if (particle.life <= 0 || 
                  particle.x < -50 || particle.x > (canvasRef.current?.width || 800) + 50 ||
                  particle.y < -50 || particle.y > (canvasRef.current?.height || 600) + 50) {
                return {
                  x: Math.random() * (canvasRef.current?.width || 800),
                  y: Math.random() * (canvasRef.current?.height || 600),
                  vx: 0,
                  vy: 0,
                  life: animationSettings.particleLife,
                  maxLife: animationSettings.particleLife,
                  trail: [],
                  maxTrailLength: 20,
                  age: 0
                }
              }
              
              return particle
            })
          )

          // Animate noise particles
          setNoiseParticles(prevNoiseParticles => 
            prevNoiseParticles.map(particle => {
              // Add some random movement
              particle.vx += (Math.random() - 0.5) * 0.5
              particle.vy += (Math.random() - 0.5) * 0.5
              
              // Apply damping
              particle.vx *= 0.98
              particle.vy *= 0.98
              
              // Update position
              particle.x += particle.vx
              particle.y += particle.vy
              
              // Update life
              particle.life -= 1
              
              // Reset particle if it's dead or out of bounds
              if (particle.life <= 0 || 
                  particle.x < -50 || particle.x > (canvasRef.current?.width || 800) + 50 ||
                  particle.y < -50 || particle.y > (canvasRef.current?.height || 600) + 50) {
                return {
                  x: Math.random() * (canvasRef.current?.width || 800),
                  y: Math.random() * (canvasRef.current?.height || 600),
                  vx: (Math.random() - 0.5) * 2,
                  vy: (Math.random() - 0.5) * 2,
                  life: animationSettings.particleLife * 0.5,
                  maxLife: animationSettings.particleLife * 0.5,
                  size: Math.random() * 3 + 1
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
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      handlePauseAllAnimations()
    }
  }, [animationSettings.isAnimating, animationSettings.particleSpeed, animationSettings.flowIntensity, showParticleTrails])

  // Render loop
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with subtle fade effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    // Draw field lines
    if (showFieldLines) {
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const fieldLineColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
      
      ctx.strokeStyle = fieldLineColor
      ctx.lineWidth = 1

      // Draw field lines from poles
      poles.forEach(pole => {
        const startAngle = 0
        const endAngle = 2 * Math.PI
        const angleStep = (endAngle - startAngle) / fieldLineDensity

        for (let angle = startAngle; angle < endAngle; angle += angleStep) {
          let x = pole.x + Math.cos(angle) * 20
          let y = pole.y + Math.sin(angle) * 20
          const length = 100

          // Draw field line
          const field = calculateField(x, y)
          if (field.magnitude > 0.1) {
            const endX = x + (field.x / field.magnitude) * length
            const endY = y + (field.y / field.magnitude) * length
            
            // Draw arrowhead
            const arrowAngle = Math.atan2(field.y, field.x)
            const arrowLength = 8
            const arrowAngleOffset = Math.PI / 6
            
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(endX, endY)
            ctx.stroke()
            
            // Draw arrowhead
            ctx.beginPath()
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowLength * Math.cos(arrowAngle - arrowAngleOffset),
              endY - arrowLength * Math.sin(arrowAngle - arrowAngleOffset)
            )
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowLength * Math.cos(arrowAngle + arrowAngleOffset),
              endY - arrowLength * Math.sin(arrowAngle + arrowAngleOffset)
            )
            ctx.stroke()
          }
        }
      })
    }

    // Draw particle trails
    if (showParticleTrails) {
      particles.forEach(particle => {
        if (particle.trail.length < 2) return
        
        // Draw trail with fade effect
        for (let i = 0; i < particle.trail.length - 1; i++) {
          const current = particle.trail[i]
          const next = particle.trail[i + 1]
          const progress = i / particle.trail.length
          const alpha = 0.2 + progress * 0.6 // Increased opacity
          
          // Black and white theme-aware colors
          const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          const trailColor = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`
          
          ctx.strokeStyle = trailColor
          ctx.lineWidth = 1.5 // Increased line width
          ctx.beginPath()
          ctx.moveTo(current.x, current.y)
          ctx.lineTo(next.x, next.y)
          ctx.stroke()
        }
      })
    }

    // Draw enhanced particles
    particles.forEach(particle => {
      const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
      const field = calculateField(particle.x, particle.y)
      const alpha = particle.life / particle.maxLife
      const size = Math.max(2, Math.min(6, velocity * 3 + 2)) // Increased size range
      
      // Black and white theme-aware colors with higher opacity
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const baseColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)'
      
      ctx.fillStyle = baseColor.replace('0.95', (alpha * 0.95).toString())
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw noise particles
    noiseParticles.forEach(particle => {
      const alpha = particle.life / particle.maxLife
      
      // Black and white theme-aware colors with higher opacity for noise particles
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const baseColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
      
      ctx.fillStyle = baseColor.replace('0.6', (alpha * 0.6).toString())
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, 2 * Math.PI) // Increased size
      ctx.fill()
    })

    // Draw enhanced poles
    if (showPoles) {
      poles.forEach(pole => {
        const color = pole.type === 'north' ? '#ef4444' : '#3b82f6'
        
        // Draw pole circle
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pole.x, pole.y, 10, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw pole border
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw pole symbol
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(pole.type === 'north' ? 'N' : 'S', pole.x, pole.y)
      })
    }
  }, [particles, noiseParticles, poles, showPoles, showFieldLines, showParticleTrails, fieldLineDensity, animationSettings.flowIntensity, theme, isClient])

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
    setShowParticleTrails(true)
    setFieldLineDensity(15)
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
          Trails: {showParticleTrails ? 'On' : 'Off'} | 
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
            onUpdatePole={updatePole}
          />

          <ParticleSettings
            particleCount={particleCount}
            particleSpeed={animationSettings.particleSpeed}
            particleLife={animationSettings.particleLife}
            showParticleTrails={showParticleTrails}
            fieldLineDensity={fieldLineDensity}
            expanded={panelState.particleSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, particleSettingsExpanded: !prev.particleSettingsExpanded 
            }))}
            onSetParticleCount={setParticleCount}
            onSetParticleSpeed={(speed) => setAnimationSettings(prev => ({ ...prev, particleSpeed: speed }))}
            onSetParticleLife={(life) => setAnimationSettings(prev => ({ ...prev, particleLife: life }))}
            onSetShowParticleTrails={setShowParticleTrails}
            onSetFieldLineDensity={setFieldLineDensity}
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