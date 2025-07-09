'use client'

import React, { useEffect, useRef, useState } from 'react'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import GridSettings from '@/components/grid-field/GridSettings'
import PoleControls from '@/components/grid-field/PoleControls'
import AnimationControls from '@/components/grid-field/AnimationControls'
import { useGridField } from '@/lib/hooks/useGridField'
import { GridRenderer } from '@/lib/renderers/GridRenderer'
import { calculateFieldAt, isPoleClicked, generatePoleId, generatePoleName } from '@/lib/physics'
import type { GridLine } from '@/lib/types'
import { POLE_CLICK_RADIUS, ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, FRAME_TIME } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Grid generation functions
function generateRectangularGrid(width: number, height: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      points.push({ x, y })
    }
  }
  return points
}

function generateTriangularGrid(width: number, height: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const rowHeight = spacing * Math.sqrt(3) / 2
  
  for (let row = 0; row * rowHeight < height; row++) {
    const y = row * rowHeight + spacing / 2
    const xOffset = row % 2 === 0 ? 0 : spacing / 2
    
    for (let col = 0; col * spacing + xOffset < width; col++) {
      const x = col * spacing + xOffset
      points.push({ x, y })
    }
  }
  return points
}

function generateHexagonalGrid(width: number, height: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const hexRadius = spacing / 2
  const hexHeight = hexRadius * Math.sqrt(3)
  const hexWidth = spacing * 1.5 // Wider spacing for hexagonal pattern
  
  for (let row = 0; row * hexHeight < height; row++) {
    const y = row * hexHeight + hexRadius
    const xOffset = row % 2 === 0 ? 0 : hexWidth / 2
    
    for (let col = 0; col * hexWidth + xOffset < width; col++) {
      const x = col * hexWidth + xOffset
      points.push({ x, y })
    }
  }
  return points
}

function generateRadialGrid(width: number, height: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)
  
  // Radial lines
  const numRings = Math.floor(maxRadius / spacing)
  
  for (let ring = 1; ring <= numRings; ring++) {
    const radius = ring * spacing
    // Number of points increases with radius (circumference)
    const numPoints = Math.max(8, Math.floor(2 * Math.PI * radius / (spacing * 0.8)))
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * 2 * Math.PI
      const x = centerX + radius * Math.cos(theta)
      const y = centerY + radius * Math.sin(theta)
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        points.push({ x, y })
      }
    }
  }
  
  // Add center point
  points.push({ x: centerX, y: centerY })
  
  return points
}

function generateRandomGrid(width: number, height: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const numPoints = Math.floor((width * height) / (spacing * spacing * 2)) // Slightly fewer points for better spacing
  
  // Create a grid of potential positions and randomly select from them
  const potentialPositions: { x: number; y: number }[] = []
  const gridSize = spacing * 1.5 // Slightly larger than spacing to avoid clustering
  
  for (let x = gridSize / 2; x < width; x += gridSize) {
    for (let y = gridSize / 2; y < height; y += gridSize) {
      potentialPositions.push({ x, y })
    }
  }
  
  // Randomly select positions with some jitter
  for (let i = 0; i < Math.min(numPoints, potentialPositions.length); i++) {
    const randomIndex = Math.floor(Math.random() * potentialPositions.length)
    const basePos = potentialPositions.splice(randomIndex, 1)[0]
    
    // Add some random jitter within the grid cell
    const jitterX = (Math.random() - 0.5) * spacing * 0.8
    const jitterY = (Math.random() - 0.5) * spacing * 0.8
    
    points.push({
      x: Math.max(0, Math.min(width, basePos.x + jitterX)),
      y: Math.max(0, Math.min(height, basePos.y + jitterY))
    })
  }
  
  return points
}

function generateSpiralGrid(width: number, height: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)
  
  // Spiral parameters
  const spiralSpacing = spacing * 0.8
  const numTurns = Math.floor(maxRadius / spiralSpacing)
  const pointsPerTurn = 8
  
  for (let turn = 0; turn < numTurns; turn++) {
    const radius = turn * spiralSpacing
    
    for (let i = 0; i < pointsPerTurn; i++) {
      const angle = (i / pointsPerTurn) * 2 * Math.PI + turn * 0.3 // Add some rotation per turn
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        points.push({ x, y })
      }
    }
  }
  
  // Add center point
  points.push({ x: centerX, y: centerY })
  
  return points
}

