'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Settings } from 'lucide-react'
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

export default function GridFieldPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gridLines, setGridLines] = useState<GridLine[]>([])
  const [poleX, setPoleX] = useState(400)
  const [poleY, setPoleY] = useState(300)
  const [poleStrength, setPoleStrength] = useState(100)
  const [gridSpacing, setGridSpacing] = useState(30)
  const [lineLength, setLineLength] = useState(20)
  const [showPole, setShowPole] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  // Set canvas size and generate grid lines
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

    const lines: GridLine[] = []
    const cols = Math.ceil(canvas.width / gridSpacing)
    const rows = Math.ceil(canvas.height / gridSpacing)

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = i * gridSpacing
        const y = j * gridSpacing

        // Calculate angle towards pole
        const dx = poleX - x
        const dy = poleY - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = distance > 0 ? Math.atan2(dy, dx) : 0

        // Apply pole strength influence
        const strength = poleStrength / (distance + 1)
        const finalAngle = angle * strength

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
  }, [poleX, poleY, poleStrength, gridSpacing, lineLength])

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

    // Draw pole
    if (showPole) {
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(poleX, poleY, 8, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(poleX, poleY, 20, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [gridLines, poleX, poleY, showPole])

  // Handle canvas interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPoleX(x)
    setPoleY(y)
    setIsDragging(true)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPoleX(x)
    setPoleY(y)
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  // Export SVG
  const exportSVG = () => {
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .grid-line { stroke: #000; stroke-width: 1; stroke-linecap: round; }
            .pole { fill: #000; }
            .pole-ring { stroke: #000; stroke-width: 2; stroke-dasharray: 5,5; fill: none; }
          </style>
        </defs>
        ${gridLines.map(line => {
          const endX = line.x + Math.cos(line.angle) * line.length
          const endY = line.y + Math.sin(line.angle) * line.length
          return `<line class="grid-line" x1="${line.x}" y1="${line.y}" x2="${endX}" y2="${endY}" />`
        }).join('')}
        ${showPole ? `
          <circle class="pole" cx="${poleX}" cy="${poleY}" r="8" />
          <circle class="pole-ring" cx="${poleX}" cy="${poleY}" r="20" />
        ` : ''}
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
    setPoleX(400)
    setPoleY(300)
    setPoleStrength(100)
    setGridSpacing(30)
    setLineLength(20)
    setShowPole(true)
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
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
          <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Click and drag to move pole
          </div>
        </div>

        {/* Floating Controls Panel */}
        <ControlsPanel title="Grid Field Controls">
          <Card>
            <CardHeader>
              <CardTitle>Pole Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pole Strength</Label>
                <Slider
                  value={[poleStrength]}
                  onValueChange={([value]) => setPoleStrength(value)}
                  max={200}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">{poleStrength}</div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showPole"
                  checked={showPole}
                  onCheckedChange={(checked) => setShowPole(checked as boolean)}
                />
                <Label htmlFor="showPole">Show Pole</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grid Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
                    </Card>

          {/* Fixed Action Buttons at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
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