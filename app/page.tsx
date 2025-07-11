'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Play, Lightbulb, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/layout/AppLayout'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useTranslation } from 'react-i18next'
import { useHomePageVisualizations } from '@/lib/hooks/useHomePageVisualizations'
import PWAInstallToast from '@/components/PWAInstallToast'
import dynamic from 'next/dynamic'

// Interactive Mathematical Line-Based Background Animation
const MathematicalBackground = ({ opacity = 1 }: { opacity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()
  const mousePosRef = useRef({ x: 0, y: 0 })
  const touchPosRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)

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
      const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const harmonic = Math.sin(xScaled + t * 0.3) * Math.cos(yScaled + t * 0.2) * 
                      Math.sin(Math.sqrt(xScaled * xScaled + yScaled * yScaled) + t * 0.1)
      
      const interaction = Math.sin(minDistance * 0.015 - t * 1.5) * Math.exp(-minDistance * 0.001) * 0.6
      
      return harmonic + interaction
    }

    const fractalFunction = (x: number, y: number, t: number) => {
      const scale = 0.008
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Fractal-like pattern with mouse interaction
      const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const fractal = Math.sin(xScaled * 2 + t * 0.4) * Math.cos(yScaled * 2 + t * 0.3) * 
                     Math.sin(xScaled * yScaled + t * 0.2)
      
      const interaction = Math.cos(minDistance * 0.012 - t * 1.2) * Math.exp(-minDistance * 0.0008) * 0.5
      
      return fractal + interaction
    }

    const spiralFunction = (x: number, y: number, t: number) => {
      const scale = 0.012
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      // Spiral pattern with mouse interaction
      const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
      const minDistance = Math.min(mouseDistance, touchDistance)
      
      const angle = Math.atan2(yScaled, xScaled)
      const radius = Math.sqrt(xScaled * xScaled + yScaled * yScaled)
      
      const spiral = Math.sin(angle * 3 + radius * 2 + t * 0.3) * Math.cos(radius + t * 0.2)
      
      const interaction = Math.sin(minDistance * 0.008 - t * 2) * Math.exp(-minDistance * 0.0012) * 0.5
      
      return spiral + interaction
    }

    // Get current theme
    const getCurrentTheme = () => {
      if (theme === 'dark') return 'dark'
      if (theme === 'light') return 'light'
      if (theme === 'pastel') return 'pastel'
      if (!window.matchMedia) return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Create mathematical lines - more varied positioning
    const createLine = (x: number, y: number, type: 'harmonic' | 'fractal' | 'spiral') => {
      const angle = Math.random() * Math.PI * 2
      const length = 40 + Math.random() * 80
      
      const mouseDistance = Math.sqrt((x - mousePosRef.current.x) ** 2 + (y - mousePosRef.current.y) ** 2)
      const touchDistance = Math.sqrt((x - touchPosRef.current.x) ** 2 + (y - touchPosRef.current.y) ** 2)
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

    // Initialize lines - reduced count for smoother performance
    for (let i = 0; i < 40; i++) {
      createLine(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        ['harmonic', 'fractal', 'spiral'][Math.floor(Math.random() * 3)] as any
      )
    }

    // Animation loop with frame rate control
    const animate = (currentTime: number) => {
      // Frame rate control - limit to 30 FPS for smoother animation
      if (currentTime - lastTimeRef.current < 33) { // ~30 FPS
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      // Use consistent time step for smoother animation
      time += Math.min(deltaTime * 0.001, 0.033) // Cap at 33ms
      frameCountRef.current++
      
      const currentTheme = getCurrentTheme()

      // Safety check for canvas context
      if (!ctx || !canvas) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Clear canvas with theme-appropriate background
      let bgColor: string
      if (currentTheme === 'dark') {
        bgColor = '#0a0a0a'
      } else if (currentTheme === 'pastel') {
        bgColor = '#e8f4f8' // More colorful pastel background
      } else {
        bgColor = '#ffffff'
      }
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw lines with stable colors
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]
        line.life -= 0.008 // Slower fade for smoother animation

        if (line.life <= 0) {
          lines.splice(i, 1)
          continue
        }

        const alpha = line.life / line.maxLife
        let strokeColor: string
        
        // Use stable colors based on line type and frame count for consistency
        if (currentTheme === 'pastel') {
          const colors = ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#96CEB4', '#FFEAA7', '#DDA0DD']
          const colorIndex = (line.type === 'harmonic' ? 0 : line.type === 'fractal' ? 1 : 2) + 
                           (frameCountRef.current % 3) * 2
          strokeColor = colors[colorIndex % colors.length]
        } else if (currentTheme === 'dark') {
          strokeColor = '#ffffff'
        } else {
          strokeColor = '#000000'
        }
        
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 0.8 // Slightly thinner lines
        ctx.globalAlpha = alpha * 0.5 // Reduced opacity for smoother look

        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()

        // Reduced glow effect for less flickering
        ctx.shadowColor = strokeColor
        ctx.shadowBlur = 1
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Create new lines based on mathematical functions - reduced frequency
      if (lines.length < 50 && frameCountRef.current % 4 === 0) { // Every 4 frames
        for (let i = 0; i < 2; i++) { // Reduced from 3 to 2
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          
          const harmonic = harmonicFunction(x, y, time)
          const fractal = fractalFunction(x, y, time)
          const spiral = spiralFunction(x, y, time)
          
          const maxValue = Math.max(Math.abs(harmonic), Math.abs(fractal), Math.abs(spiral))
          
          if (maxValue > 0.4) { // Increased threshold for more stable generation
            const types: Array<'harmonic' | 'fractal' | 'spiral'> = ['harmonic', 'fractal', 'spiral']
            const type = types[Math.floor(Math.random() * 3)]
            createLine(x, y, type)
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate(performance.now())

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('resize', resizeCanvas)
    }
      }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full transition-opacity duration-500"
      style={{ opacity }}
    />
  )
}

// Preview components are now centralized in lib/preview-components.tsx

// Visualization data is now centralized in lib/navigation-config.ts and lib/hooks/useHomePageVisualizations.ts

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const Page = () => {
  const { t } = useTranslation()
  const { allVisualizations, verifiedVisualizations, inProgressVisualizations } = useHomePageVisualizations()
  const [heroOpacity, setHeroOpacity] = React.useState(1)
  const heroRef = React.useRef<HTMLDivElement>(null)
  const [showPwaToast, setShowPwaToast] = React.useState(false);

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

  React.useEffect(() => {
    // Only run on client
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setShowPwaToast(isMobile);
  }, []);

  return (
    <div>
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

        {/* Tools Section */}
        <section id="tools" className="container mx-auto px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-normal mb-4 text-foreground">
              {t('tools.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('tools.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {verifiedVisualizations.map((visualization) => (
              <Card key={visualization.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <visualization.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-medium">{visualization.title}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {visualization.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {visualization.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="w-full group" variant="outline">
                      <Link href={visualization.path}>
                        {t('tools.tryNow')}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Section */}
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
      
      {/* PWA Install Toast - show on mobile for additional visibility */}
      {showPwaToast && <PWAInstallToast />}
    </div>
  )
}

export default dynamic(() => Promise.resolve(Page), { ssr: false }); 