function GridFieldPage() {
  const rendererRef = useRef<GridRenderer | null>(null)
  // Store random grid points in a ref so they persist
  const randomGridPointsRef = useRef<{ x: number; y: number }[] | null>(null)
  // Track the last used width, height, and spacing for random grid
  const [randomGridMeta, setRandomGridMeta] = useState<{ width: number; height: number; spacing: number } | null>(null)

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
      const frameId = requestAnimationFrame(animate)
      animationRef.current = frameId
      registerAnimationFrame(frameId)
    }

    const frameId = requestAnimationFrame(animate)
    animationRef.current = frameId
    registerAnimationFrame(frameId)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [animationSettings.isAnimating, animationSettings.windSpeed, animationSettings.time, updateAnimationSettings])

  // Listen for global pause event
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      updateAnimationSettings({ isAnimating: false })
    }

    window.addEventListener('pauseAllAnimations', handlePauseAllAnimations)
    
    return () => {
      window.removeEventListener('pauseAllAnimations', handlePauseAllAnimations)
    }
  }, [updateAnimationSettings])

  // Cleanup on unmount to prevent navigation issues
  useEffect(() => {
    return () => {
      // Stop animation when component unmounts
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      // Clear renderer to prevent memory leaks
      if (rendererRef.current) {
        rendererRef.current = null
      }
    }
  }, [])

  // Stop animation when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (navigation, tab switch, etc.) - pause animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          unregisterAnimationFrame(animationRef.current)
          animationRef.current = undefined
        }
      } else if (animationSettings.isAnimating && !animationRef.current) {
        // Page is visible again and should be animating - restart
        const animate = () => {
          updateAnimationSettings({ time: animationSettings.time + animationSettings.windSpeed * FRAME_TIME })
          const frameId = requestAnimationFrame(animate)
          animationRef.current = frameId
          registerAnimationFrame(frameId)
        }
        const frameId = requestAnimationFrame(animate)
        animationRef.current = frameId
        registerAnimationFrame(frameId)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [animationSettings.isAnimating, animationSettings.windSpeed, animationSettings.time, updateAnimationSettings])

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current
    
    if (!canvas) {
      return
    }

    const renderer = new GridRenderer(canvas)
    rendererRef.current = renderer
    
    const resizeCanvas = () => {
      renderer.setupCanvas()
    }

    resizeCanvas()
    
    // Use ResizeObserver for more reliable resize detection
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)
    
    // Also listen for window resize for viewport changes
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // Generate and persist random grid points only when needed
  useEffect(() => {
    if (!rendererRef.current || gridSettings.type !== 'random') return
    const { width, height } = rendererRef.current.getDimensions()
    const gridSpacing = gridSettings.spacing * zoomSettings.level
    // Only regenerate if meta changes
    if (
      !randomGridMeta ||
      randomGridMeta.width !== width ||
      randomGridMeta.height !== height ||
      randomGridMeta.spacing !== gridSpacing
    ) {
      randomGridPointsRef.current = generateRandomGrid(width, height, gridSpacing)
      setRandomGridMeta({ width, height, spacing: gridSpacing })
    }
  }, [gridSettings.type, gridSettings.spacing, zoomSettings.level, randomGridMeta])

  // Generate grid lines
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !rendererRef.current) return

    const { width, height } = rendererRef.current.getDimensions()

    // Apply zoom to spacing and line length
    const gridSpacing = gridSettings.spacing * zoomSettings.level
    const lineLength = gridSettings.lineLength * zoomSettings.level

    // Generate grid points based on type
    let gridPoints: { x: number; y: number }[] = []
    
    switch (gridSettings.type) {
      case 'rectangular':
        gridPoints = generateRectangularGrid(width, height, gridSpacing)
        break
      case 'triangular':
        gridPoints = generateTriangularGrid(width, height, gridSpacing)
        break
      case 'hexagonal':
        gridPoints = generateHexagonalGrid(width, height, gridSpacing)
        break
      case 'radial':
        gridPoints = generateRadialGrid(width, height, gridSpacing)
        break
      case 'random':
        // Use persisted random points
        if (!randomGridPointsRef.current) {
          randomGridPointsRef.current = generateRandomGrid(width, height, gridSpacing)
          setRandomGridMeta({ width, height, spacing: gridSpacing })
        }
        gridPoints = randomGridPointsRef.current
        break
      case 'spiral':
        gridPoints = generateSpiralGrid(width, height, gridSpacing)
        break
      default:
        gridPoints = generateRectangularGrid(width, height, gridSpacing)
    }

    const newLines: GridLine[] = []

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

  // Canvas drawing (continuous render loop)
  useEffect(() => {
    if (!animationSettings.isAnimating) return;
    let frameId: number;
    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (canvas && rendererRef.current) {
        rendererRef.current.render(
          { gridLines, poles, zoomLevel: zoomSettings.level },
          gridSettings
        );
      }
      frameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [animationSettings.isAnimating, gridLines, poles, gridSettings, zoomSettings.level]);

  // Wheel event handler (direct DOM listener to avoid passive event issues)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      const deltaY = e.deltaY
      const zoomChange = -deltaY * ZOOM_SENSITIVITY
      
      const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomSettings.level + zoomChange))
      updateZoomSettings({ level: newZoom })
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [zoomSettings.level, updateZoomSettings])

  // Mouse event handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !rendererRef.current) return

    const { x, y } = rendererRef.current.getCanvasCoordinates(e.clientX, e.clientY)

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
    if (!canvas || !rendererRef.current) return

    const { x, y } = rendererRef.current.getCanvasCoordinates(e.clientX, e.clientY)

    setPoles(poles.map(pole => 
      pole.id === draggedPoleId ? { ...pole, x, y } : pole
    ))
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedPoleId(null)
  }

  const exportSVG = () => {
    if (rendererRef.current) {
      const svg = rendererRef.current.exportSVG({ gridLines, poles }, gridSettings, { width: 800, height: 600, backgroundColor: '#ffffff' })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'grid-field.svg'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <VisualizationLayout
      onReset={resetAllSettings}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: {polaritySettings.attractToPoles ? 'Magnetic' : 'Electric'} | 
          Poles: {poles.length} | 
          Zoom: {Math.round(zoomSettings.level * 100)}%
        </>
      }
      helpText="Click to add pole, drag to move • Wheel to zoom • Toggle individual pole polarity in controls"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => updatePanelState({ isOpen: !panelState.isOpen })}
      settingsContent={
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
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair dark:invert dark:hue-rotate-180"
        style={{
          display: 'block'
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </VisualizationLayout>
  )
}

const GridFieldPageComponent = GridFieldPage;
export default dynamic(() => Promise.resolve(GridFieldPageComponent), { ssr: false });