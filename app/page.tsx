'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Grid3X3, Magnet, Wind, Mountain, Radio, Sparkles, Download, Play, Lightbulb, Waves, Users, TreePine, Brain, Grid, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/layout/AppLayout'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useTranslation } from 'react-i18next'

// Interactive Mathematical Background Animation
const MathematicalBackground = ({ opacity = 1 }: { opacity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = React.useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      
      // Mobile-first responsive DPR scaling
      const isMobile = window.innerWidth <= 768
      const isSmallMobile = window.innerWidth <= 480
      
      let dpr = window.devicePixelRatio
      
      // Aggressive DPR scaling for mobile performance
      if (isSmallMobile) {
        dpr = Math.min(dpr, 1.25) // Very small screens
      } else if (isMobile) {
        dpr = Math.min(dpr, 1.5) // Regular mobile screens
      } else {
        dpr = Math.min(dpr, 2) // Desktop and tablets
      }
      
      // Set canvas dimensions to fill available space
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // Scale context for crisp rendering
      ctx.scale(dpr, dpr)
      
      // Set canvas style size to match container
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('orientationchange', () => {
      // Delay resize to allow orientation change to complete
      setTimeout(resizeCanvas, 100)
    })

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    // Scroll handler
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Animation variables
    let time = 0
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      type: 'flow' | 'field' | 'wave'
    }> = []

    // Mathematical functions with interaction
    const complexFunction = (x: number, y: number, t: number) => {
      const scale = 0.005
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Base complex function
      const real = xScaled * xScaled - yScaled * yScaled + Math.sin(t * 0.5) * 0.3
      const imag = 2 * xScaled * yScaled + Math.cos(t * 0.3) * 0.2
      
      // Add mouse interaction - ripple effect
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const rippleEffect = Math.sin(mouseDistance * 0.02 - t * 2) * Math.exp(-mouseDistance * 0.001) * 0.2
      
      return { 
        real: real + rippleEffect, 
        imag: imag, 
        magnitude: Math.sqrt((real + rippleEffect) ** 2 + imag ** 2) 
      }
    }

    const waveFunction = (x: number, y: number, t: number) => {
      const scale = 0.01
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Base wave function
      let wave = Math.sin(xScaled + t * 0.5) * Math.cos(yScaled + t * 0.3) * 
             Math.sin(Math.sqrt(xScaled * xScaled + yScaled * yScaled) + t * 0.2)
      
      // Add mouse interaction - attract particles to mouse
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const mouseAttraction = Math.sin(mouseDistance * 0.01 - t * 3) * Math.exp(-mouseDistance * 0.002) * 0.15
      
      return wave + mouseAttraction
    }

    // Get current theme - cached to prevent flickering
    const getCurrentTheme = () => {
      if (theme === 'dark') return 'dark'
      if (theme === 'light') return 'light'
      // system theme - cache the result
      if (!window.matchMedia) return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Create particles with interaction
    const createParticle = (x: number, y: number, type: 'flow' | 'field' | 'wave') => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.3 + Math.random() * 0.7
      
      // Add mouse attraction to particle creation
      const mouseDistance = Math.sqrt((x - mousePos.x) ** 2 + (y - mousePos.y) ** 2)
      const mouseInfluence = Math.exp(-mouseDistance * 0.001) * 0.5
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (1 + mouseInfluence),
        vy: Math.sin(angle) * speed * (1 + mouseInfluence),
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        type
      })
    }

    // Initialize particles
    for (let i = 0; i < 80; i++) {
      createParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        ['flow', 'field', 'wave'][Math.floor(Math.random() * 3)] as any
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

      // Clear canvas with fade effect - use consistent theme
      const fadeOpacity = 0.08
      ctx.fillStyle = currentTheme === 'dark' 
        ? `rgba(0, 0, 0, ${fadeOpacity})` 
        : `rgba(255, 255, 255, ${fadeOpacity})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create new particles
      if (Math.random() < 0.4) {
        const type = ['flow', 'field', 'wave'][Math.floor(Math.random() * 3)] as any
        createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          type
        )
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        
        // Update position based on mathematical functions
        if (particle.type === 'flow') {
          const func = complexFunction(particle.x, particle.y, time)
          const gradientX = Math.cos(func.magnitude * Math.PI) * 0.8
          const gradientY = Math.sin(func.magnitude * Math.PI) * 0.8
          particle.x += particle.vx + gradientX
          particle.y += particle.vy + gradientY
        } else if (particle.type === 'field') {
          const func = complexFunction(particle.x, particle.y, time)
          const gradientX = Math.cos(func.real * Math.PI * 2) * 0.6
          const gradientY = Math.sin(func.imag * Math.PI * 2) * 0.6
          particle.x += particle.vx + gradientX
          particle.y += particle.vy + gradientY
        } else { // wave
          const wave = waveFunction(particle.x, particle.y, time)
          const gradientX = Math.cos(wave * Math.PI) * 0.4
          const gradientY = Math.sin(wave * Math.PI) * 0.4
          particle.x += particle.vx + gradientX
          particle.y += particle.vy + gradientY
        }
        
              // Add mouse attraction to particles
      const mouseDistance = Math.sqrt((particle.x - mousePos.x) ** 2 + (particle.y - mousePos.y) ** 2)
      if (mouseDistance < 200) {
        const attraction = (200 - mouseDistance) / 200 * 0.05
        const dx = mousePos.x - particle.x
        const dy = mousePos.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > 0) {
          particle.x += (dx / distance) * attraction
          particle.y += (dy / distance) * attraction
        }
        }
        
        particle.life -= 0.008

        // Remove dead particles or particles outside bounds
        if (particle.life <= 0 || 
            particle.x < -50 || particle.x > canvas.width + 50 ||
            particle.y < -50 || particle.y > canvas.height + 50) {
          particles.splice(i, 1)
          continue
        }

        // Skip rendering if particle is outside visible area
        if (particle.x < -20 || particle.x > canvas.width + 20 ||
            particle.y < -20 || particle.y > canvas.height + 20) {
          continue
        }

        // Draw particle
        const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife))
        const size = Math.max(1.5, (1 - alpha) * 3 + 1.5)
        
        if (size < 1 || alpha < 0.1) continue
        
        ctx.save()
        ctx.globalAlpha = alpha * 0.4
        
        // Black and white theme-aware colors only
        const isDark = currentTheme === 'dark'
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Draw mathematical field lines - theme-aware
      const fieldLineOpacity = 0.04
      ctx.strokeStyle = currentTheme === 'dark' 
        ? `rgba(255, 255, 255, ${fieldLineOpacity})` 
        : `rgba(0, 0, 0, ${fieldLineOpacity})`
      ctx.lineWidth = 0.5
      
      for (let i = 0; i < 12; i++) {
        const y = (canvas.height / 12) * i
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 4) {
          const func = complexFunction(x, y, time)
          const offsetY = Math.sin(func.magnitude * Math.PI * 2) * 20
          if (x === 0) {
            ctx.moveTo(x, y + offsetY)
          } else {
            ctx.lineTo(x, y + offsetY)
          }
        }
        ctx.stroke()
      }

      // Draw wave patterns - theme-aware
      const waveLineOpacity = 0.03
      ctx.strokeStyle = currentTheme === 'dark' 
        ? `rgba(255, 255, 255, ${waveLineOpacity})` 
        : `rgba(0, 0, 0, ${waveLineOpacity})`
      ctx.lineWidth = 0.5
      
      for (let i = 0; i < 8; i++) {
        const x = (canvas.width / 8) * i
        ctx.beginPath()
        for (let y = 0; y < canvas.height; y += 4) {
          const wave = waveFunction(x, y, time)
          const offsetX = Math.cos(wave * Math.PI * 2) * 15
          if (y === 0) {
            ctx.moveTo(x + offsetX, y)
          } else {
            ctx.lineTo(x + offsetX, y)
          }
        }
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('orientationchange', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [theme, mousePos.x, mousePos.y, scrollY])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none transition-colors duration-500 touch-none"
      style={{ inset: 0, opacity }}
    />
  )
}

// Theme-aware preview components
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
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="300" height="200" fill="url(#grid)"/>
    {/* Grid field lines */}
      <path d="M50,50 Q80,70 110,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.8"/>
      <path d="M50,70 Q85,85 120,75" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.8"/>
      <path d="M50,90 Q90,100 130,90" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.8"/>
      <path d="M190,50 Q160,70 130,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.8"/>
      <path d="M190,70 Q155,85 120,75" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.8"/>
      <path d="M190,90 Q150,100 110,90" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" fill="none" opacity="0.8"/>
    {/* Magnetic poles */}
      <circle cx="80" cy="70" r="8" fill={isDark ? "#ffffff" : "#000000"}/>
      <circle cx="160" cy="70" r="8" fill={isDark ? "#ffffff" : "#000000"}/>
      <text x="80" y="75" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="10" fontWeight="bold">+</text>
      <text x="160" y="75" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="10" fontWeight="bold">-</text>
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
    {/* Flow field particles */}
      <path d="M30,100 Q80,80 130,70 Q180,60 230,80" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M40,120 Q90,100 140,90 Q190,80 240,100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M35,140 Q85,120 135,110 Q185,100 235,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M45,160 Q95,140 145,130 Q195,120 245,140" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.7"/>
    {/* Particles */}
      <circle cx="130" cy="70" r="2" fill={isDark ? "#ffffff" : "#000000"}/>
      <circle cx="140" cy="90" r="2" fill={isDark ? "#ffffff" : "#000000"}/>
      <circle cx="135" cy="110" r="2" fill={isDark ? "#ffffff" : "#000000"}/>
      <circle cx="145" cy="130" r="2" fill={isDark ? "#ffffff" : "#000000"}/>
    {/* Magnetic poles */}
      <circle cx="70" cy="100" r="10" fill={isDark ? "#ffffff" : "#000000"} stroke={isDark ? "#000000" : "#ffffff"} strokeWidth="2"/>
      <circle cx="200" cy="100" r="10" fill={isDark ? "#ffffff" : "#000000"} stroke={isDark ? "#000000" : "#ffffff"} strokeWidth="2"/>
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
    {/* Turbulent streamlines */}
      <path d="M20,100 Q60,80 100,90 Q140,100 180,85 Q220,70 260,90" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.8"/>
      <path d="M25,120 Q65,110 105,115 Q145,120 185,110 Q225,100 265,115" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.8"/>
      <path d="M30,80 Q70,60 110,70 Q150,80 190,65 Q230,50 270,70" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none" opacity="0.8"/>
    {/* Vortex spirals */}
      <path d="M80,60 Q90,50 100,60 Q110,70 100,80 Q90,90 80,80 Q70,70 80,60" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="2" fill="none"/>
      <path d="M200,120 Q210,110 220,120 Q230,130 220,140 Q210,150 200,140 Q190,130 200,120" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="2" fill="none"/>
    {/* Turbulence sources */}
      <circle cx="90" cy="70" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
      <circle cx="210" cy="130" r="6" fill={isDark ? "#ffffff" : "#000000"} opacity="0.8"/>
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
    {/* Contour lines */}
      <ellipse cx="100" cy="80" rx="50" ry="30" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
      <ellipse cx="100" cy="80" rx="35" ry="20" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" opacity="0.8"/>
      <ellipse cx="100" cy="80" rx="20" ry="12" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="2" opacity="0.8"/>
      <ellipse cx="220" cy="130" rx="40" ry="25" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
      <ellipse cx="220" cy="130" rx="25" ry="15" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" opacity="0.8"/>
    {/* Elevation points */}
      <circle cx="100" cy="80" r="8" fill={isDark ? "#ffffff" : "#000000"} stroke={isDark ? "#000000" : "#ffffff"} strokeWidth="1"/>
      <circle cx="100" cy="80" r="5" fill={isDark ? "#000000" : "#ffffff"}/>
      <polygon points="100,76 97,82 103,82" fill={isDark ? "#ffffff" : "#000000"}/>
      <circle cx="220" cy="130" r="8" fill={isDark ? "#ffffff" : "#000000"} stroke={isDark ? "#000000" : "#ffffff"} strokeWidth="1"/>
      <circle cx="220" cy="130" r="5" fill={isDark ? "#000000" : "#ffffff"}/>
      <polygon points="220,134 217,128 223,128" fill={isDark ? "#ffffff" : "#000000"}/>
    {/* Labels */}
      <text x="100" y="100" textAnchor="middle" fontSize="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.7">Peak</text>
      <text x="220" y="150" textAnchor="middle" fontSize="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.7">Valley</text>
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
    {/* Circular field lines around left pole */}
      <circle cx="90" cy="100" r="25" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
      <circle cx="90" cy="100" r="40" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
      <circle cx="90" cy="100" r="55" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
    {/* Circular field lines around right pole */}
      <circle cx="210" cy="100" r="25" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
      <circle cx="210" cy="100" r="40" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
      <circle cx="210" cy="100" r="55" fill="none" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" opacity="0.8"/>
    {/* Magnetic poles */}
      <circle cx="90" cy="100" r="12" fill={isDark ? "#ffffff" : "#000000"} stroke={isDark ? "#000000" : "#ffffff"} strokeWidth="2"/>
      <circle cx="210" cy="100" r="12" fill={isDark ? "#ffffff" : "#000000"} stroke={isDark ? "#000000" : "#ffffff"} strokeWidth="2"/>
      <text x="90" y="105" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="12" fontWeight="bold">+</text>
      <text x="210" y="105" textAnchor="middle" fill={isDark ? "#000000" : "#ffffff"} fontSize="12" fontWeight="bold">−</text>
    {/* Labels */}
      <text x="90" y="130" textAnchor="middle" fontSize="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.7">North</text>
      <text x="210" y="130" textAnchor="middle" fontSize="8" fill={isDark ? "#ffffff" : "#000000"} opacity="0.7">South</text>
  </svg>
)
}

// Wave Interference Preview
const WaveInterferencePreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0
    const sources = [
      { x: 80, y: 60, frequency: 2 },
      { x: 240, y: 60, frequency: 2 },
      { x: 160, y: 40, frequency: 1.5 }
    ]

    const animate = () => {
      time += 0.03
      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Clear with fade
      ctx.fillStyle = currentTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw interference pattern
      for (let x = 0; x < canvas.width; x += 4) {
        for (let y = 0; y < canvas.height; y += 4) {
          let amplitude = 0
          
          sources.forEach(source => {
            const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
            const wave = Math.sin((distance / 20) - time * source.frequency)
            amplitude += wave * (50 / (1 + distance / 50))
          })

          const intensity = Math.abs(amplitude) / 100
          const alpha = Math.min(1, intensity * 0.8)
          
          if (alpha > 0.1) {
            ctx.fillStyle = currentTheme 
              ? `rgba(255, 255, 255, ${alpha})` 
              : `rgba(0, 0, 0, ${alpha})`
            ctx.fillRect(x, y, 4, 4)
          }
        }
      }

      // Draw sources
      sources.forEach((source, index) => {
        const colors = ['#ef4444', '#3b82f6', '#10b981'] // red, blue, green
        ctx.fillStyle = colors[index % colors.length]
        ctx.beginPath()
        ctx.arc(source.x, source.y, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg border border-border/50"
    />
  )
}

// Particle Swarm Preview
const ParticleSwarmPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0
    const particles = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1
    }))

    const attractors = [
      { x: 100, y: 60, strength: 0.5 },
      { x: 220, y: 60, strength: -0.3 }
    ]

    const animate = () => {
      time += 0.02
      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Clear with fade
      ctx.fillStyle = currentTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach(particle => {
        // Apply attractor forces
        attractors.forEach(attractor => {
          const dx = attractor.x - particle.x
          const dy = attractor.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > 0) {
            particle.vx += (dx / distance) * attractor.strength * 0.1
            particle.vy += (dy / distance) * attractor.strength * 0.1
          }
        })

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8

        // Draw particle
        ctx.fillStyle = currentTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw attractors
      attractors.forEach((attractor, index) => {
        const colors = ['#ef4444', '#3b82f6'] // red, blue
        ctx.fillStyle = colors[index % colors.length]
        ctx.beginPath()
        ctx.arc(attractor.x, attractor.y, 6, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg border border-border/50"
    />
  )
}

// Fractal Tree Preview
const FractalTreePreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0
    let growthProgress = 0

    const drawBranch = (x: number, y: number, length: number, angle: number, depth: number, maxDepth: number) => {
      if (depth >= maxDepth || length < 2) return

      const currentLength = length * Math.min(1, growthProgress * 2 - depth * 0.2)
      if (currentLength <= 0) return

      const endX = x + Math.cos(angle) * currentLength
      const endY = y + Math.sin(angle) * currentLength

      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ctx.strokeStyle = currentTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
      ctx.lineWidth = Math.max(1, 8 - depth * 2)
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      if (depth < maxDepth - 1) {
        drawBranch(endX, endY, length * 0.7, angle + 0.3, depth + 1, maxDepth)
        drawBranch(endX, endY, length * 0.7, angle - 0.3, depth + 1, maxDepth)
      }
    }

    const animate = () => {
      time += 0.02
      growthProgress = Math.min(1, growthProgress + 0.01)

      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Clear with fade
      ctx.fillStyle = currentTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw tree
      drawBranch(canvas.width / 2, canvas.height - 10, 60, -Math.PI / 2, 0, 6)

      // Reset growth periodically
      if (growthProgress >= 1) {
        setTimeout(() => {
          growthProgress = 0
        }, 1000)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg border border-border/50"
    />
  )
}

// Neural Network Preview
const NeuralNetworkPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0
    const layers = [3, 4, 3, 2]
    const nodes: Array<{ x: number; y: number; layer: number; activation: number; pulse: number }> = []
    const connections: Array<{ from: number; to: number; weight: number; active: boolean }> = []

    // Initialize nodes
    let nodeId = 0
    layers.forEach((layerSize, layerIndex) => {
      const layerX = (canvas.width / (layers.length + 1)) * (layerIndex + 1)
      const nodeSpacing = canvas.height / (layerSize + 1)
      
      for (let i = 0; i < layerSize; i++) {
        const nodeY = nodeSpacing * (i + 1)
        nodes.push({
          x: layerX,
          y: nodeY,
          layer: layerIndex,
          activation: Math.random() * 0.5 + 0.25,
          pulse: 0
        })
        nodeId++
      }
    })

    // Initialize connections
    nodes.forEach((node, nodeIndex) => {
      if (node.layer < layers.length - 1) {
        const nextLayerNodes = nodes.filter(n => n.layer === node.layer + 1)
        nextLayerNodes.forEach(targetNode => {
          connections.push({
            from: nodeIndex,
            to: nodes.indexOf(targetNode),
            weight: (Math.random() - 0.5) * 2,
            active: false
          })
        })
      }
    })

    const animate = () => {
      time += 0.02
      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Clear with fade
      ctx.fillStyle = currentTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update activations
      nodes.forEach((node, index) => {
        if (node.layer > 0) {
          let sum = 0
          connections.forEach(conn => {
            if (conn.to === index) {
              sum += nodes[conn.from].activation * conn.weight
              conn.active = Math.random() > 0.95
            }
          })
          node.activation = 1 / (1 + Math.exp(-sum))
          node.pulse = Math.max(0, node.pulse - 0.02)
        }
      })

      // Draw connections
      connections.forEach(conn => {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]
        const weight = conn.weight
        
        ctx.strokeStyle = weight > 0 
          ? 'rgba(16, 185, 129, 0.4)' // green
          : 'rgba(239, 68, 68, 0.4)' // red
        ctx.lineWidth = Math.abs(weight) * 2 + 1
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach(node => {
        const activation = node.activation
        const pulse = node.pulse
        
        let color: string
        if (node.layer === 0) {
          color = '#3b82f6' // blue
        } else if (node.layer === layers.length - 1) {
          color = '#10b981' // green
        } else {
          const intensity = Math.floor(activation * 255)
          color = `rgb(${intensity}, ${intensity}, 255)` // blue gradient
        }

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(node.x, node.y, 6 + pulse * 3, 0, 2 * Math.PI)
        ctx.fill()

        // Draw pulse effect
        if (pulse > 0) {
          ctx.strokeStyle = currentTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(node.x, node.y, 6 + pulse * 10, 0, 2 * Math.PI)
          ctx.stroke()
        }
      })

      // Trigger pulses randomly
      if (Math.random() < 0.1) {
        const randomNode = nodes[Math.floor(Math.random() * nodes.length)]
        randomNode.pulse = 1
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg border border-border/50"
    />
  )
}

// Cellular Automata Preview
const CellularAutomataPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0
    const gridSize = 20
    const cellSize = canvas.width / gridSize
    let grid: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))
    let nextGrid: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false))

    // Initialize with glider pattern
    const glider = [
      [false, true, false],
      [false, false, true],
      [true, true, true]
    ]
    
    for (let y = 0; y < glider.length; y++) {
      for (let x = 0; x < glider[0].length; x++) {
        grid[y + 8][x + 8] = glider[y][x]
      }
    }

    const countNeighbors = (x: number, y: number): number => {
      let count = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          
          const nx = (x + dx + gridSize) % gridSize
          const ny = (y + dy + gridSize) % gridSize
          
          if (grid[ny] && grid[ny][nx]) {
            count++
          }
        }
      }
      return count
    }

    const animate = () => {
      time += 0.05
      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Clear with fade
      ctx.fillStyle = currentTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Apply Conway's Game of Life rules
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const neighbors = countNeighbors(x, y)
          const alive = grid[y][x]
          
          if (alive) {
            nextGrid[y][x] = neighbors === 2 || neighbors === 3
          } else {
            nextGrid[y][x] = neighbors === 3
          }
        }
      }

      // Draw cells
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (nextGrid[y][x]) {
            const age = Math.floor(time * 2) % 8
            const colors = ['#ef4444', '#3b82f6', '#10b981'] // red, blue, green
            ctx.fillStyle = colors[age % colors.length]
            ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1)
          }
        }
      }

      // Update grid
      [grid, nextGrid] = [nextGrid, grid]

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg border border-border/50"
    />
  )
}

// Sound Wave Preview
const SoundWavePreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0

    const animate = () => {
      time += 0.03
      const currentTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      // Clear with fade
      ctx.fillStyle = currentTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw waveform
      ctx.strokeStyle = '#3b82f6' // blue
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let x = 0; x < canvas.width; x += 2) {
        let y = canvas.height / 2
        
        // Add multiple harmonics
        for (let h = 1; h <= 3; h++) {
          const harmonicFreq = 2 * h
          const harmonicAmp = 1 / h
          const phase = (x / canvas.width) * 2 * Math.PI * h + time * harmonicFreq
          y += Math.sin(phase) * (canvas.height / 8) * harmonicAmp
        }
        
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw frequency spectrum
      const spectrumHeight = canvas.height * 0.3
      const spectrumY = canvas.height * 0.7
      const binWidth = canvas.width / 16

      for (let i = 0; i < 16; i++) {
        const magnitude = (1 / (i + 1)) * Math.sin(time + i * 0.5) * 0.5 + 0.5
        const barHeight = magnitude * spectrumHeight
        const barX = i * binWidth
        const barY = spectrumY + spectrumHeight - barHeight
        
        const colors = ['#ef4444', '#3b82f6', '#10b981'] // red, blue, green
        ctx.fillStyle = colors[i % colors.length]
        ctx.fillRect(barX, barY, binWidth - 1, barHeight)
      }

      // Draw harmonics visualization
      for (let h = 1; h <= 3; h++) {
        const harmonicFreq = 2 * h
        const harmonicAmp = 1 / h
        const x = (h / 3) * canvas.width * 0.8 + canvas.width * 0.1
        const y = canvas.height * 0.2
        
        const radius = harmonicAmp * 15
        const colors = ['#ef4444', '#3b82f6', '#10b981'] // red, blue, green
        ctx.fillStyle = colors[(h - 1) % colors.length]
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg border border-border/50"
    />
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
    title: t('tools.particleSwarm.title'),
    path: '/particle-swarm',
    icon: Users,
    description: t('tools.particleSwarm.description'),
    features: [t('tools.particleSwarm.features.flockingBehavior'), t('tools.particleSwarm.features.collectiveIntelligence'), t('tools.particleSwarm.features.dynamicAttractors')],
    preview: ParticleSwarmPreview
  },
  {
    title: t('tools.fractalTree.title'),
    path: '/fractal-tree',
    icon: TreePine,
    description: t('tools.fractalTree.description'),
    features: [t('tools.fractalTree.features.recursiveBranching'), t('tools.fractalTree.features.growthAnimation'), t('tools.fractalTree.features.organicPatterns')],
    preview: FractalTreePreview
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