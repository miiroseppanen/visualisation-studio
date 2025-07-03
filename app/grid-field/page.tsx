'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Settings, Plus, Trash2, Play, Pause, ChevronRight } from 'lucide-react'
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
  // Bezier curve control points
  startX: number
  startY: number
  controlX1: number
  controlY1: number
  controlX2: number
  controlY2: number
  endX: number
  endY: number
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
    { id: '1', x: 400, y: 300, strength: 25, color: '#000000' }
  ])
  const [gridSpacing, setGridSpacing] = useState(30)
  const [lineLength, setLineLength] = useState(20)
  const [gridType, setGridType] = useState<'rectangular' | 'triangular'>('rectangular')
  const [showPoles, setShowPoles] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedPoleId, setDraggedPoleId] = useState<string | null>(null)
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(true)
  const [windStrength, setWindStrength] = useState(0.3)
  const [windSpeed, setWindSpeed] = useState(0.3)
  const [time, setTime] = useState(0)

  // Default direction controls
  const [enableDefaultDirection, setEnableDefaultDirection] = useState(true)
  const [defaultDirectionAngle, setDefaultDirectionAngle] = useState(0) // 0 = right, 90 = down, etc.
  const [defaultDirectionStrength, setDefaultDirectionStrength] = useState(0.005)

  // Curve controls
  const [curveStiffness, setCurveStiffness] = useState(0.3) // 0 = rigid, 1 = very flexible

  // Polarity controls
  const [attractToPoles, setAttractToPoles] = useState(true) // true = attract, false = repel

  // Panel section collapse state
  const [gridSettingsExpanded, setGridSettingsExpanded] = useState(true)
  const [defaultDirectionExpanded, setDefaultDirectionExpanded] = useState(true)
  const [polesExpanded, setPolesExpanded] = useState(true)
  const [animationExpanded, setAnimationExpanded] = useState(true)

  // Calculate field at any point
  const calculateFieldAt = (x: number, y: number) => {
    let fieldX = 0
    let fieldY = 0
    
    // Apply default direction if enabled
    if (enableDefaultDirection) {
      const angleRad = (defaultDirectionAngle * Math.PI) / 180
      fieldX = Math.cos(angleRad) * defaultDirectionStrength
      fieldY = Math.sin(angleRad) * defaultDirectionStrength
    }

    // Calculate influence from each pole
    poles.forEach(pole => {
      const dx = pole.x - x
      const dy = pole.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 1) { // Avoid division by zero
        // Calculate force strength with gentler falloff
        const forceStrength = (pole.strength * 0.01) / (distance * 0.1 + 1)
        
        // Calculate unit vector - direction depends on polarity
        let unitX, unitY
        if (attractToPoles) {
          // Attract: point toward the pole
          unitX = dx / distance
          unitY = dy / distance
        } else {
          // Repel: point away from the pole
          unitX = -dx / distance
          unitY = -dy / distance
        }
        
        // Apply force in the calculated direction
        fieldX += unitX * forceStrength
        fieldY += unitY * forceStrength
      }
    })

    // Add subtle wind fidgeting effect
    const windX = (
      Math.cos(time * 0.5 + x * 0.003 + y * 0.002) * 0.6 +
      Math.cos(time * 0.3 + x * 0.001 - y * 0.001) * 0.4
    ) * windStrength * 0.02
    const windY = (
      Math.sin(time * 0.4 + x * 0.002 + y * 0.003) * 0.6 +
      Math.sin(time * 0.6 + y * 0.001 - x * 0.001) * 0.4
    ) * windStrength * 0.02
    
    fieldX += windX
    fieldY += windY

    return { fieldX, fieldY, angle: Math.atan2(fieldY, fieldX) }
  }

  // Generate unique ID for new poles
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Add new pole
  const addPole = () => {
    const newPole: Pole = {
      id: generateId(),
      x: 200 + Math.random() * 400,
      y: 150 + Math.random() * 300,
      strength: 25,
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
    
    if (gridType === 'rectangular') {
      const cols = Math.ceil(rect.width / gridSpacing)
      const rows = Math.ceil(rect.height / gridSpacing)

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSpacing
          const y = j * gridSpacing

          const { fieldX, fieldY, angle } = calculateFieldAt(x, y)
          
          // Sample field at points along the line to create smooth curves
          const midX = x + Math.cos(angle) * lineLength * 0.5
          const midY = y + Math.sin(angle) * lineLength * 0.5
          const endX = x + Math.cos(angle) * lineLength
          const endY = y + Math.sin(angle) * lineLength
          
          // Get field directions at intermediate points for curve calculation
          const { angle: midAngle } = calculateFieldAt(midX, midY)
          const { angle: endAngle } = calculateFieldAt(endX, endY)
          
          // Create control points that follow the field curvature
          const curveStrength = lineLength * curveStiffness // How much the curve bends
          const controlX1 = x + Math.cos(angle) * lineLength * 0.33 + Math.cos(angle + Math.PI/2) * Math.sin((midAngle - angle) * 0.5) * curveStrength
          const controlY1 = y + Math.sin(angle) * lineLength * 0.33 + Math.sin(angle + Math.PI/2) * Math.sin((midAngle - angle) * 0.5) * curveStrength
          const controlX2 = x + Math.cos(angle) * lineLength * 0.67 + Math.cos(endAngle + Math.PI/2) * Math.sin((endAngle - midAngle) * 0.5) * curveStrength
          const controlY2 = y + Math.sin(angle) * lineLength * 0.67 + Math.sin(endAngle + Math.PI/2) * Math.sin((endAngle - midAngle) * 0.5) * curveStrength

          lines.push({
            x,
            y,
            angle: angle,
            length: lineLength,
            startX: x,
            startY: y,
            controlX1,
            controlY1,
            controlX2,
            controlY2,
            endX,
            endY
          })
        }
      }
    } else {
      // Triangular grid
      const triangleHeight = gridSpacing * Math.sqrt(3) / 2
      const cols = Math.ceil(rect.width / gridSpacing) + 1
      const rows = Math.ceil(rect.height / triangleHeight) + 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Offset every other row to create triangular pattern
          const x = col * gridSpacing + (row % 2) * (gridSpacing / 2)
          const y = row * triangleHeight

          const { fieldX, fieldY, angle } = calculateFieldAt(x, y)
          
          // Sample field at points along the line to create smooth curves
          const midX = x + Math.cos(angle) * lineLength * 0.5
          const midY = y + Math.sin(angle) * lineLength * 0.5
          const endX = x + Math.cos(angle) * lineLength
          const endY = y + Math.sin(angle) * lineLength
          
          // Get field directions at intermediate points for curve calculation
          const { angle: midAngle } = calculateFieldAt(midX, midY)
          const { angle: endAngle } = calculateFieldAt(endX, endY)
          
          // Create control points that follow the field curvature
          const curveStrength = lineLength * curveStiffness // How much the curve bends
          const controlX1 = x + Math.cos(angle) * lineLength * 0.33 + Math.cos(angle + Math.PI/2) * Math.sin((midAngle - angle) * 0.5) * curveStrength
          const controlY1 = y + Math.sin(angle) * lineLength * 0.33 + Math.sin(angle + Math.PI/2) * Math.sin((midAngle - angle) * 0.5) * curveStrength
          const controlX2 = x + Math.cos(angle) * lineLength * 0.67 + Math.cos(endAngle + Math.PI/2) * Math.sin((endAngle - midAngle) * 0.5) * curveStrength
          const controlY2 = y + Math.sin(angle) * lineLength * 0.67 + Math.sin(endAngle + Math.PI/2) * Math.sin((endAngle - midAngle) * 0.5) * curveStrength

          lines.push({
            x,
            y,
            angle: angle,
            length: lineLength,
            startX: x,
            startY: y,
            controlX1,
            controlY1,
            controlX2,
            controlY2,
            endX,
            endY
          })
        }
      }
    }

    setGridLines(lines)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [poles, gridSpacing, lineLength, gridType, time, windStrength, enableDefaultDirection, defaultDirectionAngle, defaultDirectionStrength, curveStiffness, attractToPoles])

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw curved grid lines using Bezier curves
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'

    gridLines.forEach(line => {
      ctx.beginPath()
      ctx.moveTo(line.startX, line.startY)
      ctx.bezierCurveTo(
        line.controlX1, line.controlY1,
        line.controlX2, line.controlY2,
        line.endX, line.endY
      )
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
        strength: 25,
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
            .grid-line { stroke: #000; stroke-width: 1; stroke-linecap: round; fill: none; }
            .pole { fill: var(--pole-color); }
            .pole-ring { stroke: var(--pole-color); stroke-width: 2; stroke-dasharray: 5,5; fill: none; }
          </style>
        </defs>
        ${gridLines.map(line => 
          `<path class="grid-line" d="M ${line.startX} ${line.startY} C ${line.controlX1} ${line.controlY1}, ${line.controlX2} ${line.controlY2}, ${line.endX} ${line.endY}" />`
        ).join('')}
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
    setPoles([{ id: '1', x: 400, y: 300, strength: 25, color: '#000000' }])
    setGridSpacing(30)
    setLineLength(20)
    setGridType('rectangular')
    setShowPoles(true)
    setWindStrength(0.3)
    setWindSpeed(0.3)
    setIsAnimating(true)
    setEnableDefaultDirection(true)
    setDefaultDirectionAngle(0)
    setDefaultDirectionStrength(0.005)
    setCurveStiffness(0.3)
    setAttractToPoles(true)
    // Reset expanded states
    setGridSettingsExpanded(true)
    setDefaultDirectionExpanded(true)
    setPolesExpanded(true)
    setAnimationExpanded(true)
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
              <button
                onClick={() => setGridSettingsExpanded(!gridSettingsExpanded)}
                className="flex items-center w-full text-left"
              >
                <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${gridSettingsExpanded ? 'rotate-90' : 'rotate-0'}`} />
                <h3 className="text-base font-medium">Grid Settings</h3>
              </button>
              {gridSettingsExpanded && (
                <div className="space-y-4 pl-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Grid Type</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={gridType === 'rectangular' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setGridType('rectangular')}
                          className="h-7 px-2 text-xs"
                        >
                          Rect
                        </Button>
                        <Button
                          variant={gridType === 'triangular' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setGridType('triangular')}
                          className="h-7 px-2 text-xs"
                        >
                          Tri
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Grid Spacing</Label>
                      <div className="text-sm text-muted-foreground">{gridSpacing}px</div>
                    </div>
                    <Slider
                      value={[gridSpacing]}
                      onValueChange={([value]) => setGridSpacing(value)}
                      max={120}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Line Length</Label>
                      <div className="text-sm text-muted-foreground">{lineLength}px</div>
                    </div>
                    <Slider
                      value={[lineLength]}
                      onValueChange={([value]) => setLineLength(value)}
                      max={100}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Curve Stiffness</Label>
                      <div className="text-sm text-muted-foreground">{(curveStiffness * 100).toFixed(0)}%</div>
                    </div>
                    <Slider
                      value={[curveStiffness]}
                      onValueChange={([value]) => setCurveStiffness(value)}
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setDefaultDirectionExpanded(!defaultDirectionExpanded)}
                className="flex items-center w-full text-left"
              >
                <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${defaultDirectionExpanded ? 'rotate-90' : 'rotate-0'}`} />
                <h3 className="text-base font-medium">Default Direction</h3>
              </button>
              {defaultDirectionExpanded && (
                <div className="space-y-4 pl-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableDefaultDirection"
                      checked={enableDefaultDirection}
                      onCheckedChange={(checked) => setEnableDefaultDirection(checked as boolean)}
                    />
                    <Label htmlFor="enableDefaultDirection">Enable Default Direction</Label>
                  </div>

                  {enableDefaultDirection && (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Direction Strength</Label>
                          <div className="text-xs text-muted-foreground">{defaultDirectionStrength.toFixed(3)}</div>
                        </div>
                        <Slider
                          value={[defaultDirectionStrength]}
                          onValueChange={([value]) => setDefaultDirectionStrength(value)}
                          max={0.1}
                          min={0.001}
                          step={0.001}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Direction Angle</Label>
                          <div className="text-xs text-muted-foreground">{defaultDirectionAngle}°</div>
                        </div>
                        <Slider
                          value={[defaultDirectionAngle]}
                          onValueChange={([value]) => setDefaultDirectionAngle(value)}
                          max={359}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPolesExpanded(!polesExpanded)}
                  className="flex items-center flex-1 text-left"
                >
                  <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${polesExpanded ? 'rotate-90' : 'rotate-0'}`} />
                  <h3 className="text-base font-medium">Poles ({poles.length})</h3>
                </button>
                <Button variant="outline" size="sm" onClick={addPole} className="ml-2">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {polesExpanded && (
                <div className="space-y-4 pl-4 mt-4">
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
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Strength</Label>
                          <div className="text-xs text-muted-foreground">{pole.strength}</div>
                        </div>
                        <Slider
                          value={[pole.strength]}
                          onValueChange={([value]) => updatePole(pole.id, { strength: value })}
                          max={200}
                          min={1}
                          step={1}
                          className="w-full"
                        />
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="attractToPoles"
                      checked={attractToPoles}
                      onCheckedChange={(checked) => setAttractToPoles(checked as boolean)}
                    />
                    <Label htmlFor="attractToPoles">Attract to Poles</Label>
                    <div className="text-xs text-muted-foreground ml-2">
                      {attractToPoles ? '(Magnetic)' : '(Electric)'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setAnimationExpanded(!animationExpanded)}
                className="flex items-center w-full text-left"
              >
                <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${animationExpanded ? 'rotate-90' : 'rotate-0'}`} />
                <h3 className="text-base font-medium">Animation</h3>
              </button>
              {animationExpanded && (
                <div className="space-y-4 pl-4 mt-4">
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
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Wind Strength</Label>
                      <div className="text-xs text-muted-foreground">{windStrength.toFixed(2)}</div>
                    </div>
                    <Slider
                      value={[windStrength]}
                      onValueChange={([value]) => setWindStrength(value)}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Wind Speed</Label>
                      <div className="text-xs text-muted-foreground">{windSpeed.toFixed(1)}x</div>
                    </div>
                    <Slider
                      value={[windSpeed]}
                      onValueChange={([value]) => setWindSpeed(value)}
                      max={3}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
}