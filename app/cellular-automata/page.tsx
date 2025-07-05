'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw, Grid, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import CellularAutomataRules from '@/components/cellular-automata/CellularAutomataRules'
import PatternControls from '@/components/cellular-automata/PatternControls'
import { AnimationControls } from '@/components/cellular-automata/AnimationControls'
import type { CellularAutomataAnimationSettings, CellularAutomataPanelState } from '@/lib/types'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'

interface Cell {
  x: number
  y: number
  alive: boolean
  age: number
  nextState: boolean
}

interface Rule {
  name: string
  birth: number[]
  survive: number[]
  description: string
}

export default function CellularAutomataPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()

  // Grid state
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gridSize, setGridSize] = useState(100)
  const [cellSize, setCellSize] = useState(6)
  const [generation, setGeneration] = useState(0)

  // Rules state
  const [currentRule, setCurrentRule] = useState<Rule>({
    name: "Conway's Game of Life",
    birth: [3],
    survive: [2, 3],
    description: "Classic cellular automaton rules"
  })

  // Display settings
  const [showGrid, setShowGrid] = useState(false)
  const [showAge, setShowAge] = useState(true)
  const [colorMode, setColorMode] = useState<'binary' | 'age' | 'neighbors'>('age')

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<CellularAutomataAnimationSettings>({
    isAnimating: false,
    speed: 1,
    cellSize: 6,
    time: 0
  })

  // Panel state
  const [panelState, setPanelState] = useState<CellularAutomataPanelState>({
    isOpen: true,
    rulesExpanded: true,
    patternExpanded: true,
    animationExpanded: true
  })

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  // Initialize grid
  const initializeGrid = () => {
    const newGrid: Cell[][] = []
    for (let y = 0; y < gridSize; y++) {
      newGrid[y] = []
      for (let x = 0; x < gridSize; x++) {
        newGrid[y][x] = {
          x,
          y,
          alive: false,
          age: 0,
          nextState: false
        }
      }
    }
    setGrid(newGrid)
    setGeneration(0)
  }

  // Initialize grid on mount
  useEffect(() => {
    if (!isClient) return
    initializeGrid()
  }, [isClient, gridSize])

  // Count live neighbors
  const countNeighbors = (x: number, y: number): number => {
    let count = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        
        const nx = (x + dx + gridSize) % gridSize
        const ny = (y + dy + gridSize) % gridSize
        
        if (grid[ny] && grid[ny][nx] && grid[ny][nx].alive) {
          count++
        }
      }
    }
    return count
  }

  // Apply rules to determine next state
  const applyRules = (cell: Cell): boolean => {
    const neighbors = countNeighbors(cell.x, cell.y)
    
    if (cell.alive) {
      return currentRule.survive.includes(neighbors)
    } else {
      return currentRule.birth.includes(neighbors)
    }
  }

  // Step simulation
  const stepSimulation = () => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          nextState: applyRules(cell)
        }))
      )
      
      return newGrid.map(row =>
        row.map(cell => ({
          ...cell,
          alive: cell.nextState,
          age: cell.nextState ? cell.age + 1 : 0
        }))
      )
    })
    
    setGeneration(prev => prev + 1)
  }

  // Animation loop
  useEffect(() => {
    if (!animationSettings.isAnimating || !isClient) return

    const interval = setInterval(() => {
      stepSimulation()
    }, 1000 / animationSettings.speed)

    return () => clearInterval(interval)
  }, [animationSettings.isAnimating, animationSettings.speed, currentRule, isClient])

  // Handle pause all animations
  useEffect(() => {
    const handlePauseAllAnimations = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }

    const handleBeforeUnload = () => {
      handlePauseAllAnimations()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePauseAllAnimations()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      handlePauseAllAnimations()
    }
  }, [])

  // Render loop
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Draw cells
    grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.alive) return

        let color: string
        switch (colorMode) {
          case 'binary':
            color = isDark ? '#ffffff' : '#000000'
            break
          case 'age':
            const ageHue = (cell.age * 20) % 360
            color = `hsl(${ageHue}, 70%, 50%)`
            break
          case 'neighbors':
            const neighbors = countNeighbors(cell.x, cell.y)
            const neighborHue = (neighbors * 40) % 360
            color = `hsl(${neighborHue}, 70%, 50%)`
            break
          default:
            color = isDark ? '#ffffff' : '#000000'
        }

        ctx.fillStyle = color
        ctx.fillRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize - 1,
          cellSize - 1
        )
      })
    })

    // Draw grid lines
    if (showGrid) {
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1

      for (let x = 0; x <= gridSize; x++) {
        ctx.beginPath()
        ctx.moveTo(x * cellSize, 0)
        ctx.lineTo(x * cellSize, gridSize * cellSize)
        ctx.stroke()
      }

      for (let y = 0; y <= gridSize; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * cellSize)
        ctx.lineTo(gridSize * cellSize, y * cellSize)
        ctx.stroke()
      }
    }

  }, [grid, showGrid, colorMode, cellSize, theme, isClient])

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / cellSize)
    const y = Math.floor((e.clientY - rect.top) / cellSize)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      setGrid(prevGrid => {
        const newGrid = [...prevGrid]
        newGrid[y][x] = {
          ...newGrid[y][x],
          alive: !newGrid[y][x].alive,
          age: newGrid[y][x].alive ? 0 : 1
        }
        return newGrid
      })
    }
  }

  // Add pattern
  const addPattern = (pattern: boolean[][], centerX: number, centerY: number) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row])
      
      pattern.forEach((patternRow, py) => {
        patternRow.forEach((alive, px) => {
          const x = (centerX + px - Math.floor(pattern[0].length / 2) + gridSize) % gridSize
          const y = (centerY + py - Math.floor(pattern.length / 2) + gridSize) % gridSize
          
          if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            newGrid[y][x] = {
              ...newGrid[y][x],
              alive,
              age: alive ? 1 : 0
            }
          }
        })
      })
      
      return newGrid
    })
  }

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${grid.flatMap(row => 
          row.filter(cell => cell.alive).map(cell => 
            `<rect x="${cell.x * cellSize}" y="${cell.y * cellSize}" width="${cellSize - 1}" height="${cellSize - 1}" fill="black"/>`
          )
        ).join('')}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cellular-automata.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setCurrentRule({
      name: "Conway's Game of Life",
      birth: [3],
      survive: [2, 3],
      description: "Classic cellular automaton rules"
    })
    setAnimationSettings({
      isAnimating: false,
      speed: 1,
      cellSize: 6,
      time: 0
    })
    setShowGrid(false)
    setShowAge(true)
    setColorMode('age')
    setCellSize(6)
    setGeneration(0)
    initializeGrid()
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading cellular automata visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Cellular Automata | 
          Grid: {gridSize}x{gridSize} | 
          Generation: {generation} | 
          Alive: {grid.flat().filter(cell => cell.alive).length} | 
          Rule: {currentRule.name}
        </>
      }
      helpText="Click to toggle cells • Watch patterns evolve • Try different rules"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <CellularAutomataRules
            currentRule={currentRule}
            showGrid={showGrid}
            showAge={showAge}
            colorMode={colorMode}
            cellSize={cellSize}
            expanded={panelState.rulesExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, rulesExpanded: !prev.rulesExpanded 
            }))}
            onSetCurrentRule={setCurrentRule}
            onSetShowGrid={setShowGrid}
            onSetShowAge={setShowAge}
            onSetColorMode={setColorMode}
            onSetCellSize={setCellSize}
          />

          <PatternControls
            onAddPattern={addPattern}
            onStepSimulation={stepSimulation}
            onClearGrid={initializeGrid}
            expanded={panelState.patternExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, patternExpanded: !prev.patternExpanded 
            }))}
          />

          <AnimationControls
            settings={animationSettings}
            onSettingsChange={(updates) => setAnimationSettings(prev => ({ ...prev, ...updates }))}
            onReset={resetToDefaults}
            expanded={panelState.animationExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, animationExpanded: !prev.animationExpanded 
            }))}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair dark:invert dark:hue-rotate-180"
        onClick={handleCanvasClick}
      />
    </VisualizationLayout>
  )
} 