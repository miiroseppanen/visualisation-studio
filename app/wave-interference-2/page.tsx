'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import AnimationControls from '@/components/wave-interference/AnimationControls'
import WaveSourceControls2 from '@/components/wave-interference/WaveSourceControls2'
import WaveSettings from '@/components/wave-interference/WaveSettings'
import QuantumControls from '@/components/wave-interference/QuantumControls'
import type { WaveInterferenceAnimationSettings, WaveInterferencePanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'
import { FullScreenLoader } from '@/components/ui/loader'
import { useTranslation } from 'react-i18next'

interface QuantumParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  amplitude: number
  phase: number
  wavelength: number
  energy: number
  superposition: boolean
  collapsed: boolean
  waveFunction: 'gaussian' | 'plane' | 'spherical' | 'interfering' | 'harmonic' | 'chaotic'
  color: string
  life: number
  maxLife: number
  size: number
  pulse: number
  entanglement: string[]
  spin: number
}

interface InterferencePoint {
  x: number
  y: number
  amplitude: number
  phase: number
  energy: number
  interference: number
  collapse: number
  chaos: number
}

interface MeasurementDevice {
  id: string
  x: number
  y: number
  radius: number
  active: boolean
  measurementType: 'position' | 'momentum' | 'energy' | 'spin' | 'entanglement'
  results: Array<{ x: number; y: number; value: number; time: number }>
  pulse: number
  influence: number
}

interface QuantumField {
  x: number
  y: number
  value: number
  type: 'interference' | 'collapse' | 'entanglement' | 'chaos'
  intensity: number
}

