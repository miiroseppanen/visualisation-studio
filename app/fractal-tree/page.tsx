'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import AnimationControls from '@/components/fractal-tree/AnimationControls'
import TreeSettings from '@/components/fractal-tree/TreeSettings'
import BranchSettings from '@/components/fractal-tree/BranchSettings'
import type { FractalTreeAnimationSettings, FractalTreePanelState } from '@/lib/types'
import { ZOOM_SENSITIVITY, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '@/lib/constants'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'

interface Branch {
  x: number
  y: number
  length: number
  angle: number
  thickness: number
  depth: number
  maxDepth: number
  children: Branch[]
  growthProgress: number
  color: string
}

export default function FractalTreePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const { theme } = useTheme()

  // Tree state
  const [tree, setTree] = useState<Branch | null>(null)
  const [isGrowing, setIsGrowing] = useState(false)

  // Settings state
  const [showLeaves, setShowLeaves] = useState(true)
  const [showBranches, setShowBranches] = useState(true)
  const [showGrowth, setShowGrowth] = useState(true)
  const [autoGrow, setAutoGrow] = useState(false)

  // Tree settings
  const [maxDepth, setMaxDepth] = useState(8)
  const [branchLength, setBranchLength] = useState(100)
  const [branchAngle, setBranchAngle] = useState(30)
  const [lengthRatio, setLengthRatio] = useState(0.7)
  const [angleVariation, setAngleVariation] = useState(10)
  const [thicknessRatio, setThicknessRatio] = useState(0.8)
  const [baseThickness, setBaseThickness] = useState(8)

  // Animation settings
  const [animationSettings, setAnimationSettings] = useState<FractalTreeAnimationSettings>({
    isAnimating: true,
    time: 0,
    speed: 1.0,
    growthSpeed: 0.02
  })

  // Panel state
  const [panelState, setPanelState] = useState<FractalTreePanelState>({
    isOpen: true,
    treeSettingsExpanded: true,
    branchSettingsExpanded: true,
    animationExpanded: false
  })

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Canvas setup and resize handling
  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isClient])

  // Generate fractal tree
  const generateTree = (depth: number = 0, x: number = 400, y: number = 600, angle: number = -90, length: number = branchLength, thickness: number = baseThickness): Branch => {
    if (depth >= maxDepth) {
      return {
        x,
        y,
        length: 0,
        angle,
        thickness: 0,
        depth,
        maxDepth,
        children: [],
        growthProgress: 0,
        color: '#10b981'
      }
    }

    const children: Branch[] = []
    const childLength = length * lengthRatio
    const childThickness = thickness * thicknessRatio

    // Left branch
    const leftAngle = angle + branchAngle + (Math.random() - 0.5) * angleVariation
    children.push(generateTree(depth + 1, x, y, leftAngle, childLength, childThickness))

    // Right branch
    const rightAngle = angle - branchAngle + (Math.random() - 0.5) * angleVariation
    children.push(generateTree(depth + 1, x, y, rightAngle, childLength, childThickness))

    // Random third branch (sometimes)
    if (depth < maxDepth - 2 && Math.random() > 0.7) {
      const centerAngle = angle + (Math.random() - 0.5) * 20
      children.push(generateTree(depth + 1, x, y, centerAngle, childLength * 0.8, childThickness * 0.8))
    }

    return {
      x,
      y,
      length,
      angle,
      thickness,
      depth,
      maxDepth,
      children,
      growthProgress: 0,
      color: depth === 0 ? '#8b5a2b' : depth < 3 ? '#a0522d' : '#228b22'
    }
  }

  // Initialize tree
  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    const newTree = generateTree(0, width / 2, height - 50, -90, branchLength, baseThickness)
    setTree(newTree)
  }, [maxDepth, branchLength, branchAngle, lengthRatio, angleVariation, thicknessRatio, baseThickness, isClient])

  // Growth animation
  useEffect(() => {
    if (!animationSettings.isAnimating || !isGrowing || !isClient) return

    const animate = () => {
      setTree(prevTree => {
        if (!prevTree) return prevTree

        const growBranch = (branch: Branch): Branch => {
          const newGrowthProgress = Math.min(1, branch.growthProgress + animationSettings.growthSpeed)
          
          const newChildren = branch.children.map(child => growBranch(child))
          
          return {
            ...branch,
            growthProgress: newGrowthProgress,
            children: newChildren
          }
        }

        const newTree = growBranch(prevTree)
        
        // Check if growth is complete
        const isComplete = newTree.growthProgress >= 1 && newTree.children.every(child => child.growthProgress >= 1)
        if (isComplete && autoGrow) {
          // Start new growth cycle
          setTimeout(() => {
            setTree(prev => {
              if (!prev) return prev
              const resetGrowth = (branch: Branch): Branch => ({
                ...branch,
                growthProgress: 0,
                children: branch.children.map(resetGrowth)
              })
              return resetGrowth(prev)
            })
          }, 1000)
        }

        return newTree
      })

      setAnimationSettings(prev => ({ ...prev, time: prev.time + animationSettings.speed * 0.02 }))
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
      }
    }
  }, [animationSettings.isAnimating, animationSettings.speed, animationSettings.growthSpeed, isGrowing, autoGrow, isClient])

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

  // Render tree
  const renderBranch = (ctx: CanvasRenderingContext2D, branch: Branch, parentX: number, parentY: number) => {
    if (!showBranches || branch.growthProgress <= 0) return

    const currentLength = branch.length * branch.growthProgress
    const endX = parentX + Math.cos(branch.angle * Math.PI / 180) * currentLength
    const endY = parentY + Math.sin(branch.angle * Math.PI / 180) * currentLength

    // Draw branch
    ctx.strokeStyle = branch.color
    ctx.lineWidth = branch.thickness * branch.growthProgress
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(parentX, parentY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Draw leaves at the end if it's a terminal branch
    if (showLeaves && branch.children.length === 0 && branch.growthProgress > 0.8) {
      const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const leafColor = isDark ? '#90ee90' : '#228b22'
      
      ctx.fillStyle = leafColor
      ctx.beginPath()
      ctx.arc(endX, endY, 3, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Recursively render children
    branch.children.forEach(child => {
      if (branch.growthProgress > 0.3) {
        renderBranch(ctx, child, endX, endY)
      }
    })
  }

  // Render loop
  useEffect(() => {
    if (!isClient || !canvasRef.current || !tree) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let renderFrameId: number | null = null

    const render = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      // Render tree
      renderBranch(ctx, tree, tree.x, tree.y)
    }

    // Initial render
    render()

    // Set up animation loop for continuous rendering
    if (animationSettings.isAnimating) {
      const animate = () => {
        render()
        renderFrameId = requestAnimationFrame(animate)
      }
      renderFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (renderFrameId) {
        cancelAnimationFrame(renderFrameId)
      }
    }
  }, [tree, showBranches, showLeaves, theme, isClient, animationSettings.isAnimating])

  // Wheel event handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isClient) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      const deltaY = e.deltaY
      const zoomChange = -deltaY * ZOOM_SENSITIVITY
      
      const newZoom = Math.max(MIN_ZOOM_LEVEL, Math.min(MAX_ZOOM_LEVEL, zoomLevel + zoomChange))
      setZoomLevel(newZoom)
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [isClient, zoomLevel])

  // Start/stop growth
  const toggleGrowth = () => {
    setIsGrowing(!isGrowing)
  }

  // Export as SVG
  const exportSVG = () => {
    const canvas = canvasRef.current
    if (!canvas || !tree) return

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    const generateSVG = (branch: Branch, parentX: number, parentY: number): string => {
      if (branch.growthProgress <= 0) return ''

      const currentLength = branch.length * branch.growthProgress
      const endX = parentX + Math.cos(branch.angle * Math.PI / 180) * currentLength
      const endY = parentY + Math.sin(branch.angle * Math.PI / 180) * currentLength

      let svg = `<line x1="${parentX}" y1="${parentY}" x2="${endX}" y2="${endY}" stroke="${branch.color}" stroke-width="${branch.thickness * branch.growthProgress}" stroke-linecap="round"/>`

      branch.children.forEach(child => {
        if (branch.growthProgress > 0.3) {
          svg += generateSVG(child, endX, endY)
        }
      })

      return svg
    }

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${generateSVG(tree, tree.x, tree.y)}
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fractal-tree.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setMaxDepth(8)
    setBranchLength(100)
    setBranchAngle(30)
    setLengthRatio(0.7)
    setAngleVariation(10)
    setThicknessRatio(0.8)
    setBaseThickness(8)
    setAnimationSettings({
      isAnimating: true,
      time: 0,
      speed: 1.0,
      growthSpeed: 0.02
    })
    setShowLeaves(true)
    setShowBranches(true)
    setShowGrowth(true)
    setAutoGrow(false)
    setIsGrowing(false)
  }

  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading fractal tree visualizer...</div>
      </div>
    )
  }

  return (
    <VisualizationLayout
      onReset={resetToDefaults}
      onExportSVG={exportSVG}
      statusContent={
        <>
          Mode: Fractal Tree | 
          Depth: {maxDepth} | 
          Branches: {tree ? Math.pow(2, maxDepth) - 1 : 0} | 
          Zoom: {Math.round(zoomLevel * 100)}%
        </>
      }
      helpText="Watch the tree grow! • Use controls to adjust branching patterns • Toggle growth animation"
      panelOpen={panelState.isOpen}
      onPanelToggle={() => setPanelState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
      settingsContent={
        <div className="space-y-8">
          <TreeSettings
            maxDepth={maxDepth}
            branchLength={branchLength}
            showLeaves={showLeaves}
            showBranches={showBranches}
            showGrowth={showGrowth}
            autoGrow={autoGrow}
            isGrowing={isGrowing}
            expanded={panelState.treeSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, treeSettingsExpanded: !prev.treeSettingsExpanded 
            }))}
            onSetMaxDepth={setMaxDepth}
            onSetBranchLength={setBranchLength}
            onSetShowLeaves={setShowLeaves}
            onSetShowBranches={setShowBranches}
            onSetShowGrowth={setShowGrowth}
            onSetAutoGrow={setAutoGrow}
            onToggleGrowth={toggleGrowth}
          />

          <BranchSettings
            branchAngle={branchAngle}
            lengthRatio={lengthRatio}
            angleVariation={angleVariation}
            thicknessRatio={thicknessRatio}
            baseThickness={baseThickness}
            expanded={panelState.branchSettingsExpanded}
            onToggleExpanded={() => setPanelState(prev => ({ 
              ...prev, branchSettingsExpanded: !prev.branchSettingsExpanded 
            }))}
            onSetBranchAngle={setBranchAngle}
            onSetLengthRatio={setLengthRatio}
            onSetAngleVariation={setAngleVariation}
            onSetThicknessRatio={setThicknessRatio}
            onSetBaseThickness={setBaseThickness}
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
      />
    </VisualizationLayout>
  )
} 