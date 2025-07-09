'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import PoleControls from '@/components/flow-field/PoleControls'
import ParticleSettings from '@/components/flow-field/ParticleSettings'
import { AnimationControls } from '@/components/flow-field/AnimationControls'
import { FullScreenLoader } from '@/components/ui/loader'
import type { FlowFieldAnimationSettings, FlowFieldPanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame, updateTrailEfficiently } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/components/ui/ThemeProvider'
import dynamic from 'next/dynamic'

interface QuantumPole {
  id: string
  x: number
  y: number
  strength: number
  type: 'attractor' | 'repeller' | 'vortex' | 'quantum'
  phase: number
  frequency: number
  radius: number
}

interface QuantumParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  trail: Array<{ x: number; y: number; life: number; phase: number }>
  maxTrailLength: number
  age: number
  state: 'particle' | 'wave' | 'superposition'
  phase: number
  amplitude: number
  wavelength: number
  tunnelingProbability: number
  entangledWith: string | null
}

interface WaveFunction {
  x: number
  y: number
  amplitude: number
  phase: number
  frequency: number
  decay: number
}

function FlowFieldPage() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()

  // Quantum poles state
  const [poles, setPoles] = useState<QuantumPole[]>([
    { id: '1', x: 200, y: 300, strength: 100, type: 'attractor', phase: 0, frequency: 1, radius: 80 },
    { id: '2', x: 600, y: 300, strength: 100, type: 'repeller', phase: 0, frequency: 1, radius: 80 },
    { id: '3', x: 400, y: 200, strength: 80, type: 'vortex', phase: 0, frequency: 2, radius: 60 }
  ])

  // Quantum particles state
  const [particles, setParticles] = useState<QuantumParticle[]>([])

  // Wave functions state
  const [waveFunctions, setWaveFunctions] = useState<WaveFunction[]>([])

  // Settings state
  const [particleCount, setParticleCount] = useState(80)
  const [showPoles, setShowPoles] = useState(true)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [selectedPoleType, setSelectedPoleType] = useState<'attractor' | 'repeller' | 'vortex' | 'quantum'>('attractor')
  const [showParticleTrails, setShowParticleTrails] = useState(true)
  const [showWaveFunctions, setShowWaveFunctions] = useState(true)
  const [showSuperposition, setShowSuperposition] = useState(true)
  const [fieldLineDensity, setFieldLineDensity] = useState(12)

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<FlowFieldAnimationSettings>({
    isAnimating: true,
    particleSpeed: 1.0,
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

  // Calculate quantum field at a point
  const calculateQuantumField = useCallback((x: number, y: number, time: number): { x: number; y: number; magnitude: number; phase: number } => {
    let fieldX = 0
    let fieldY = 0
    let totalPhase = 0
    let totalMagnitude = 0

    poles.forEach(pole => {
      const dx = x - pole.x
      const dy = y - pole.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 1) return // Avoid division by zero
      
      const polePhase = pole.phase + time * pole.frequency
      const poleStrength = pole.strength / 100
      
      switch (pole.type) {
        case 'attractor':
          {
            const force = poleStrength / (distance * distance)
            const angle = Math.atan2(dy, dx)
            fieldX += Math.cos(angle) * force
            fieldY += Math.sin(angle) * force
            totalPhase += Math.sin(polePhase) * force
          }
          break
        case 'repeller':
          {
            const force = poleStrength / (distance * distance)
            const angle = Math.atan2(dy, dx)
            fieldX -= Math.cos(angle) * force
            fieldY -= Math.sin(angle) * force
            totalPhase += Math.cos(polePhase) * force
          }
          break
        case 'vortex':
          {
            const force = poleStrength / (distance * distance)
            const angle = Math.atan2(dy, dx) + Math.PI / 2
            fieldX += Math.cos(angle) * force
            fieldY += Math.sin(angle) * force
            totalPhase += Math.sin(polePhase + distance * 0.1) * force
          }
          break
        case 'quantum':
          {
            const quantumForce = poleStrength * Math.exp(-distance / pole.radius) * Math.sin(polePhase + distance * 0.05)
            const angle = Math.atan2(dy, dx)
            fieldX += Math.cos(angle) * quantumForce
            fieldY += Math.sin(angle) * quantumForce
            totalPhase += quantumForce
          }
          break
      }
      
      totalMagnitude += poleStrength / (distance * distance)
    })

    // Apply flow intensity
    const adjustedFieldX = fieldX * animationSettings.flowIntensity
    const adjustedFieldY = fieldY * animationSettings.flowIntensity

    return {
      x: adjustedFieldX,
      y: adjustedFieldY,
      magnitude: Math.sqrt(adjustedFieldX * adjustedFieldX + adjustedFieldY * adjustedFieldY),
      phase: totalPhase
    }
  }, [poles, animationSettings.flowIntensity]);

  // Generate quantum particles
  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    const newParticles: QuantumParticle[] = []
    for (let i = 0; i < particleCount; i++) {
      const state = Math.random() > 0.7 ? 'wave' : Math.random() > 0.5 ? 'superposition' : 'particle'
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        life: Math.random() * animationSettings.particleLife,
        maxLife: animationSettings.particleLife,
        trail: [],
        maxTrailLength: 25,
        age: 0,
        state,
        phase: Math.random() * Math.PI * 2,
        amplitude: Math.random() * 0.5 + 0.5,
        wavelength: Math.random() * 20 + 10,
        tunnelingProbability: Math.random() * 0.3,
        entangledWith: null
      })
    }

    // Create some entangled pairs
    for (let i = 0; i < newParticles.length - 1; i += 2) {
      if (Math.random() > 0.7) {
        newParticles[i].entangledWith = newParticles[i + 1].id
        newParticles[i + 1].entangledWith = newParticles[i].id
      }
    }

    setParticles(newParticles)

    // Generate wave functions
    const newWaveFunctions: WaveFunction[] = []
    for (let i = 0; i < 15; i++) {
      newWaveFunctions.push({
        x: Math.random() * width,
        y: Math.random() * height,
        amplitude: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        frequency: Math.random() * 2 + 0.5,
        decay: Math.random() * 0.02 + 0.01
      })
    }
    setWaveFunctions(newWaveFunctions)
  }, [particleCount, animationSettings.particleLife, isClient])

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    let frameId: number | null = null

    const animate = () => {
      setParticles(prevParticles => {
        // Update existing particles
        const updatedParticles = prevParticles.map(particle => {
          // Calculate quantum field at particle position
          const field = calculateQuantumField(particle.x, particle.y, animationSettings.time)
          
          // Update particle based on its quantum state
          let newVx = particle.vx
          let newVy = particle.vy
          let newPhase = particle.phase

          switch (particle.state) {
            case 'particle':
              // Classical particle behavior
              newVx += field.x * 0.1
              newVy += field.y * 0.1
              break
            case 'wave':
              // Wave-like behavior with interference
              newVx += field.x * 0.05 + Math.sin(particle.phase) * 0.5
              newVy += field.y * 0.05 + Math.cos(particle.phase) * 0.5
              newPhase += field.phase * 0.1
              break
            case 'superposition':
              // Superposition of particle and wave states
              const superpositionFactor = Math.sin(animationSettings.time * 0.5)
              newVx += (field.x * 0.1 * (1 + superpositionFactor) + Math.sin(particle.phase) * 0.3) * 0.5
              newVy += (field.y * 0.1 * (1 + superpositionFactor) + Math.cos(particle.phase) * 0.3) * 0.5
              newPhase += field.phase * 0.15
              break
          }

          // Quantum tunneling effect
          if (Math.random() < particle.tunnelingProbability * 0.01) {
            const tunnelDistance = 50 + Math.random() * 100
            const tunnelAngle = Math.random() * Math.PI * 2
            particle.x += Math.cos(tunnelAngle) * tunnelDistance
            particle.y += Math.sin(tunnelAngle) * tunnelDistance
          }

          // Entanglement effects
          if (particle.entangledWith) {
            const entangledParticle = prevParticles.find(p => p.id === particle.entangledWith)
            if (entangledParticle) {
              const distance = Math.sqrt(
                Math.pow(particle.x - entangledParticle.x, 2) + 
                Math.pow(particle.y - entangledParticle.y, 2)
              )
              if (distance > 200) {
                // Quantum correlation at a distance
                newVx += (entangledParticle.vx - particle.vx) * 0.01
                newVy += (entangledParticle.vy - particle.vy) * 0.01
              }
            }
          }

          // Limit speed
          const speed = Math.sqrt(newVx * newVx + newVy * newVy)
          const maxSpeed = animationSettings.particleSpeed * (particle.state === 'wave' ? 1.5 : 1)
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed
            newVy = (newVy / speed) * maxSpeed
          }

          // Update position
          const newX = particle.x + newVx
          const newY = particle.y + newVy

          // Wrap around edges
          const canvas = canvasRef.current
          const width = canvas ? canvas.width / window.devicePixelRatio : 800
          const height = canvas ? canvas.height / window.devicePixelRatio : 600
          
          const finalX = newX < 0 ? width : newX > width ? 0 : newX
          const finalY = newY < 0 ? height : newY > height ? 0 : newY

          // Update trail more efficiently
          const newTrail = updateTrailEfficiently(
            particle.trail,
            { 
              x: particle.x, 
              y: particle.y, 
              life: 1, 
              phase: particle.phase 
            },
            particle.maxTrailLength,
            0.95
          )

          return {
            ...particle,
            x: finalX,
            y: finalY,
            vx: newVx,
            vy: newVy,
            phase: newPhase,
            trail: newTrail,
            life: particle.life - 1,
            age: particle.age + 1
          }
        }).filter(particle => particle.life > 0)

        // Generate new particles to maintain count
        const canvas = canvasRef.current
        const width = canvas ? canvas.width / window.devicePixelRatio : 800
        const height = canvas ? canvas.height / window.devicePixelRatio : 600
        
        const particlesToAdd = Math.max(0, particleCount - updatedParticles.length)
        
        for (let i = 0; i < particlesToAdd; i++) {
          const newParticle: QuantumParticle = {
            id: `particle-${Date.now()}-${Math.random()}`,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: animationSettings.particleLife,
            maxLife: animationSettings.particleLife,
            trail: [],
            maxTrailLength: 50,
            age: 0,
            state: ['particle', 'wave', 'superposition'][Math.floor(Math.random() * 3)] as any,
            phase: Math.random() * Math.PI * 2,
            amplitude: Math.random() * 0.5 + 0.5,
            wavelength: Math.random() * 20 + 10,
            tunnelingProbability: Math.random() * 0.1,
            entangledWith: null
          }
          updatedParticles.push(newParticle)
        }

        return updatedParticles
      })

      // Update wave functions more efficiently
      setWaveFunctions(prevWaves => 
        prevWaves.map(wave => ({
          ...wave,
          phase: wave.phase + wave.frequency * 0.1,
          amplitude: wave.amplitude * (1 - wave.decay)
        })).filter(wave => wave.amplitude > 0.01)
      )

      setAnimationSettings(prev => ({ ...prev, time: prev.time + 0.02 }))
      
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
  }, [animationSettings.isAnimating, animationSettings.particleSpeed, animationSettings.flowIntensity, isClient, animationSettings.particleLife, animationSettings.time, calculateQuantumField, particleCount])

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

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Draw quantum field lines
    if (showFieldLines) {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio
      const spacing = width / fieldLineDensity

      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const field = calculateQuantumField(x, y, animationSettings.time)
          const magnitude = field.magnitude
          
          if (magnitude > 0.01) {
            const angle = Math.atan2(field.y, field.x)
            const length = Math.min(magnitude * 20, 15)
            
            const endX = x + Math.cos(angle) * length
            const endY = y + Math.sin(angle) * length

            // Color based on field phase
            const hue = (field.phase * 180 / Math.PI + 180) % 360
            const color = isDark 
              ? `hsl(${hue}, 70%, 60%)`
              : `hsl(${hue}, 70%, 40%)`

            ctx.strokeStyle = color
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(endX, endY)
            ctx.stroke()

            // Draw arrowhead
            const arrowLength = 5
            const arrowAngle = Math.PI / 6
            ctx.beginPath()
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle - arrowAngle),
              endY - arrowLength * Math.sin(angle - arrowAngle)
            )
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle + arrowAngle),
              endY - arrowLength * Math.sin(angle + arrowAngle)
            )
            ctx.stroke()
          }
        }
      }
    }

    // Draw wave functions
    if (showWaveFunctions) {
      waveFunctions.forEach(wave => {
        const color = isDark 
          ? `rgba(100, 150, 255, ${wave.amplitude * 0.3})`
          : `rgba(50, 100, 200, ${wave.amplitude * 0.3})`

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.amplitude * 30, 0, 2 * Math.PI)
        ctx.fill()

        // Draw wave rings
        for (let i = 1; i <= 3; i++) {
          const ringRadius = wave.amplitude * 30 + i * 20
          const ringAlpha = wave.amplitude * 0.1 / i
          const ringColor = isDark 
            ? `rgba(100, 150, 255, ${ringAlpha})`
            : `rgba(50, 100, 200, ${ringAlpha})`

          ctx.strokeStyle = ringColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(wave.x, wave.y, ringRadius, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })
    }

    // Draw particle trails
    if (showParticleTrails) {
      particles.forEach(particle => {
        if (particle.trail.length < 2) return

        ctx.beginPath()
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
        
        for (let i = 1; i < particle.trail.length; i++) {
          const point = particle.trail[i]
          const alpha = point.life * 0.8
          
          // Black and white trails for all particle states
          const color = isDark 
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(0, 0, 0, ${alpha})`
          
          ctx.strokeStyle = color
          ctx.lineWidth = particle.state === 'wave' ? 2 : 1
          ctx.lineTo(point.x, point.y)
        }
        ctx.stroke()
      })
    }

    // Draw particles
    particles.forEach(particle => {
      const lifeRatio = particle.life / particle.maxLife
      const size = particle.state === 'wave' ? 4 : particle.state === 'superposition' ? 6 : 3
      
      // Black and white particles for all states
      const color = isDark ? '#ffffff' : '#000000'

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, 2 * Math.PI)
      ctx.fill()

      // Draw entanglement lines
      if (particle.entangledWith) {
        const entangledParticle = particles.find(p => p.id === particle.entangledWith)
        if (entangledParticle) {
          const distance = Math.sqrt(
            Math.pow(particle.x - entangledParticle.x, 2) + 
            Math.pow(particle.y - entangledParticle.y, 2)
          )
          if (distance < 200) {
            ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
            ctx.lineWidth = 1
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(entangledParticle.x, entangledParticle.y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      // Draw superposition effects
      if (particle.state === 'superposition' && showSuperposition) {
        const superpositionRadius = size * 2 + Math.sin(animationSettings.time * 2) * 5
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, superpositionRadius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })

    // Draw quantum poles
    if (showPoles) {
      poles.forEach(pole => {
        let color: string
        switch (pole.type) {
          case 'attractor':
            color = '#10b981'
            break
          case 'repeller':
            color = '#ef4444'
            break
          case 'vortex':
            color = '#3b82f6'
            break
          case 'quantum':
            color = '#8b5cf6'
            break
          default:
            color = '#6b7280'
        }

        // Draw pole
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pole.x, pole.y, 8, 0, 2 * Math.PI)
        ctx.fill()

        // Draw pole border
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw pole label
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const label = pole.type === 'attractor' ? 'A' : pole.type === 'repeller' ? 'R' : pole.type === 'vortex' ? 'V' : 'Q'
        ctx.fillText(label, pole.x, pole.y)

        // Draw quantum field radius for quantum poles
        if (pole.type === 'quantum') {
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.arc(pole.x, pole.y, pole.radius, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })
    }
  }, [particles, waveFunctions, showPoles, showFieldLines, showParticleTrails, showWaveFunctions, showSuperposition, fieldLineDensity, animationSettings, poles, theme, isClient, calculateQuantumField])

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
    } else if (isAddingPole) {
      // Add new pole at click location
      const newPole: QuantumPole = {
        id: Date.now().toString(),
        x,
        y,
        strength: 100,
        type: selectedPoleType,
        phase: 0,
        frequency: 1,
        radius: 80
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

  // Remove pole
  const removePole = (id: string) => {
    setPoles(prev => prev.filter(pole => pole.id !== id))
  }

  // Update pole
  const updatePole = (id: string, updates: Partial<QuantumPole>) => {
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
          <circle cx="${pole.x}" cy="${pole.y}" r="8" fill="${pole.type === 'attractor' ? '#10b981' : pole.type === 'repeller' ? '#ef4444' : pole.type === 'vortex' ? '#3b82f6' : '#8b5cf6'}"/>
          <text x="${pole.x}" y="${pole.y}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12">${pole.type === 'attractor' ? 'A' : pole.type === 'repeller' ? 'R' : pole.type === 'vortex' ? 'V' : 'Q'}</text>
        `).join('')}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quantum-flow-field.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setPoles([
      { id: '1', x: 200, y: 300, strength: 100, type: 'attractor', phase: 0, frequency: 1, radius: 80 },
      { id: '2', x: 600, y: 300, strength: 100, type: 'repeller', phase: 0, frequency: 1, radius: 80 },
      { id: '3', x: 400, y: 200, strength: 80, type: 'vortex', phase: 0, frequency: 2, radius: 60 }
    ])
    setAnimationSettings({
      isAnimating: true,
      particleSpeed: 1.0,
      particleLife: 100,
      flowIntensity: 1.0,
      time: 0
    })
    setShowPoles(true)
    setShowFieldLines(true)
    setShowParticleTrails(true)
    setShowWaveFunctions(true)
    setShowSuperposition(true)
    setFieldLineDensity(12)
    setSelectedPoleType('attractor')
    setIsAddingPole(false)
  }

  if (!isClient) {
    return <FullScreenLoader text="Preparing..." />
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Quantum Flow Field | 
          Particles: {particles.length} | 
          Poles: {poles.length} | 
          Waves: {waveFunctions.length} | 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Click to add quantum pole, drag to move • Wheel to zoom • Watch quantum effects emerge"
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
            fieldLineDensity={fieldLineDensity}
            expanded={panelState.polesExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, polesExpanded: !prev.polesExpanded 
            }))}
            onSetSelectedPoleType={setSelectedPoleType}
            onSetIsAddingPole={setIsAddingPole}
            onRemovePole={removePole}
            onSetShowPoles={setShowPoles}
            onSetShowFieldLines={setShowFieldLines}
            onSetFieldLineDensity={setFieldLineDensity}
            onUpdatePole={updatePole}
          />

          <ParticleSettings
            particleCount={particleCount}
            showParticleTrails={showParticleTrails}
            showWaveFunctions={showWaveFunctions}
            showSuperposition={showSuperposition}
            expanded={panelState.particleSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, particleSettingsExpanded: !prev.particleSettingsExpanded 
            }))}
            onSetParticleCount={setParticleCount}
            onSetShowParticleTrails={setShowParticleTrails}
            onSetShowWaveFunctions={setShowWaveFunctions}
            onSetShowSuperposition={setShowSuperposition}
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

const FlowFieldPageComponent = FlowFieldPage;
export default dynamic(() => Promise.resolve(FlowFieldPageComponent), { ssr: false });