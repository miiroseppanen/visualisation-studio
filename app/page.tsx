'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Grid3X3, Magnet, Wind, Mountain, Radio, Sparkles, Download, Play, Lightbulb, Waves, Users, Brain, Grid, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/layout/AppLayout'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useTranslation } from 'react-i18next'

// Interactive Mathematical Line-Based Background Animation
const MathematicalBackground = ({ opacity = 1 }: { opacity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 })
  const [touchPos, setTouchPos] = React.useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size - simplified for mobile compatibility
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      
      // Simplified DPR scaling for better mobile performance
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
      // Delay resize to allow orientation change to complete
      setTimeout(resizeCanvas, 100)
    })

    // Mouse and touch handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      setTouchPos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      })
    }

    const handleTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      setTouchPos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      })
    }

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })

    // Animation variables
    let time = 0
    const lines: Array<{
      x1: number
      y1: number
      x2: number
      y2: number
      life: number
      maxLife: number
      type: 'harmonic' | 'fractal' | 'spiral'
    }> = []

    // Mathematical line functions
    const harmonicFunction = (x: number, y: number, t: number) => {
      const scale = 0.01
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Harmonic oscillator with mouse interaction
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPos.x) ** 2 + (y - touchPos.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const harmonic = Math.sin(xScaled + t * 0.3) * Math.cos(yScaled + t * 0.2) * 
                      Math.sin(Math.sqrt(xScaled * xScaled + yScaled * yScaled) + t * 0.1)
      
      const interaction = Math.sin(minDistance * 0.02 - t * 2) * Math.exp(-minDistance * 0.001) * 0.8
      
      return harmonic + interaction
    }

    const fractalFunction = (x: number, y: number, t: number) => {
      const scale = 0.008
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Fractal-like pattern with mouse interaction
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPos.x) ** 2 + (y - touchPos.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const fractal = Math.sin(xScaled * 2 + t * 0.4) * Math.cos(yScaled * 2 + t * 0.3) * 
                     Math.sin(xScaled * yScaled + t * 0.2)
      
      const interaction = Math.cos(minDistance * 0.015 - t * 1.5) * Math.exp(-minDistance * 0.0008) * 0.6
      
      return fractal + interaction
    }

    const spiralFunction = (x: number, y: number, t: number) => {
      const scale = 0.012
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Spiral pattern with mouse interaction
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPos.x) ** 2 + (y - touchPos.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const angle = Math.atan2(yScaled, xScaled)
      const radius = Math.sqrt(xScaled * xScaled + yScaled * yScaled)
      
      const spiral = Math.sin(angle * 3 + radius * 2 + t * 0.3) * Math.cos(radius + t * 0.2)
      
      const interaction = Math.sin(minDistance * 0.01 - t * 2.5) * Math.exp(-minDistance * 0.0012) * 0.7
      
      return spiral + interaction
    }

    // Get current theme
    const getCurrentTheme = () => {
      if (theme === 'dark') return 'dark'
      if (theme === 'light') return 'light'
      if (!window.matchMedia) return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Create mathematical lines - more varied positioning
    const createLine = (x: number, y: number, type: 'harmonic' | 'fractal' | 'spiral') => {
      const angle = Math.random() * Math.PI * 2
      const length = 40 + Math.random() * 80
      
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPos.x) ** 2 + (y - touchPos.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const influence = Math.exp(-minDistance * 0.001) * 0.3
      
      lines.push({
        x1: x,
        y1: y,
        x2: x + Math.cos(angle) * length * (1 + influence),
        y2: y + Math.sin(angle) * length * (1 + influence),
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        type
      })
    }

    // Initialize lines
    for (let i = 0; i < 60; i++) {
      createLine(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        ['harmonic', 'fractal', 'spiral'][Math.floor(Math.random() * 3)] as any
      )
    }

        // Animation loop
    const animate = () => {
      time += 0.016
      const currentTheme = getCurrentTheme()

      // Safety check for canvas context
      if (!ctx || !canvas) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Clear canvas with fade effect
      const fadeOpacity = 0.1
      ctx.fillStyle = currentTheme === 'dark' 
        ? `rgba(0, 0, 0, ${fadeOpacity})` 
        : `rgba(255, 255, 255, ${fadeOpacity})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create new lines - more spread out across the viewport
      const mouseDistance = Math.sqrt((canvas.width / 2 - mousePos.x) ** 2 + (canvas.height / 2 - mousePos.y) ** 2)
      const touchDistance = Math.sqrt((canvas.width / 2 - touchPos.x) ** 2 + (canvas.height / 2 - touchPos.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const baseDensity = 0.25
      const interactionDensity = Math.exp(-minDistance * 0.0005) * 0.4
      const totalDensity = baseDensity + interactionDensity
      
      if (Math.random() < totalDensity) {
        const type = ['harmonic', 'fractal', 'spiral'][Math.floor(Math.random() * 3)] as any
        
        // Create lines more spread out - not just near interaction
        let x, y
        if (Math.random() < 0.3) {
          // 30% chance to create near interaction
          x = (mousePos.x + touchPos.x) / 2 + (Math.random() - 0.5) * 200
          y = (mousePos.y + touchPos.y) / 2 + (Math.random() - 0.5) * 200
        } else {
          // 70% chance to create randomly across viewport
          x = Math.random() * canvas.width
          y = Math.random() * canvas.height
        }
        
        createLine(
          Math.max(0, Math.min(canvas.width, x)),
          Math.max(0, Math.min(canvas.height, y)),
          type
        )
      }

      // Update and draw lines
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]
        
        // Update line positions based on mathematical functions - more spread out
        if (line.type === 'harmonic') {
          const func1 = harmonicFunction(line.x1, line.y1, time)
          const func2 = harmonicFunction(line.x2, line.y2, time)
          line.x1 += Math.cos(func1 * Math.PI) * 0.2
          line.y1 += Math.sin(func1 * Math.PI) * 0.2
          line.x2 += Math.cos(func2 * Math.PI) * 0.2
          line.y2 += Math.sin(func2 * Math.PI) * 0.2
        } else if (line.type === 'fractal') {
          const func1 = fractalFunction(line.x1, line.y1, time)
          const func2 = fractalFunction(line.x2, line.y2, time)
          line.x1 += Math.sin(func1 * Math.PI * 2) * 0.15
          line.y1 += Math.cos(func1 * Math.PI * 2) * 0.15
          line.x2 += Math.sin(func2 * Math.PI * 2) * 0.15
          line.y2 += Math.cos(func2 * Math.PI * 2) * 0.15
        } else { // spiral
          const func1 = spiralFunction(line.x1, line.y1, time)
          const func2 = spiralFunction(line.x2, line.y2, time)
          line.x1 += Math.cos(func1 * Math.PI) * 0.25
          line.y1 += Math.sin(func1 * Math.PI) * 0.25
          line.x2 += Math.cos(func2 * Math.PI) * 0.25
          line.y2 += Math.sin(func2 * Math.PI) * 0.25
        }
        
        // Add interaction attraction to lines - more subtle
        const mouseDistance = Math.sqrt((line.x1 - mousePos.x) ** 2 + (line.y1 - mousePos.y) ** 2)
        const touchDistance = Math.sqrt((line.x1 - touchPos.x) ** 2 + (line.y1 - touchPos.y) ** 2)
        const minDistance = Math.min(mouseDistance, touchDistance)
        
        if (minDistance < 300) {
          const attraction = (300 - minDistance) / 300 * 0.05
          const dx = (mousePos.x + touchPos.x) / 2 - line.x1
          const dy = (mousePos.y + touchPos.y) / 2 - line.y1
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > 0) {
            line.x1 += (dx / distance) * attraction
            line.y1 += (dy / distance) * attraction
            line.x2 += (dx / distance) * attraction * 0.3
            line.y2 += (dy / distance) * attraction * 0.3
          }
          
          // Add line life extension near interaction
          if (minDistance < 100) {
            line.life += 0.002
          }
        }
        
        line.life -= 0.006

        // Remove dead lines or lines outside bounds
        if (line.life <= 0 || 
            line.x1 < -100 || line.x1 > canvas.width + 100 ||
            line.y1 < -100 || line.y1 > canvas.height + 100 ||
            line.x2 < -100 || line.x2 > canvas.width + 100 ||
            line.y2 < -100 || line.y2 > canvas.height + 100) {
          lines.splice(i, 1)
          continue
        }

        // Draw line
        const alpha = Math.max(0, Math.min(1, line.life / line.maxLife))
        const lineWidth = Math.max(0.5, alpha * 2)
        
        if (alpha < 0.1) continue
        
        ctx.save()
        ctx.globalAlpha = alpha * 0.8
        ctx.lineWidth = lineWidth
        
        // Theme-aware colors
        const isDark = currentTheme === 'dark'
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()
        ctx.restore()
      }



      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('orientationchange', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [theme, mousePos.x, mousePos.y, touchPos.x, touchPos.y])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none transition-colors duration-500 touch-none"
      style={{ inset: 0, opacity }}
    />
  )
}

// Theme-aware static preview components (temporarily disabled animations to fix performance)
const GridFieldPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <defs>
        <pattern id="grid-pattern" width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M 15 0 L 0 0 0 15" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="0.3" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="300" height="200" fill="url(#grid-pattern)"/>
      {/* Field lines with consistent styling */}
      <path d="M40,60 Q80,50 120,60 Q160,70 200,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M40,80 Q80,70 120,80 Q160,90 200,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M40,100 Q80,90 120,100 Q160,110 200,100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M40,120 Q80,110 120,120 Q160,130 200,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* Poles with consistent design */}
      <circle cx="80" cy="80" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="160" cy="80" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <text x="80" y="84" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="8" fontWeight="bold">+</text>
      <text x="160" y="84" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="8" fontWeight="bold">−</text>
    </svg>
  )
}

const FlowFieldPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Flow field streamlines with consistent styling */}
      <path d="M20,80 Q70,60 120,70 Q170,80 220,60 Q270,70 280,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M20,100 Q70,80 120,90 Q170,100 220,80 Q270,90 280,100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M20,120 Q70,100 120,110 Q170,120 220,100 Q270,110 280,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.6"/>
      {/* Particles with consistent size */}
      <circle cx="120" cy="70" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="170" cy="80" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="220" cy="60" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="120" cy="90" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="170" cy="100" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="220" cy="80" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      {/* Flow sources with consistent design */}
      <circle cx="70" cy="100" r="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="200" cy="100" r="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
    </svg>
  )
}

const TurbulencePreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Turbulent streamlines with consistent styling */}
      <path d="M20,100 Q60,80 100,90 Q140,100 180,85 Q220,70 260,90" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M25,120 Q65,110 105,115 Q145,120 185,110 Q225,100 265,115" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.6"/>
      <path d="M30,80 Q70,60 110,70 Q150,80 190,65 Q230,50 270,70" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.6"/>
      {/* Vortex spirals with consistent design */}
      <path d="M80,60 Q90,50 100,60 Q110,70 100,80 Q90,90 80,80 Q70,70 80,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.8"/>
      <path d="M200,120 Q210,110 220,120 Q230,130 220,140 Q210,150 200,140 Q190,130 200,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.8"/>
      {/* Turbulence sources with consistent size */}
      <circle cx="90" cy="70" r="5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="210" cy="130" r="5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
    </svg>
  )
}

const TopographyPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Contour lines with consistent styling */}
      <ellipse cx="100" cy="80" rx="45" ry="25" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <ellipse cx="100" cy="80" rx="30" ry="15" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" opacity="0.6"/>
      <ellipse cx="100" cy="80" rx="15" ry="8" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" opacity="0.6"/>
      <ellipse cx="220" cy="130" rx="35" ry="20" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <ellipse cx="220" cy="130" rx="20" ry="10" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" opacity="0.6"/>
      {/* Elevation points with consistent design */}
      <circle cx="100" cy="80" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="100" cy="80" r="3" fill={isDark ? "#000000" : "#ffffff"}/>
      <polygon points="100,77 98,81 102,81" fill={isDark ? "#ffffff" : "#000000"}/>
      <circle cx="220" cy="130" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="220" cy="130" r="3" fill={isDark ? "#000000" : "#ffffff"}/>
      <polygon points="220,133 218,129 222,129" fill={isDark ? "#ffffff" : "#000000"}/>
    </svg>
  )
}

const CircularFieldPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Circular field lines with consistent styling */}
      <circle cx="90" cy="100" r="20" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="90" cy="100" r="35" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="90" cy="100" r="50" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="210" cy="100" r="20" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="210" cy="100" r="35" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="210" cy="100" r="50" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      {/* Magnetic poles with consistent design */}
      <circle cx="90" cy="100" r="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="210" cy="100" r="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <text x="90" y="104" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="10" fontWeight="bold">+</text>
      <text x="210" y="104" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="10" fontWeight="bold">−</text>
    </svg>
  )
}

// Wave Interference Preview
const WaveInterferencePreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Wave sources with consistent styling */}
      <circle cx="80" cy="60" r="4" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="240" cy="60" r="4" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="160" cy="40" r="4" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      {/* Wavefronts with consistent design */}
      <circle cx="80" cy="60" r="15" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="80" cy="60" r="25" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.4"/>
      <circle cx="240" cy="60" r="15" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="240" cy="60" r="25" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.4"/>
      <circle cx="160" cy="40" r="12" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <circle cx="160" cy="40" r="20" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.4"/>
      {/* Interference pattern lines */}
      <path d="M60,100 Q150,80 240,100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M60,120 Q150,140 240,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M60,140 Q150,120 240,140" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
    </svg>
  )
}

// Wave Interference 2 Preview
const WaveInterference2Preview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Quantum particles with wave functions */}
      <circle cx="80" cy="60" r="4" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="220" cy="60" r="4" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="150" cy="40" r="4" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      {/* Wave function probability clouds */}
      <circle cx="80" cy="60" r="20" fill={isDark ? "#ffffff" : "#000000"} opacity="0.3"/>
      <circle cx="220" cy="60" r="20" fill={isDark ? "#ffffff" : "#000000"} opacity="0.3"/>
      <circle cx="150" cy="40" r="18" fill={isDark ? "#ffffff" : "#000000"} opacity="0.3"/>
      {/* Measurement devices */}
      <path d="M92,120 L108,120 M100,112 L100,128" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="2" opacity="0.8"/>
      <path d="M192,120 L208,120 M200,112 L200,128" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="2" opacity="0.3"/>
      {/* Interference patterns with quantum effects */}
      <path d="M40,140 Q150,125 260,140" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M40,155 Q150,170 260,155" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M40,170 Q150,155 260,170" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* Chaos effects */}
      <circle cx="60" cy="80" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.4"/>
      <circle cx="140" cy="90" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.4"/>
      <circle cx="220" cy="85" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.4"/>
    </svg>
  )
}

// Particle Swarm Preview
const ParticleSwarmPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Particles with consistent styling */}
      <circle cx="80" cy="60" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="120" cy="80" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="160" cy="70" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="200" cy="90" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="100" cy="100" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="140" cy="120" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="180" cy="110" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="220" cy="130" r="1.5" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      {/* Particle trails */}
      <path d="M60,80 Q80,60 100,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M140,60 Q160,70 180,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M180,90 Q200,90 220,110" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Attractors with consistent design */}
      <circle cx="100" cy="60" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="220" cy="60" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
    </svg>
  )
}

// Neural Network Preview
const NeuralNetworkPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Neural network connections with consistent styling */}
      <path d="M60,60 L120,50" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M60,60 L120,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M60,100 L120,50" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M60,100 L120,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M60,140 L120,50" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M60,140 L120,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M120,50 L180,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M120,50 L180,100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M120,80 L180,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M120,80 L180,100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M180,60 L240,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      <path d="M180,100 L240,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.6"/>
      {/* Neural network nodes with consistent design */}
      <circle cx="60" cy="60" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="60" cy="100" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="60" cy="140" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="120" cy="50" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="120" cy="80" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="180" cy="60" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="180" cy="100" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
      <circle cx="240" cy="80" r="3" fill={isDark ? "#ffffff" : "#000000"} opacity="0.9"/>
    </svg>
  )
}

// Cellular Automata Preview
const CellularAutomataPreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <defs>
        <pattern id="grid-pattern-ca" width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M 15 0 L 0 0 0 15" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="0.3" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="300" height="200" fill="url(#grid-pattern-ca)"/>
      {/* Cellular automata cells with consistent styling */}
      <rect x="60" y="60" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="75" y="60" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="90" y="60" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="60" y="75" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="90" y="75" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="60" y="90" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="75" y="90" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="90" y="90" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      {/* Additional cells for pattern */}
      <rect x="120" y="80" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.6"/>
      <rect x="135" y="80" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.6"/>
      <rect x="150" y="80" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.6"/>
      <rect x="135" y="95" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.6"/>
      <rect x="135" y="110" width="12" height="12" fill={isDark ? "#ffffff" : "#000000"} opacity="0.6"/>
    </svg>
  )
}

// Sound Wave Preview
const SoundWavePreview = () => {
  const { theme } = useTheme()
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
  }, [theme])
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      {/* Sound waves with consistent styling */}
      <path d="M20,60 Q60,40 100,60 Q140,80 180,60 Q220,40 260,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M20,90 Q60,70 100,90 Q140,110 180,90 Q220,70 260,90" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M20,120 Q60,100 100,120 Q140,140 180,120 Q220,100 260,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Frequency spectrum bars with consistent design */}
      <rect x="40" y="160" width="8" height="20" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="80" y="150" width="8" height="30" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="120" y="140" width="8" height="40" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="160" y="130" width="8" height="50" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="200" y="145" width="8" height="35" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <rect x="240" y="155" width="8" height="25" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
    </svg>
  )
}

const getVisualizations = (t: any) => [
  {
    title: t('tools.gridField.title'),
    path: '/grid-field',
    icon: Grid3X3,
    description: t('tools.gridField.description'),
    features: [t('tools.gridField.features.gridControl'), t('tools.gridField.features.linePatterns'), t('tools.gridField.features.scalableGeometry')],
    preview: GridFieldPreview
  },
  {
    title: t('tools.flowField.title'),
    path: '/flow-field',
    icon: Magnet,
    description: t('tools.flowField.description'),
    features: [t('tools.flowField.features.motionPatterns'), t('tools.flowField.features.trailEffects'), t('tools.flowField.features.flowLines')],
    preview: FlowFieldPreview
  },
  {
    title: t('tools.turbulence.title'),
    path: '/turbulence',
    icon: Wind,
    description: t('tools.turbulence.description'),
    features: [t('tools.turbulence.features.vortexGeneration'), t('tools.turbulence.features.turbulentTextures'), t('tools.turbulence.features.noiseVariation')],
    preview: TurbulencePreview
  },
  {
    title: t('tools.topography.title'),
    path: '/topography',
    icon: Mountain,
    description: t('tools.topography.description'),
    features: [t('tools.topography.features.contourLines'), t('tools.topography.features.elevationPatterns'), t('tools.topography.features.depthVisualization')],
    preview: TopographyPreview
  },
  {
    title: t('tools.circularField.title'),
    path: '/circular-field',
    icon: Radio,
    description: t('tools.circularField.description'),
    features: [t('tools.circularField.features.concentricRings'), t('tools.circularField.features.radialControl'), t('tools.circularField.features.circularCompositions')],
    preview: CircularFieldPreview
  },
  {
    title: t('tools.waveInterference.title'),
    path: '/wave-interference',
    icon: Waves,
    description: t('tools.waveInterference.description'),
    features: [t('tools.waveInterference.features.waveSources'), t('tools.waveInterference.features.interferencePatterns'), t('tools.waveInterference.features.harmonicAnalysis')],
    preview: WaveInterferencePreview
  },
  {
    title: t('tools.waveInterference2.title'),
    path: '/wave-interference-2',
    icon: Waves,
    description: t('tools.waveInterference2.description'),
    features: [t('tools.waveInterference2.features.quantumParticles'), t('tools.waveInterference2.features.waveFunctionCollapse'), t('tools.waveInterference2.features.experimentalPatterns')],
    preview: WaveInterference2Preview
  },
  {
    title: t('tools.particleSwarm.title'),
    path: '/particle-swarm',
    icon: Users,
    description: t('tools.particleSwarm.description'),
    features: [t('tools.particleSwarm.features.flockingBehavior'), t('tools.particleSwarm.features.collectiveIntelligence'), t('tools.particleSwarm.features.dynamicAttractors')],
    preview: ParticleSwarmPreview
  },

  {
    title: t('tools.neuralNetwork.title'),
    path: '/neural-network',
    icon: Brain,
    description: t('tools.neuralNetwork.description'),
    features: [t('tools.neuralNetwork.features.networkVisualization'), t('tools.neuralNetwork.features.activationPatterns'), t('tools.neuralNetwork.features.learningSimulation')],
    preview: NeuralNetworkPreview
  },
  {
    title: t('tools.cellularAutomata.title'),
    path: '/cellular-automata',
    icon: Grid,
    description: t('tools.cellularAutomata.description'),
    features: [t('tools.cellularAutomata.features.emergentBehavior'), t('tools.cellularAutomata.features.ruleBased'), t('tools.cellularAutomata.features.complexPatterns')],
    preview: CellularAutomataPreview
  },
  {
    title: t('tools.soundWave.title'),
    path: '/sound-wave',
    icon: Volume2,
    description: t('tools.soundWave.description'),
    features: [t('tools.soundWave.features.waveformAnalysis'), t('tools.soundWave.features.harmonicVisualization'), t('tools.soundWave.features.frequencySpectrum')],
    preview: SoundWavePreview
  }
]

export default function HomePage() {
  const { t } = useTranslation()
  const visualizations = getVisualizations(t)
  const [heroOpacity, setHeroOpacity] = React.useState(1)
  const heroRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      const hero = heroRef.current
      if (!hero) return
      const heroHeight = hero.offsetHeight
      const scrollY = window.scrollY
      // Fade out between 0 and 80% of hero height
      const fadeStart = 0
      const fadeEnd = heroHeight * 0.8
      let opacity = 1
      if (scrollY > fadeStart) {
        opacity = 1 - Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1)
      }
      setHeroOpacity(opacity)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AppLayout showNavigation={true} navigationVariant="header">
      {/* Hero Section - Golden ratio proportions */}
      <section ref={heroRef} className="relative min-h-screen transition-colors duration-500">
        {/* Animated Background */}
        <MathematicalBackground opacity={heroOpacity} />
        
        <div className="container mx-auto px-8 py-24 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start relative z-10">
          {/* Main content - 3/5 of width (golden ratio) */}
          <div className="lg:col-span-3">
            <h2 className="text-6xl md:text-7xl font-normal tracking-tight mb-8 text-foreground leading-none">
              {t('hero.title')}
              <span className="block text-muted-foreground font-light mt-2">{t('hero.subtitle')}</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group w-fit text-base px-8 py-3">
                <Link href="/grid-field">
                  {t('hero.startCreating')}
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-fit text-base px-8 py-3">
                <Link href="#tools">
                  {t('hero.exploreTools')}
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Side content - 2/5 of width */}
          <div className="lg:col-span-2">
          </div>
          </div>
        </div>
      </section>

      {/* Tools Section - Structured grid */}
      <section id="tools" className="container mx-auto px-2 sm:px-8 py-24 overflow-x-hidden">
        <div className="mb-12">
          <h3 className="text-3xl font-normal mb-4 text-foreground">{t('tools.title')}</h3>
          <p className="text-muted-foreground max-w-2xl">
            {t('tools.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-full overflow-x-hidden">
          {visualizations.map((viz: any) => (
            <Link key={viz.path} href={viz.path} className="block group max-w-full">
              <Card className="h-full hover:shadow-lg hover:shadow-black/5 transition-all duration-200 cursor-pointer border-2 hover:border-accent group-hover:scale-[1.02] max-w-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center transition-colors duration-200 group-hover:bg-accent">
                      <viz.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-accent-foreground transition-colors duration-200">{viz.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {viz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-4 h-32 rounded-lg border border-border/50 overflow-hidden">
                    <viz.preview />
                  </div>
                  <ul className="space-y-2 mb-4">
                    {viz.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <Sparkles className="w-3 h-3 mr-2 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="opacity-60 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-200"
                  >
                    <Play className="w-3 h-3 mr-2" />
                    {t('tools.tryNow')}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Suggestions Section - Structured layout */}
      <section id="suggestions" className="container mx-auto px-8 py-24 bg-muted/30">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-3 mb-4">
              <Lightbulb className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="text-3xl font-normal text-foreground">
                  {t('suggestions.title')}
                </h3>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              {t('suggestions.description')}
            </p>
          </div>
          
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 py-3">
                <Link href="/suggestions">
                  {t('suggestions.viewSuggestions')}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 py-3">
                <Link href="/suggestions/new">
                  {t('suggestions.submitIdea')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Asymmetrical layout */}
      <section id="about" className="container mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-normal mb-6 text-foreground">
              {t('about.title')}
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-medium mb-3 text-foreground">{t('about.professionalGeneration.title')}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.professionalGeneration.description')}
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.additionalInfo')}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-medium mb-4 text-foreground">{t('about.poweredBy.title')}</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('about.poweredBy.description')} <a href="https://h23.fi" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors font-medium">H23</a>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.poweredBy.expertise')}
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  )
} 