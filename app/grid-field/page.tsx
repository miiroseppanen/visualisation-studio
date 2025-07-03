'use client'

import React, { useEffect } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationNav from '@/components/VisualizationNav'
import ControlsPanel from '@/components/ControlsPanel'
import GridSettings from '@/components/grid-field/GridSettings'
import PoleControls from '@/components/grid-field/PoleControls'
import AnimationControls from '@/components/grid-field/AnimationControls'
import { useGridField } from '@/lib/hooks/useGridField'
import { CanvasRenderer, generateSVGExport, downloadSVG } from '@/lib/canvas-renderer'
import { calculateFieldAt, isPoleClicked, generatePoleId, generatePoleName } from '@/lib/physics'
import type { GridLine } from '@/lib/types'
import { POLE_CLICK_RADIUS, ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, FRAME_TIME } from '@/lib/constants'

export default function GridFieldPage() {
  const {
    canvasRef,
    animationRef,
    gridLines,
    setGridLines,
    poles,
    setPoles,
    gridSettings,
    animationSettings,
    directionSettings,
    polaritySettings,
    zoomSettings,
    isDragging,
    setIsDragging,
    draggedPoleId,
    setDraggedPoleId,
    panelState,
    updateGridSettings,
    updateAnimationSettings,
    updateDirectionSettings,
    updatePolaritySettings,
    updateZoomSettings,
    updatePanelState,
    resetAllSettings
  } = useGridField()

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating) return

    const animate = () => {
      updateAnimationSettings({ time: animationSettings.time + animationSettings.windSpeed * FRAME_TIME })
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationSettings.isAnimating, animationSettings.windSpeed, animationSettings.time, updateAnimationSettings])

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new CanvasRenderer(canvas)
    
    const resizeCanvas = () => {
      renderer.setupCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Generate grid lines
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new CanvasRenderer(canvas)
    const { width, height } = renderer.getDimensions()

    // Apply zoom to spacing and line length
    const gridSpacing = gridSettings.spacing * zoomSettings.level
    const lineLength = gridSettings.lineLength * zoomSettings.level

    const newLines: GridLine[] = []
    const gridPoints: { x: number; y: number }[] = []

    // Generate grid points
    for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
      for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
        gridPoints.push({ x, y })
      }
    }

    // Calculate field lines for each grid point
    gridPoints.forEach(point => {
      // Sample field at multiple points for smooth curves
      const startField = calculateFieldAt(point.x, point.y, poles, directionSettings, polaritySettings, animationSettings.time, animationSettings.windStrength)
      const midX = point.x + Math.cos(startField.angle) * lineLength * 0.5
      const midY = point.y + Math.sin(startField.angle) * lineLength * 0.5
      const midField = calculateFieldAt(midX, midY, poles, directionSettings, polaritySettings, animationSettings.time, animationSettings.windStrength)
      
      const endX = point.x + Math.cos(startField.angle) * lineLength
      const endY = point.y + Math.sin(startField.angle) * lineLength
      const endField = calculateFieldAt(endX, endY, poles, directionSettings, polaritySettings, animationSettings.time, animationSettings.windStrength)

      // Calculate control points for Bezier curve
      const stiffness = gridSettings.curveStiffness
      const controlDistance = lineLength * 0.3 * stiffness

      const controlX1 = point.x + Math.cos(startField.angle) * controlDistance
      const controlY1 = point.y + Math.sin(startField.angle) * controlDistance
      const controlX2 = endX - Math.cos(endField.angle) * controlDistance
      const controlY2 = endY - Math.sin(endField.angle) * controlDistance

      newLines.push({
        x: point.x,
        y: point.y,
        angle: startField.angle,
        length: lineLength,
        startX: point.x,
        startY: point.y,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        endX,
        endY
      })
    })

    setGridLines(newLines)
  }, [poles, animationSettings.time, animationSettings.windStrength, directionSettings, polaritySettings, gridSettings, zoomSettings])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new CanvasRenderer(canvas)
    renderer.clear()
    renderer.drawGridLines(gridLines)
    renderer.drawPoles(poles, zoomSettings.level, gridSettings.showPoles)
  }, [gridLines, poles, gridSettings.showPoles, zoomSettings.level])

  // Mouse event handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new CanvasRenderer(canvas)
    const { x, y } = renderer.getCanvasCoordinates(e.clientX, e.clientY)

    // Check if clicking on an existing pole
    const clickedPole = poles.find(pole => isPoleClicked(x, y, pole, POLE_CLICK_RADIUS))

    if (clickedPole) {
      setDraggedPoleId(clickedPole.id)
      setIsDragging(true)
    } else {
      // Create new pole at click location
      const newPole = {
        id: generatePoleId(),
        name: generatePoleName(poles.length),
        x,
        y,
        strength: 25,
        isPositive: Math.random() > 0.5
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

    const renderer = new CanvasRenderer(canvas)
    const { x, y } = renderer.getCanvasCoordinates(e.clientX, e.clientY)

    setPoles(poles.map(pole => 
      pole.id === draggedPoleId ? { ...pole, x, y } : pole
    ))
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedPoleId(null)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    const deltaY = e.deltaY
    const zoomChange = -deltaY * ZOOM_SENSITIVITY
    
    const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomSettings.level + zoomChange))
    updateZoomSettings({ level: newZoom })
  }

  const exportSVG = () => {
    const svgContent = generateSVGExport(gridLines, poles, gridSettings.showPoles)
    downloadSVG(svgContent)
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <VisualizationNav 
        actionButtons={
          <>
            <Button variant="ghost" size="sm" onClick={resetAllSettings}>
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
            onWheel={handleWheel}
          />
          <div className="absolute top-4 left-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Mode: {polaritySettings.attractToPoles ? 'Magnetic' : 'Electric'} | 
            Poles: {poles.length} | 
            Zoom: {Math.round(zoomSettings.level * 100)}%
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Click to add pole, drag to move • Wheel to zoom • Toggle individual pole polarity in controls
          </div>
        </div>

        {/* Floating Controls Panel */}
        <ControlsPanel title="Grid Field Controls">
          <div className="space-y-8">
            <GridSettings
              gridSettings={gridSettings}
              zoomSettings={zoomSettings}
              expanded={panelState.gridSettingsExpanded}
              onToggleExpanded={() => updatePanelState({ gridSettingsExpanded: !panelState.gridSettingsExpanded })}
              onUpdateGrid={updateGridSettings}
              onUpdateZoom={updateZoomSettings}
            />

            <PoleControls
              poles={poles}
              polaritySettings={polaritySettings}
              showPoles={gridSettings.showPoles}
              expanded={panelState.polesExpanded}
              onToggleExpanded={() => updatePanelState({ polesExpanded: !panelState.polesExpanded })}
              onSetPoles={setPoles}
              onUpdatePolarity={updatePolaritySettings}
              onToggleShowPoles={(show) => updateGridSettings({ showPoles: show })}
            />

            <AnimationControls
              animationSettings={animationSettings}
              expanded={panelState.animationExpanded}
              onToggleExpanded={() => updatePanelState({ animationExpanded: !panelState.animationExpanded })}
              onUpdateAnimation={updateAnimationSettings}
            />
          </div>
        </ControlsPanel>
      </div>
    </div>
  )
}