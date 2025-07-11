'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/ui/ThemeProvider'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import MathematicalLinesSettings from '@/components/mathematical-lines/MathematicalLinesSettings'
import { registerAnimationFrame, unregisterAnimationFrame } from '@/lib/utils'
import dynamic from 'next/dynamic'

interface MathematicalLine {
  x1: number
  y1: number
  x2: number
  y2: number
  life: number
  maxLife: number
  type: 'harmonic' | 'fractal' | 'spiral'
}

interface MathematicalSettings {
  lineCount: number
  lineLength: number
  fadeSpeed: number
  generationFrequency: number
  harmonicIntensity: number
  fractalIntensity: number
  spiralIntensity: number
  mouseInfluence: number
  colorMode: 'theme' | 'rainbow' | 'monochrome'
  lineWidth: number
  isAnimating: boolean
}

const defaultSettings: MathematicalSettings = {
  lineCount: 40,
  lineLength: 60,
  fadeSpeed: 0.008,
  generationFrequency: 4,
  harmonicIntensity: 1.0,
  fractalIntensity: 1.0,
  spiralIntensity: 1.0,
  mouseInfluence: 0.3,
  colorMode: 'theme',
  lineWidth: 0.8,
  isAnimating: true
}

function MathematicalLinesPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [settings, setSettings] = useState<MathematicalSettings>(defaultSettings)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const touchPosRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const linesRef = useRef<MathematicalLine[]>([])

  // Mathematical functions
  const harmonicFunction = useCallback((x: number, y: number, t: number, canvas: HTMLCanvasElement) => {
    const scale = 0.01
    const xScaled = (x - canvas.width / 2) * scale
    const yScaled = (y - canvas.height / 2) * scale
    
    const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
    const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
    const minDistance = Math.min(mouseDistance, touchDistance)
    
    const harmonic = Math.sin(xScaled + t * 0.3) * Math.cos(yScaled + t * 0.2) * 
                    Math.sin(Math.sqrt(xScaled * xScaled + yScaled * yScaled) + t * 0.1)
    
    const interaction = Math.sin(minDistance * 0.015 - t * 1.5) * Math.exp(-minDistance * 0.001) * settings.mouseInfluence
    
    return harmonic * settings.harmonicIntensity + interaction
  }, [settings.harmonicIntensity, settings.mouseInfluence])

  const fractalFunction = useCallback((x: number, y: number, t: number, canvas: HTMLCanvasElement) => {
    const scale = 0.008
    const xScaled = (x - canvas.width / 2) * scale
    const yScaled = (y - canvas.height / 2) * scale
    
    const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
    const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
    const minDistance = Math.min(mouseDistance, touchDistance)
    
    const fractal = Math.sin(xScaled * 2 + t * 0.4) * Math.cos(yScaled * 2 + t * 0.3) * 
                   Math.sin(xScaled * yScaled + t * 0.2)
    
    const interaction = Math.cos(minDistance * 0.012 - t * 1.2) * Math.exp(-minDistance * 0.0008) * settings.mouseInfluence
    
    return fractal * settings.fractalIntensity + interaction
  }, [settings.fractalIntensity, settings.mouseInfluence])

  const spiralFunction = useCallback((x: number, y: number, t: number, canvas: HTMLCanvasElement) => {
    const scale = 0.012
    const xScaled = (x - canvas.width / 2) * scale
    const yScaled = (y - canvas.height / 2) * scale
    
    const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
    const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
    const minDistance = Math.min(mouseDistance, touchDistance)
    
    const angle = Math.atan2(yScaled, xScaled)
    const radius = Math.sqrt(xScaled * xScaled + yScaled * yScaled)
    
    const spiral = Math.sin(angle * 3 + radius * 2 + t * 0.3) * Math.cos(radius + t * 0.2)
    
    const interaction = Math.sin(minDistance * 0.008 - t * 2) * Math.exp(-minDistance * 0.0012) * settings.mouseInfluence
    
    return spiral * settings.spiralIntensity + interaction
  }, [settings.spiralIntensity, settings.mouseInfluence])

  const createLine = useCallback((x: number, y: number, type: 'harmonic' | 'fractal' | 'spiral', canvas: HTMLCanvasElement) => {
    const angle = Math.random() * Math.PI * 2
    const length = settings.lineLength + Math.random() * 40
    
    const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
    const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
    const minDistance = Math.min(mouseDistance, touchDistance)
    
    const influence = Math.exp(-minDistance * 0.001) * settings.mouseInfluence
    
    linesRef.current.push({
      x1: x,
      y1: y,
      x2: x + Math.cos(angle) * length * (1 + influence),
      y2: y + Math.sin(angle) * length * (1 + influence),
      life: 1,
      maxLife: 0.5 + Math.random() * 0.5,
      type
    })
  }, [settings.lineLength, settings.mouseInfluence])

  const getCurrentTheme = useCallback(() => {
    if (theme === 'dark') return 'dark'
    if (theme === 'light') return 'light'
    if (theme === 'pastel') return 'pastel'
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [theme])

  const getLineColor = useCallback((line: MathematicalLine, currentTheme: string) => {
    if (settings.colorMode === 'rainbow') {
      const colors = ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#96CEB4', '#FFEAA7', '#DDA0DD']
      const colorIndex = (line.type === 'harmonic' ? 0 : line.type === 'fractal' ? 1 : 2) + 
                       (frameCountRef.current % 3) * 2
      return colors[colorIndex % colors.length]
    } else if (settings.colorMode === 'monochrome') {
      return currentTheme === 'dark' ? '#ffffff' : '#000000'
    } else {
      // Theme mode
      if (currentTheme === 'pastel') {
        const colors = ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#96CEB4', '#FFEAA7', '#DDA0DD']
        const colorIndex = (line.type === 'harmonic' ? 0 : line.type === 'fractal' ? 1 : 2) + 
                         (frameCountRef.current % 3) * 2
        return colors[colorIndex % colors.length]
      } else if (currentTheme === 'dark') {
        return '#ffffff'
      } else {
        return '#000000'
      }
    }
  }, [settings.colorMode])

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      ctx.scale(dpr, dpr)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeCanvas, 100)
    })

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      touchPosRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      touchPosRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // Initialize lines
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    linesRef.current = []
    for (let i = 0; i < settings.lineCount; i++) {
      createLine(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        ['harmonic', 'fractal', 'spiral'][Math.floor(Math.random() * 3)] as any,
        canvas
      )
    }
  }, [settings.lineCount, createLine])

  // Animation loop
  useEffect(() => {
    if (!settings.isAnimating) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const animate = (currentTime: number) => {
      if (currentTime - lastTimeRef.current < 33) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      time += Math.min(deltaTime * 0.001, 0.033)
      frameCountRef.current++
      
      const currentTheme = getCurrentTheme()

      if (!ctx || !canvas) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Clear canvas
      let bgColor: string
      if (currentTheme === 'dark') {
        bgColor = '#0a0a0a'
      } else if (currentTheme === 'pastel') {
        bgColor = '#e8f4f8'
      } else {
        bgColor = '#ffffff'
      }
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw lines
      for (let i = linesRef.current.length - 1; i >= 0; i--) {
        const line = linesRef.current[i]
        line.life -= settings.fadeSpeed

        if (line.life <= 0) {
          linesRef.current.splice(i, 1)
          continue
        }

        const alpha = line.life / line.maxLife
        const strokeColor = getLineColor(line, currentTheme)
        
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = settings.lineWidth
        ctx.globalAlpha = alpha * 0.5

        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()

        ctx.shadowColor = strokeColor
        ctx.shadowBlur = 1
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Create new lines
      if (linesRef.current.length < settings.lineCount && frameCountRef.current % settings.generationFrequency === 0) {
        for (let i = 0; i < 2; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          
          const harmonic = harmonicFunction(x, y, time, canvas)
          const fractal = fractalFunction(x, y, time, canvas)
          const spiral = spiralFunction(x, y, time, canvas)
          
          const maxValue = Math.max(Math.abs(harmonic), Math.abs(fractal), Math.abs(spiral))
          
          if (maxValue > 0.4) {
            const types: Array<'harmonic' | 'fractal' | 'spiral'> = ['harmonic', 'fractal', 'spiral']
            const type = types[Math.floor(Math.random() * 3)]
            createLine(x, y, type, canvas)
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate(performance.now())

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        unregisterAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [settings, harmonicFunction, fractalFunction, spiralFunction, getCurrentTheme, getLineColor, createLine])

  const handleReset = () => {
    setSettings(defaultSettings)
    linesRef.current = []
  }

  const handleExportSVG = () => {
    // SVG export functionality could be implemented here
    console.log('Export SVG functionality')
  }

  const handleUpdateSettings = (updates: Partial<MathematicalSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  return (
    <VisualizationLayout
      onReset={handleReset}
      onExportSVG={handleExportSVG}
      settingsContent={
        <MathematicalLinesSettings
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      }
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
    </VisualizationLayout>
  )
}

const MathematicalLinesPageComponent = MathematicalLinesPage;
export default dynamic(() => Promise.resolve(MathematicalLinesPageComponent), { ssr: false }); 