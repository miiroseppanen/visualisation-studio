'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FullScreenLoader } from '@/components/ui/loader'

interface WaveSource {
  id: string
  x: number
  y: number
  amplitude: number
  frequency: number
  phase: number
  wavelength: number
  active: boolean
  type: 'sine' | 'cosine' | 'spiral' | 'radial' | 'interference'
  color: string
  rotation: number
  rotationSpeed: number
}

export default function WaveInterference2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)

  // Use refs to store simulation state to avoid infinite re-renders
  const waveSourcesRef = useRef<WaveSource[]>([])
  const timeRef = useRef(0)

  // Controls state
  const [showWaveFunctions, setShowWaveFunctions] = useState(true)
  const [showInterference, setShowInterference] = useState(true)
  const [showWaveTrails, setShowWaveTrails] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [waveAmplitude, setWaveAmplitude] = useState(50)
  const [waveFrequency, setWaveFrequency] = useState(0.02)
  const [waveWavelength, setWaveWavelength] = useState(60)
  const [interferenceIntensity, setInterferenceIntensity] = useState(0.8)
  const [colorMode, setColorMode] = useState<'rainbow' | 'monochrome' | 'thermal'>('rainbow')

  // Display state (for UI updates)
  const [displayTime, setDisplayTime] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize simulation
  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Initialize wave sources with different types
    const newWaveSources: WaveSource[] = [
      { 
        id: 'w1', 
        x: width * 0.3, 
        y: height * 0.5, 
        amplitude: waveAmplitude, 
        frequency: waveFrequency, 
        phase: 0, 
        wavelength: waveWavelength, 
        active: true,
        type: 'sine',
        color: '#ffffff',
        rotation: 0,
        rotationSpeed: 0.5
      },
      { 
        id: 'w2', 
        x: width * 0.7, 
        y: height * 0.5, 
        amplitude: waveAmplitude, 
        frequency: waveFrequency, 
        phase: Math.PI, 
        wavelength: waveWavelength, 
        active: true,
        type: 'cosine',
        color: '#cccccc',
        rotation: 0,
        rotationSpeed: -0.3
      }
    ]

    waveSourcesRef.current = newWaveSources
  }, [isClient, waveAmplitude, waveFrequency, waveWavelength])

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

  // Calculate wave value at a point
  const calculateWaveValue = useCallback((x: number, y: number, source: WaveSource, t: number): number => {
    const dx = x - source.x
    const dy = y - source.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    
    switch (source.type) {
      case 'sine':
        return source.amplitude * Math.sin((distance / source.wavelength) * 2 * Math.PI + source.phase + t * source.frequency)
      case 'cosine':
        return source.amplitude * Math.cos((distance / source.wavelength) * 2 * Math.PI + source.phase + t * source.frequency)
      case 'spiral':
        return source.amplitude * Math.sin((distance / source.wavelength) * 2 * Math.PI + angle * 3 + source.phase + t * source.frequency)
      case 'radial':
        return source.amplitude * Math.sin(distance * 0.1 + source.phase + t * source.frequency) * Math.exp(-distance / 100)
      case 'interference':
        return source.amplitude * Math.sin((distance / source.wavelength) * 2 * Math.PI + source.phase + t * source.frequency) * Math.cos(angle * 2)
      default:
        return 0
    }
  }, [])

  // Calculate total interference at a point
  const calculateInterference = useCallback((x: number, y: number, t: number): number => {
    let totalAmplitude = 0

    waveSourcesRef.current.forEach(source => {
      if (!source.active) return
      totalAmplitude += calculateWaveValue(x, y, source, t)
    })

    return totalAmplitude
  }, [calculateWaveValue])

  // Get color based on value and mode
  const getColor = useCallback((value: number, maxValue: number): string => {
    const normalized = (value + maxValue) / (2 * maxValue)
    
    switch (colorMode) {
      case 'rainbow':
        const hue = (normalized * 360) % 360
        return `hsl(${hue}, 70%, 60%)`
      case 'monochrome':
        const intensity = Math.abs(normalized) * 255
        return `rgb(${intensity}, ${intensity}, ${intensity})`
      case 'thermal':
        if (normalized < 0.5) {
          const blue = normalized * 2 * 255
          return `rgb(0, 0, ${blue})`
        } else {
          const red = (normalized - 0.5) * 2 * 255
          return `rgb(${red}, 0, 255)`
        }
      default:
        return '#ffffff'
    }
  }, [colorMode])

  // Animation loop
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastUpdateTime = 0
    const updateInterval = 100 // Update display state every 100ms

    const animate = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // Clear canvas with black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      // Update time in ref (no React state update)
      timeRef.current += 0.016 * animationSpeed
      const currentTimeValue = timeRef.current

      // Update wave source rotations
      waveSourcesRef.current.forEach(source => {
        source.rotation += source.rotationSpeed * animationSpeed * 0.01
      })

      // Draw interference pattern
      if (showInterference) {
        const gridSize = 4 // Smaller grid for more detail
        const maxValue = waveAmplitude * 2
        
        for (let x = 0; x < width; x += gridSize) {
          for (let y = 0; y < height; y += gridSize) {
            const interference = calculateInterference(x, y, currentTimeValue)
            const intensity = Math.abs(interference) / maxValue
            const alpha = Math.min(intensity * interferenceIntensity, 0.8)
            
            if (alpha > 0.02) {
              const color = getColor(interference, maxValue)
              ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('hsl', 'hsla')
              ctx.fillRect(x, y, gridSize, gridSize)
            }
          }
        }
      }

      // Draw wave functions
      if (showWaveFunctions) {
        waveSourcesRef.current.forEach(source => {
          if (!source.active) return

          ctx.save()
          ctx.translate(source.x, source.y)
          ctx.rotate(source.rotation)

          // Draw wave rings
          const numRings = 8
          for (let i = 1; i <= numRings; i++) {
            const radius = (source.wavelength / numRings) * i
            const waveValue = calculateWaveValue(source.x + radius, source.y, source, currentTimeValue)
            const alpha = Math.abs(waveValue) / (waveAmplitude * 2)
            
            if (alpha > 0.1) {
              ctx.beginPath()
              ctx.arc(0, 0, radius, 0, Math.PI * 2)
              ctx.strokeStyle = source.color.replace(')', `, ${alpha * 0.6})`).replace('rgb', 'rgba').replace('hsl', 'hsla')
              ctx.lineWidth = 2
              ctx.stroke()
            }
          }

          // Draw source center
          ctx.beginPath()
          ctx.arc(0, 0, 8, 0, Math.PI * 2)
          ctx.fillStyle = source.color
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.restore()
        })
      }

      // Draw wave trails
      if (showWaveTrails) {
        waveSourcesRef.current.forEach(source => {
          if (!source.active) return

          ctx.beginPath()
          ctx.strokeStyle = source.color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('hsl', 'hsla')
          ctx.lineWidth = 1

          // Draw spiral trail
          for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
            const radius = 20 + angle * 10
            const x = source.x + Math.cos(angle + source.rotation) * radius
            const y = source.y + Math.sin(angle + source.rotation) * radius
            
            if (angle === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
        })
      }

      // Update display state periodically
      if (timestamp - lastUpdateTime > updateInterval) {
        setDisplayTime(currentTimeValue)
        lastUpdateTime = timestamp
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isClient, showWaveFunctions, showInterference, showWaveTrails, animationSpeed, calculateInterference, waveAmplitude, interferenceIntensity, getColor])

  if (!isClient) {
    return <FullScreenLoader text="Preparing..." />
  }

  return (
    <VisualizationLayout
      panelOpen={panelOpen}
      onPanelToggle={() => setPanelOpen((v) => !v)}
      statusContent={<>
        Wave Sources: {waveSourcesRef.current.filter(w => w.active).length} | Time: {Math.round(displayTime * 100) / 100}s
      </>}
      helpText="Watch beautiful wave interference patterns emerge from two dynamic wave sources. Adjust parameters to create different visual effects."
      settingsContent={
        <div className="space-y-6">
          <CollapsibleSection title="Wave Properties" defaultOpen>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wave-amplitude">Wave Amplitude: {waveAmplitude}</Label>
                <Slider
                  id="wave-amplitude"
                  min={20}
                  max={150}
                  step={5}
                  value={[waveAmplitude]}
                  onValueChange={([v]) => setWaveAmplitude(v)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wave-frequency">Wave Frequency: {waveFrequency.toFixed(3)}</Label>
                <Slider
                  id="wave-frequency"
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  value={[waveFrequency]}
                  onValueChange={([v]) => setWaveFrequency(v)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wave-wavelength">Wave Wavelength: {waveWavelength}</Label>
                <Slider
                  id="wave-wavelength"
                  min={20}
                  max={200}
                  step={5}
                  value={[waveWavelength]}
                  onValueChange={([v]) => setWaveWavelength(v)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interference-intensity">Interference Intensity: {interferenceIntensity.toFixed(1)}</Label>
                <Slider
                  id="interference-intensity"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={[interferenceIntensity]}
                  onValueChange={([v]) => setInterferenceIntensity(v)}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Animation" defaultOpen>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="animation-speed">Animation Speed: {animationSpeed.toFixed(1)}x</Label>
                <Slider
                  id="animation-speed"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={[animationSpeed]}
                  onValueChange={([v]) => setAnimationSpeed(v)}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Visualisation" defaultOpen>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-wave-functions"
                  checked={showWaveFunctions}
                  onCheckedChange={v => setShowWaveFunctions(v === true)}
                />
                <Label htmlFor="show-wave-functions">Show Wave Functions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-interference"
                  checked={showInterference}
                  onCheckedChange={v => setShowInterference(v === true)}
                />
                <Label htmlFor="show-interference">Show Interference Pattern</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-wave-trails"
                  checked={showWaveTrails}
                  onCheckedChange={v => setShowWaveTrails(v === true)}
                />
                <Label htmlFor="show-wave-trails">Show Wave Trails</Label>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Color Mode" defaultOpen>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="color-rainbow"
                  checked={colorMode === 'rainbow'}
                  onCheckedChange={v => v === true && setColorMode('rainbow')}
                />
                <Label htmlFor="color-rainbow">Rainbow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="color-monochrome"
                  checked={colorMode === 'monochrome'}
                  onCheckedChange={v => v === true && setColorMode('monochrome')}
                />
                <Label htmlFor="color-monochrome">Monochrome</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="color-thermal"
                  checked={colorMode === 'thermal'}
                  onCheckedChange={v => v === true && setColorMode('thermal')}
                />
                <Label htmlFor="color-thermal">Thermal</Label>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black"
        style={{ minHeight: 400 }}
      />
    </VisualizationLayout>
  )
} dk