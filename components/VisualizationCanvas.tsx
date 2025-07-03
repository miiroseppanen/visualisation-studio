'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Download, Settings, Info } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface VisualizationCanvasProps {
  title: string
  description: string
  controls: {
    fieldStrength: { min: number; max: number; step: number; defaultValue: number }
    lineCount?: { min: number; max: number; step: number; defaultValue: number }
    gridDensity?: { min: number; max: number; step: number; defaultValue: number }
    lineLength?: { min: number; max: number; step: number; defaultValue: number }
    animationSpeed: { min: number; max: number; step: number; defaultValue: number }
  }
  onCanvasReady: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void
}

export function VisualizationCanvas({ 
  title, 
  description, 
  controls, 
  onCanvasReady 
}: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fieldStrength, setFieldStrength] = useState(controls.fieldStrength.defaultValue)
  const [lineCount, setLineCount] = useState(controls.lineCount?.defaultValue || 50)
  const [gridDensity, setGridDensity] = useState(controls.gridDensity?.defaultValue || 50)
  const [lineLength, setLineLength] = useState(controls.lineLength?.defaultValue || 15)
  const [animationSpeed, setAnimationSpeed] = useState(controls.animationSpeed.defaultValue)
  const [showParticles, setShowParticles] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showPoles, setShowPoles] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize visualization
    onCanvasReady(canvas, ctx)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [onCanvasReady])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full cursor-crosshair"
      />

      {/* Controls Panel */}
      <Card className="fixed top-20 left-5 w-80 bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="flex justify-between">
                Field Strength
                <span className="text-sm text-muted-foreground">{fieldStrength}</span>
              </Label>
              <Slider
                value={[fieldStrength]}
                onValueChange={([value]) => setFieldStrength(value)}
                min={controls.fieldStrength.min}
                max={controls.fieldStrength.max}
                step={controls.fieldStrength.step}
                className="mt-2"
              />
            </div>

            {controls.lineCount && (
              <div>
                <Label className="flex justify-between">
                  Line Count
                  <span className="text-sm text-muted-foreground">{lineCount}</span>
                </Label>
                <Slider
                  value={[lineCount]}
                  onValueChange={([value]) => setLineCount(value)}
                  min={controls.lineCount.min}
                  max={controls.lineCount.max}
                  step={controls.lineCount.step}
                  className="mt-2"
                />
              </div>
            )}

            {controls.gridDensity && (
              <div>
                <Label className="flex justify-between">
                  Grid Density
                  <span className="text-sm text-muted-foreground">{gridDensity}</span>
                </Label>
                <Slider
                  value={[gridDensity]}
                  onValueChange={([value]) => setGridDensity(value)}
                  min={controls.gridDensity.min}
                  max={controls.gridDensity.max}
                  step={controls.gridDensity.step}
                  className="mt-2"
                />
              </div>
            )}

            {controls.lineLength && (
              <div>
                <Label className="flex justify-between">
                  Line Length
                  <span className="text-sm text-muted-foreground">{lineLength}</span>
                </Label>
                <Slider
                  value={[lineLength]}
                  onValueChange={([value]) => setLineLength(value)}
                  min={controls.lineLength.min}
                  max={controls.lineLength.max}
                  step={controls.lineLength.step}
                  className="mt-2"
                />
              </div>
            )}

            <div>
              <Label className="flex justify-between">
                Animation Speed
                <span className="text-sm text-muted-foreground">{animationSpeed}</span>
              </Label>
              <Slider
                value={[animationSpeed]}
                onValueChange={([value]) => setAnimationSpeed(value)}
                min={controls.animationSpeed.min}
                max={controls.animationSpeed.max}
                step={controls.animationSpeed.step}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showParticles"
                checked={showParticles}
                onCheckedChange={(checked) => setShowParticles(checked as boolean)}
              />
              <Label htmlFor="showParticles">Show Particles</Label>
            </div>

            {controls.gridDensity && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showGrid"
                  checked={showGrid}
                  onCheckedChange={(checked) => setShowGrid(checked as boolean)}
                />
                <Label htmlFor="showGrid">Show Grid</Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showPoles"
                checked={showPoles}
                onCheckedChange={(checked) => setShowPoles(checked as boolean)}
              />
              <Label htmlFor="showPoles">Show Poles</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Panel */}
      <Card className="fixed top-20 right-5 w-80 bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="includeParticles" defaultChecked />
              <Label htmlFor="includeParticles">Include Particles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="includePoles" defaultChecked />
              <Label htmlFor="includePoles">Include Poles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="includeBackground" defaultChecked />
              <Label htmlFor="includeBackground">Include Background</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export as SVG
            </Button>
            <Button variant="outline" className="w-full">
              Export as PNG
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="fixed bottom-5 right-5 w-80 bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">Instructions</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• Click to add magnetic poles</div>
            <div>• Drag to move poles</div>
            <div>• Adjust controls in the left panel</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 