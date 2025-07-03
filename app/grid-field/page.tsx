'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Settings, Plus, Trash2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'

interface GridLine {
  x: number
  y: number
  angle: number
  length: number
}

interface Pole {
  id: string
  x: number
  y: number
  strength: number
  color: string
}

export default function GridFieldPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [gridLines, setGridLines] = useState<GridLine[]>([])
  const [poles, setPoles] = useState<Pole[]>([
    { id: '1', x: 400, y: 300, strength: 100, color: '#000000' }
  ])
  const [gridSpacing, setGridSpacing] = useState(30)
  const [lineLength, setLineLength] = useState(20)
  const [showPoles, setShowPoles] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedPoleId, setDraggedPoleId] = useState<string | null>(null)
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(true)
  const [windStrength, setWindStrength] = useState(0.6)
  const [windSpeed, setWindSpeed] = useState(1.0)
  const [time, setTime] = useState(0)

  // Generate unique ID for new poles
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Add new pole
  const addPole = () => {
    const newPole: Pole = {
      id: generateId(),
      x: 200 + Math.random() * 400,
      y: 150 + Math.random() * 300,
      strength: 100,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }
    setPoles([...poles, newPole])
  }

  // Remove pole
  const removePole = (id: string) => {
    if (poles.length > 1) {
      setPoles(poles.filter(pole => pole.id !== id))
    }
  }

  // Update pole properties
  const updatePole = (id: string, updates: Partial<Pole>) => {
    setPoles(poles.map(pole => 
      pole.id === id ? { ...pole, ...updates } : pole
    ))
  }

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return

    const animate = () => {
      setTime(prevTime => prevTime + windSpeed * 0.016) // 60fps
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, windSpeed])

  // Set canvas size and generate grid lines
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

    const lines: GridLine[] = []
    const rect = canvas.getBoundingClientRect()
    const cols = Math.ceil(rect.width / gridSpacing)
    const rows = Math.ceil(rect.height / gridSpacing)

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = i * gridSpacing
        const y = j * gridSpacing

        // Calculate combined angle from all poles
        let totalAngle = 0
        let totalWeight = 0

        poles.forEach(pole => {
          const dx = pole.x - x
          const dy = pole.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0) {
            const angle = Math.atan2(dy, dx)
            const strength = pole.strength / (distance + 1)
            totalAngle += angle * strength
            totalWeight += strength
          }
        })

        // Add wind effect
        const windAngle = Math.sin(time + x * 0.01 + y * 0.01) * windStrength
        const windWeight = windStrength * 0.5

        // Normalize the final angle with wind influence
        const baseAngle = totalWeight > 0 ? totalAngle / totalWeight : 0
        const finalAngle = baseAngle + windAngle * windWeight

        lines.push({
          x,
          y,
          angle: finalAngle,
          length: lineLength
        })
      }
    }

    setGridLines(lines)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [poles, gridSpacing, lineLength, time, windStrength])

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'

    gridLines.forEach(line => {
      const endX = line.x + Math.cos(line.angle) * line.length
      const endY = line.y + Math.sin(line.angle) * line.length

      ctx.beginPath()
      ctx.moveTo(line.x, line.y)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    })

    // Draw poles
    if (showPoles) {
      poles.forEach(pole => {
        // Draw pole circle
        ctx.fillStyle = pole.color
        ctx.beginPath()
        ctx.arc(pole.x, pole.y, 8, 0, 2 * Math.PI)
        ctx.fill()

        // Draw pole ring
        ctx.strokeStyle = pole.color
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(pole.x, pole.y, 20, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw pole number
        ctx.fillStyle = '#fff'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((poles.indexOf(pole) + 1).toString(), pole.x, pole.y)
      })
    }
  }, [gridLines, poles, showPoles])

  // Handle canvas interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on an existing pole
    const clickedPole = poles.find(pole => {
      const distance = Math.sqrt((pole.x - x) ** 2 + (pole.y - y) ** 2)
      return distance <= 20 // Click radius
    })

    if (clickedPole) {
      setDraggedPoleId(clickedPole.id)
      setIsDragging(true)
    } else {
      // Create new pole at click location
      const newPole: Pole = {
        id: generateId(),
        x,
        y,
        strength: 100,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }
      setPoles([...poles, newPole])
      setDraggedPoleId(newPole.id)
      setIsDragging(true)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedPoleId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updatePole(draggedPoleId, { x, y })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedPoleId(null)
  }

  // Export SVG
  const exportSVG = () => {
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .grid-line { stroke: #000; stroke-width: 1; stroke-linecap: round; }
            .pole { fill: var(--pole-color); }
            .pole-ring { stroke: var(--pole-color); stroke-width: 2; stroke-dasharray: 5,5; fill: none; }
          </style>
        </defs>
        ${gridLines.map(line => {
          const endX = line.x + Math.cos(line.angle) * line.length
          const endY = line.y + Math.sin(line.angle) * line.length
          return `<line class="grid-line" x1="${line.x}" y1="${line.y}" x2="${endX}" y2="${endY}" />`
        }).join('')}
        ${showPoles ? poles.map(pole => `
          <g style="--pole-color: ${pole.color}">
            <circle class="pole" cx="${pole.x}" cy="${pole.y}" r="8" />
            <circle class="pole-ring" cx="${pole.x}" cy="${pole.y}" r="20" />
          </g>
        `).join('') : ''}
      </svg>
    `

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grid-field.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setPoles([{ id: '1', x: 400, y: 300, strength: 100, color: '#000000' }])
    setGridSpacing(30)
    setLineLength(20)
    setShowPoles(true)
    setWindStrength(0.6)
    setWindSpeed(1.0)
    setIsAnimating(true)
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
          />
          <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Click to add pole, drag to move
          </div>
        </div>

        {/* Floating Controls Panel */}
        <ControlsPanel title="Grid Field Controls">
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">Poles ({poles.length})</h3>
                <Button variant="outline" size="sm" onClick={addPole}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4 pl-4">
                {poles.map((pole, index) => (
                  <div key={pole.id} className="space-y-3 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-border"
                          style={{ backgroundColor: pole.color }}
                        />
                        <Label className="text-sm">Pole {index + 1}</Label>
                      </div>
                      {poles.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePole(pole.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Strength</Label>
                      <Slider
                        value={[pole.strength]}
                        onValueChange={([value]) => updatePole(pole.id, { strength: value })}
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">{pole.strength}</div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPoles"
                    checked={showPoles}
                    onCheckedChange={(checked) => setShowPoles(checked as boolean)}
                  />
                  <Label htmlFor="showPoles">Show Poles</Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-4">Animation</h3>
              <div className="space-y-4 pl-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnimating(!isAnimating)}
                  >
                    {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Label className="text-sm">{isAnimating ? 'Pause' : 'Play'} Animation</Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Wind Strength</Label>
                  <Slider
                    value={[windStrength]}
                    onValueChange={([value]) => setWindStrength(value)}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{windStrength.toFixed(2)}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Wind Speed</Label>
                  <Slider
                    value={[windSpeed]}
                    onValueChange={([value]) => setWindSpeed(value)}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{windSpeed.toFixed(1)}x</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-4">Grid Settings</h3>
              <div className="space-y-4 pl-4">
                <div className="space-y-2">
                  <Label>Grid Spacing</Label>
                  <Slider
                    value={[gridSpacing]}
                    onValueChange={([value]) => setGridSpacing(value)}
                    max={60}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{gridSpacing}px</div>
                </div>

                <div className="space-y-2">
                  <Label>Line Length</Label>
                  <Slider
                    value={[lineLength]}
                    onValueChange={([value]) => setLineLength(value)}
                    max={50}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{lineLength}px</div>
                </div>
              </div>
            </div>
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
} 