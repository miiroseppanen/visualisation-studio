'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useTouchEvents } from '@/lib/hooks/useTouchEvents'
import { useMobileCanvas } from '@/lib/hooks/useMobileCanvas'
import { useMobileDetection } from '@/lib/hooks/useMobileDetection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Palette, Eraser, RotateCcw, Minus, Plus } from 'lucide-react'

interface DrawingPoint {
  x: number
  y: number
  color: string
  thickness: number
  pressure?: number
}

interface DrawingPath {
  points: DrawingPoint[]
  color: string
  thickness: number
  randomThickness: boolean
}

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#800080', '#FFA500'
]

export default function DrawingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isMobile } = useMobileDetection()
  const { getCanvasSize, getCanvasCoordinates } = useMobileCanvas(canvasRef)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null)
  const [paths, setPaths] = useState<DrawingPath[]>([])
  const [selectedColor, setSelectedColor] = useState('#FF6B6B')
  const [lineThickness, setLineThickness] = useState(5)
  const [randomThickness, setRandomThickness] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [eraserMode, setEraserMode] = useState(false)

  const startDrawing = useCallback((x: number, y: number) => {
    const coords = getCanvasCoordinates(x, y)
    
    const thickness = randomThickness 
      ? lineThickness * (0.5 + Math.random() * 0.5)
      : lineThickness

    const newPath: DrawingPath = {
      points: [{
        x: coords.x,
        y: coords.y,
        color: eraserMode ? '#FFFFFF' : selectedColor,
        thickness: thickness
      }],
      color: eraserMode ? '#FFFFFF' : selectedColor,
      thickness: lineThickness,
      randomThickness: randomThickness
    }

    setCurrentPath(newPath)
    setIsDrawing(true)
  }, [lineThickness, randomThickness, selectedColor, eraserMode, getCanvasCoordinates])

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing || !currentPath) return

    const coords = getCanvasCoordinates(x, y)
    const thickness = randomThickness 
      ? lineThickness * (0.5 + Math.random() * 0.5)
      : lineThickness

    const newPoint: DrawingPoint = {
      x: coords.x,
      y: coords.y,
      color: eraserMode ? '#FFFFFF' : selectedColor,
      thickness: thickness
    }

    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, newPoint]
    }

    setCurrentPath(updatedPath)
    drawPath(updatedPath)
  }, [isDrawing, currentPath, lineThickness, randomThickness, selectedColor, eraserMode, getCanvasCoordinates])

  const stopDrawing = useCallback(() => {
    if (currentPath && currentPath.points.length > 0) {
      setPaths((prev: DrawingPath[]) => [...prev, currentPath])
    }
    setCurrentPath(null)
    setIsDrawing(false)
  }, [currentPath])

  useTouchEvents(canvasRef, {
    onTouchStart: (x: number, y: number) => startDrawing(x, y),
    onTouchMove: (x: number, y: number) => draw(x, y),
    onTouchEnd: () => stopDrawing(),
  })

  const drawPath = useCallback((path: DrawingPath) => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = eraserMode ? 'destination-out' : 'source-over'

    if (path.points.length < 2) return

    for (let i = 1; i < path.points.length; i++) {
      const prevPoint = path.points[i - 1]
      const currentPoint = path.points[i]

      ctx.beginPath()
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(currentPoint.x, currentPoint.y)
      ctx.strokeStyle = currentPoint.color
      ctx.lineWidth = currentPoint.thickness
      ctx.stroke()
    }
  }, [eraserMode])

  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    
    // Set white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    
    // Redraw all paths
    paths.forEach((path: DrawingPath) => drawPath(path))
    
    // Draw current path
    if (currentPath) {
      drawPath(currentPath)
    }
  }, [paths, currentPath, drawPath])

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setPaths([])
    setCurrentPath(null)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return
    startDrawing(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return
    draw(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    if (isMobile) return
    stopDrawing()
  }

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  const canvasSize = getCanvasSize()

  return (
    <div className="drawing-page min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Piirrosvisu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="controls-grid flex flex-wrap gap-4 items-center">
              {/* Color Palette Toggle */}
              <Button
                variant={showColorPalette ? "default" : "outline"}
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Värit
              </Button>

              {/* Eraser Mode */}
              <Button
                variant={eraserMode ? "default" : "outline"}
                onClick={() => setEraserMode(!eraserMode)}
                className="flex items-center gap-2"
              >
                <Eraser className="w-4 h-4" />
                Pyyhekumi
              </Button>

              {/* Line Thickness */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Paksuus:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLineThickness(Math.max(1, lineThickness - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm">{lineThickness}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLineThickness(Math.min(50, lineThickness + 1))}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Random Thickness */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="random-thickness"
                  checked={randomThickness}
                  onCheckedChange={setRandomThickness}
                />
                <Label htmlFor="random-thickness" className="text-sm">
                  Satunnainen paksuus
                </Label>
              </div>

              {/* Clear Canvas */}
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Tyhjennä
              </Button>
            </div>

            {/* Color Palette */}
            {showColorPalette && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm mb-2 block">Valitse väri:</Label>
                <div className="color-grid grid grid-cols-10 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Line Thickness Slider */}
            <div className="mt-4 full-width">
              <Label className="text-sm mb-2 block">Viivan paksuus: {lineThickness}px</Label>
              <Slider
                value={[lineThickness]}
                onValueChange={(value) => setLineThickness(value[0])}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Instructions */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Ohjeet:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>{isMobile ? 'Kosketa ja vedä piirtääksesi' : 'Klikkaa ja vedä piirtääksesi'}</li>
                <li>Valitse väri paletista</li>
                <li>Säädä viivan paksuutta liukusäätimellä</li>
                <li>Kytke päälle satunnainen paksuus vaihtelevaa viivaa varten</li>
                <li>Käytä pyyhekumia virheitä korjatessa</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}