export default function WaveInterference2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const renderFrameRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Quantum particles state
  const [particles, setParticles] = useState<QuantumParticle[]>([])

  // Measurement devices
  const [measurementDevices, setMeasurementDevices] = useState<MeasurementDevice[]>([])

  // Quantum field
  const [quantumField, setQuantumField] = useState<QuantumField[]>([])

  // Settings state
  const [showParticles, setShowParticles] = useState(true)
  const [showWaveFunctions, setShowWaveFunctions] = useState(true)
  const [showInterference, setShowInterference] = useState(true)
  const [showMeasurementDevices, setShowMeasurementDevices] = useState(true)
  const [showCollapse, setShowCollapse] = useState(true)
  const [showEntanglement, setShowEntanglement] = useState(true)
  const [showChaos, setShowChaos] = useState(true)
  const [particleCount, setParticleCount] = useState(15)
  const [deviceCount, setDeviceCount] = useState(8)
  const [fieldDensity, setFieldDensity] = useState(20)
  const [interferenceStrength, setInterferenceStrength] = useState(0.8)
  const [collapseThreshold, setCollapseThreshold] = useState(0.6)
  const [chaosLevel, setChaosLevel] = useState(0.3)

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

  // Additional panel state for quantum controls
  const [quantumControlsExpanded, setQuantumControlsExpanded] = useState(true)

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

  // Initialize quantum system
  useEffect(() => {
    if (!isClient || canvasSize.width === 0 || canvasSize.height === 0) return

    const width = canvasSize.width
    const height = canvasSize.height

    // Create quantum particles
    const newParticles: QuantumParticle[] = []
    const waveFunctions: Array<'gaussian' | 'plane' | 'spherical' | 'interfering' | 'harmonic' | 'chaotic'> = 
      ['gaussian', 'plane', 'spherical', 'interfering', 'harmonic', 'chaotic']
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        amplitude: Math.random() * 60 + 40,
        phase: Math.random() * Math.PI * 2,
        wavelength: Math.random() * 100 + 80,
        energy: Math.random() * 0.8 + 0.2,
        superposition: true,
        collapsed: false,
        waveFunction: waveFunctions[Math.floor(Math.random() * waveFunctions.length)],
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        life: 1,
        maxLife: 1,
        size: Math.random() * 3 + 2,
        pulse: 0,
        entanglement: [],
        spin: Math.random() * 2 - 1
      })
    }

    // Create measurement devices
    const newDevices: MeasurementDevice[] = []
    const deviceTypes: Array<'position' | 'momentum' | 'energy' | 'spin' | 'entanglement'> = 
      ['position', 'momentum', 'energy', 'spin', 'entanglement']
    
    for (let i = 0; i < deviceCount; i++) {
      newDevices.push({
        id: `device-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 60 + 40,
        active: true,
        measurementType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        results: [],
        pulse: 0,
        influence: Math.random() * 0.5 + 0.5
      })
    }

    setParticles(newParticles)
    setMeasurementDevices(newDevices)
  }, [isClient, canvasSize, particleCount, deviceCount])

  // Calculate wave function value based on type
  const calculateWaveFunction = useCallback((x: number, y: number, particle: QuantumParticle, time: number): number => {
    const dx = x - particle.x
    const dy = y - particle.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const phase = particle.phase + (time * particle.energy * animationSettings.waveSpeed)
    
    let value = 0
    
    switch (particle.waveFunction) {
      case 'gaussian':
        const sigma = particle.wavelength / 4
        const gaussian = Math.exp(-(distance * distance) / (2 * sigma * sigma))
        value = gaussian * Math.cos(phase + distance / particle.wavelength * 2 * Math.PI)
        break
        
      case 'plane':
        const kx = Math.cos(particle.vx) * 2 * Math.PI / particle.wavelength
        const ky = Math.sin(particle.vy) * 2 * Math.PI / particle.wavelength
        value = Math.cos(kx * x + ky * y + phase)
        break
        
      case 'spherical':
        const sphericalPhase = phase + distance / particle.wavelength * 2 * Math.PI
        value = Math.cos(sphericalPhase) / (1 + distance / particle.wavelength)
        break
        
      case 'interfering':
        const interference1 = Math.cos(phase + distance / particle.wavelength * 2 * Math.PI)
        const interference2 = Math.cos(phase + (distance + particle.wavelength/2) / particle.wavelength * 2 * Math.PI)
        value = (interference1 + interference2) / 2
        break

      case 'harmonic':
        const harmonic1 = Math.cos(phase + distance / particle.wavelength * 2 * Math.PI)
        const harmonic2 = Math.cos(phase + distance / (particle.wavelength * 0.5) * 2 * Math.PI)
        const harmonic3 = Math.cos(phase + distance / (particle.wavelength * 0.25) * 2 * Math.PI)
        value = (harmonic1 + harmonic2 * 0.5 + harmonic3 * 0.25) / 1.75
        break

      case 'chaotic':
        const chaotic1 = Math.cos(phase + distance / particle.wavelength * 2 * Math.PI)
        const chaotic2 = Math.sin(phase + distance / (particle.wavelength * 1.618) * 2 * Math.PI)
        const chaotic3 = Math.cos(phase + distance / (particle.wavelength * 0.618) * 2 * Math.PI)
        value = (chaotic1 + chaotic2 * 0.7 + chaotic3 * 0.3) / 2
        break
    }
    
    return value * particle.amplitude
  }, [animationSettings.waveSpeed])

  // Calculate quantum interference field
  const calculateInterferenceField = useCallback((width: number, height: number): InterferencePoint[] => {
    const points: InterferencePoint[] = []
    const step = Math.max(3, Math.min(6, 60 / fieldDensity))
    
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        let totalAmplitude = 0
        let totalPhase = 0
        let totalEnergy = 0
        let particleCount = 0
        let chaos = 0
        
        particles.forEach(particle => {
          if (particle.collapsed) return
          
          const waveValue = calculateWaveFunction(x, y, particle, animationSettings.time)
          totalAmplitude += waveValue
          totalPhase += particle.phase
          totalEnergy += particle.energy
          particleCount++
          
          if (particle.waveFunction === 'chaotic') {
            chaos += Math.abs(waveValue) * chaosLevel
          }
        })
        
        if (particleCount > 0) {
          const interference = Math.abs(totalAmplitude) * interferenceStrength
          const collapse = interference > collapseThreshold ? interference : 0
          
          points.push({
            x,
            y,
            amplitude: totalAmplitude,
            phase: totalPhase / particleCount,
            energy: totalEnergy / particleCount,
            interference,
            collapse,
            chaos: Math.min(1, chaos)
          })
        }
      }
    }
    
    return points
  }, [particles, calculateWaveFunction, animationSettings.time, fieldDensity, interferenceStrength, collapseThreshold, chaosLevel])

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
        return prevParticles.map(particle => {
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = width
          if (particle.x > width) particle.x = 0
          if (particle.y < 0) particle.y = height
          if (particle.y > height) particle.y = 0

          // Update phase
          particle.phase += particle.energy * 0.02

          // Update pulse
          particle.pulse = (particle.pulse + 0.1) % (Math.PI * 2)

          // Check for measurement device interactions
          measurementDevices.forEach(device => {
            if (!device.active) return
            
            const dx = device.x - particle.x
            const dy = device.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < device.radius) {
              const collapseProbability = (1 - distance / device.radius) * device.influence
              if (Math.random() < collapseProbability && !particle.collapsed) {
                particle.collapsed = true
                particle.superposition = false
                
                // Record measurement
                device.results.push({
                  x: particle.x,
                  y: particle.y,
                  value: particle.energy,
                  time: animationSettings.time
                })
                
                // Keep only recent results
                if (device.results.length > 20) {
                  device.results.shift()
                }
              }
            }
          })

          return particle
        })
      })

      // Update measurement devices
      setMeasurementDevices(prevDevices => {
        return prevDevices.map(device => {
          device.pulse = (device.pulse + 0.05) % (Math.PI * 2)
          return device
        })
      })

      // Calculate interference field
      const interferenceField = calculateInterferenceField(width, height)

      // Draw interference field
      if (showInterference) {
        interferenceField.forEach(point => {
          const intensity = Math.abs(point.interference)
          const alpha = Math.min(0.8, intensity * 0.5)
          
          if (intensity > 0.1) {
            ctx.fillStyle = theme === 'dark' ? 
              `rgba(255, 255, 255, ${alpha})` : 
              `rgba(0, 0, 0, ${alpha})`
            ctx.fillRect(point.x, point.y, 2, 2)
          }
        })
      }

      // Draw collapse effects
      if (showCollapse) {
        interferenceField.forEach(point => {
          if (point.collapse > 0) {
            const intensity = point.collapse
            const size = intensity * 4 + 1
            
            ctx.fillStyle = theme === 'dark' ? 
              `rgba(255, 100, 100, ${intensity * 0.6})` : 
              `rgba(255, 0, 0, ${intensity * 0.6})`
            ctx.beginPath()
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      }

      // Draw chaos effects
      if (showChaos) {
        interferenceField.forEach(point => {
          if (point.chaos > 0.3) {
            const intensity = point.chaos
            const size = intensity * 3 + 1
            
            ctx.fillStyle = theme === 'dark' ? 
              `rgba(255, 255, 0, ${intensity * 0.4})` : 
              `rgba(255, 200, 0, ${intensity * 0.4})`
            ctx.fillRect(point.x - size/2, point.y - size/2, size, size)
          }
        })
      }

      // Draw particles
      if (showParticles) {
        particles.forEach(particle => {
          const pulseIntensity = Math.sin(particle.pulse) * 0.3 + 0.7
          const size = particle.size * pulseIntensity
          
          if (particle.collapsed) {
            ctx.fillStyle = theme === 'dark' ? '#ff4444' : '#cc0000'
          } else {
            ctx.fillStyle = particle.color
          }
          
          ctx.globalAlpha = pulseIntensity
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Draw measurement devices
      if (showMeasurementDevices) {
        measurementDevices.forEach(device => {
          const pulseIntensity = Math.sin(device.pulse) * 0.3 + 0.7
          
          // Draw device circle
          ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000'
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.arc(device.x, device.y, device.radius, 0, Math.PI * 2)
          ctx.stroke()
          
          // Draw device center
          ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
          ctx.globalAlpha = pulseIntensity * 0.6
          ctx.beginPath()
          ctx.arc(device.x, device.y, 4, 0, Math.PI * 2)
          ctx.fill()
          
          // Draw measurement results
          device.results.forEach((result, index) => {
            const age = (animationSettings.time - result.time) / 1000
            const alpha = Math.max(0, 1 - age * 2)
            
            if (alpha > 0) {
              ctx.fillStyle = theme === 'dark' ? 
                `rgba(255, 255, 255, ${alpha * 0.5})` : 
                `rgba(0, 0, 0, ${alpha * 0.5})`
              ctx.beginPath()
              ctx.arc(result.x, result.y, 2, 0, Math.PI * 2)
              ctx.fill()
            }
          })
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
  }, [isClient, animationSettings.isAnimating, canvasSize, particles, measurementDevices, calculateInterferenceField, showParticles, showInterference, showCollapse, showChaos, showMeasurementDevices, theme])

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
    // Reinitialize quantum system
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const width = canvasSize.width
      const height = canvasSize.height

      const newParticles: QuantumParticle[] = []
      const waveFunctions: Array<'gaussian' | 'plane' | 'spherical' | 'interfering' | 'harmonic' | 'chaotic'> = 
        ['gaussian', 'plane', 'spherical', 'interfering', 'harmonic', 'chaotic']
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: `particle-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          amplitude: Math.random() * 60 + 40,
          phase: Math.random() * Math.PI * 2,
          wavelength: Math.random() * 100 + 80,
          energy: Math.random() * 0.8 + 0.2,
          superposition: true,
          collapsed: false,
          waveFunction: waveFunctions[Math.floor(Math.random() * waveFunctions.length)],
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          life: 1,
          maxLife: 1,
          size: Math.random() * 3 + 2,
          pulse: 0,
          entanglement: [],
          spin: Math.random() * 2 - 1
        })
      }

      const newDevices: MeasurementDevice[] = []
      const deviceTypes: Array<'position' | 'momentum' | 'energy' | 'spin' | 'entanglement'> = 
        ['position', 'momentum', 'energy', 'spin', 'entanglement']
      
      for (let i = 0; i < deviceCount; i++) {
        newDevices.push({
          id: `device-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 60 + 40,
          active: true,
          measurementType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
          results: [],
          pulse: 0,
          influence: Math.random() * 0.5 + 0.5
        })
      }

      setParticles(newParticles)
      setMeasurementDevices(newDevices)
    }
  }, [canvasSize, particleCount, deviceCount])

  // Download canvas
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'wave-interference-2.png'
    link.href = canvas.toDataURL()
    link.click()
  }, [])

  if (!isClient) {
    return <FullScreenLoader variant="line" text={t('common.preparing')} />
  }

  return (
    <VisualizationLayout
      title="Wave Interference 2"
      description="Quantum physics inspired wave interference with particle-wave duality"
      canvasRef={canvasRef}
      controls={
        <>
          <AnimationControls
            settings={animationSettings}
            onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
            onReset={handleReset}
            expanded={panelState.animationExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ ...prev, animationExpanded: !prev.animationExpanded }))}
          />
          <WaveSourceControls2
            particleCount={particleCount}
            onParticleCountChange={setParticleCount}
            deviceCount={deviceCount}
            onDeviceCountChange={setDeviceCount}
            showParticles={showParticles}
            onShowParticlesChange={setShowParticles}
            showMeasurementDevices={showMeasurementDevices}
            onShowMeasurementDevicesChange={setShowMeasurementDevices}
            isExpanded={panelState.waveSourcesExpanded}
            onToggleExpanded={(expanded) => 
              setPanelState(prev => ({ ...prev, waveSourcesExpanded: expanded }))
            }
          />
          <WaveSettings
            showWaveFunctions={showWaveFunctions}
            onShowWaveFunctionsChange={setShowWaveFunctions}
            showInterference={showInterference}
            onShowInterferenceChange={setShowInterference}
            showCollapse={showCollapse}
            onShowCollapseChange={setShowCollapse}
            fieldDensity={fieldDensity}
            onFieldDensityChange={setFieldDensity}
            interferenceStrength={interferenceStrength}
            onInterferenceStrengthChange={setInterferenceStrength}
            isExpanded={panelState.waveSettingsExpanded}
            onToggleExpanded={(expanded) => 
              setPanelState(prev => ({ ...prev, waveSettingsExpanded: expanded }))
            }
          />
          <QuantumControls
            showEntanglement={showEntanglement}
            onShowEntanglementChange={setShowEntanglement}
            showChaos={showChaos}
            onShowChaosChange={setShowChaos}
            collapseThreshold={collapseThreshold}
            onCollapseThresholdChange={setCollapseThreshold}
            chaosLevel={chaosLevel}
            onChaosLevelChange={setChaosLevel}
            isExpanded={quantumControlsExpanded}
            onToggleExpanded={setQuantumControlsExpanded}
          />
        </>
      }
      actionButtons={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </>
      }
      isPanelOpen={panelState.isOpen}
      onPanelToggle={(isOpen) => setPanelState(prev => ({ ...prev, isOpen }))}
    />
  )
} 