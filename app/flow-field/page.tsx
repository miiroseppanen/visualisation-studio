'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Settings, Magnet, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'

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
  const [particleSpeed, setParticleSpeed] = useState(2)
  const [particleLife, setParticleLife] = useState(100)
  const [showPoles, setShowPoles] = useState(true)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [isAddingPole, setIsAddingPole] = useState(false)
  const [selectedPoleType, setSelectedPoleType] = useState<'north' | 'south'>('north')

  // Set canvas size and initialize particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles with canvas size
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        life: particleLife
      })
    }
    setParticles(newParticles)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [particleCount, particleLife])

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
        const newVx = particle.vx + field.fx * 0.1
        const newVy = particle.vy + field.fy * 0.1
        
        // Limit speed
        const speed = Math.sqrt(newVx * newVx + newVy * newVy)
        const maxSpeed = particleSpeed
        const finalVx = speed > maxSpeed ? (newVx / speed) * maxSpeed : newVx
        const finalVy = speed > maxSpeed ? (newVy / speed) * maxSpeed : newVy
        
        // Update position
        const newX = particle.x + finalVx
        const newY = particle.y + finalVy
        
        // Wrap around edges
        const canvas = canvasRef.current
        const canvasWidth = canvas?.width || 800
        const canvasHeight = canvas?.height || 600
        const wrappedX = newX < 0 ? canvasWidth : newX > canvasWidth ? 0 : newX
        const wrappedY = newY < 0 ? canvasHeight : newY > canvasHeight ? 0 : newY
        
        // Decrease life
        const newLife = particle.life - 1
        
        // Reset particle if life is over
        if (newLife <= 0) {
          const canvas = canvasRef.current
          const canvasWidth = canvas?.width || 800
          const canvasHeight = canvas?.height || 600
          return {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            vx: 0,
            vy: 0,
            life: particleLife
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

  // Start animation
  useEffect(() => {
    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleSpeed, particleLife, poles])

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
      
      const step = 40
      for (let i = 0; i < canvas.width; i += step) {
        for (let j = 0; j < canvas.height; j += step) {
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
      const alpha = particle.life / particleLife
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

  // Handle canvas click for adding poles
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingPole) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newPole: MagneticPole = {
      id: Date.now().toString(),
      x,
      y,
      strength: 100,
      type: selectedPoleType
    }

    setPoles(prev => [...prev, newPole])
    setIsAddingPole(false)
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
    setParticleSpeed(2)
    setParticleLife(100)
    setShowPoles(true)
    setShowFieldLines(true)
    setIsAddingPole(false)
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <VisualizationNav />

      <div className="flex-1 flex">
        {/* Canvas - Fullscreen */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
          />
          {isAddingPole && (
            <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
              Click to add {selectedPoleType} pole
            </div>
          )}
        </div>

        {/* Floating Controls Panel */}
        <ControlsPanel title="Flow Field Controls">
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-medium mb-4">Pole Management</h3>
              <div className="space-y-4 pl-4">
                <div className="flex space-x-2">
                  <Button
                    variant={selectedPoleType === 'north' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPoleType('north')}
                  >
                    North
                  </Button>
                  <Button
                    variant={selectedPoleType === 'south' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPoleType('south')}
                  >
                    South
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingPole(!isAddingPole)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAddingPole ? 'Cancel' : 'Add Pole'}
                </Button>

                <div className="space-y-3">
                  {poles.map(pole => (
                    <div key={pole.id} className="flex items-center space-x-2 p-2 border rounded">
                      <div className={`w-3 h-3 rounded-full ${pole.type === 'north' ? 'bg-black' : 'bg-white border border-black'}`} />
                      <span className="text-sm flex-1">{pole.type}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePole(pole.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPoles"
                    checked={showPoles}
                    onCheckedChange={(checked) => setShowPoles(checked as boolean)}
                  />
                  <Label htmlFor="showPoles">Show Poles</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showFieldLines"
                    checked={showFieldLines}
                    onCheckedChange={(checked) => setShowFieldLines(checked as boolean)}
                  />
                  <Label htmlFor="showFieldLines">Show Field Lines</Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-4">Particle Settings</h3>
              <div className="space-y-4 pl-4">
                <div className="space-y-2">
                  <Label>Particle Count</Label>
                  <Slider
                    value={[particleCount]}
                    onValueChange={([value]) => setParticleCount(value)}
                    max={500}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{particleCount}</div>
                </div>

                <div className="space-y-2">
                  <Label>Particle Speed</Label>
                  <Slider
                    value={[particleSpeed]}
                    onValueChange={([value]) => setParticleSpeed(value)}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{particleSpeed}</div>
                </div>

                <div className="space-y-2">
                  <Label>Particle Life</Label>
                  <Slider
                    value={[particleLife]}
                    onValueChange={([value]) => setParticleLife(value)}
                    max={200}
                    min={20}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{particleLife}</div>
                </div>
              </div>
            </div>
          </div>

                    {/* Fixed Action Buttons at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-background/30 backdrop-blur-lg border-t border-border/20 p-4">
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={exportSVG}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
} 