'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Grid3X3, Magnet, Wind, Mountain, Radio, Sparkles, Download, Play, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/layout/AppLayout'

// Interactive Super Saddle Background Animation
const SuperSaddleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation variables
    let time = 0
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
    }> = []

    // Super saddle function: z = x² - y²
    const superSaddle = (x: number, y: number, t: number) => {
      const scale = 0.01
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      return Math.sin(xScaled * xScaled - yScaled * yScaled + t * 0.5) * 0.5 + 0.5
    }

    // Check if dark mode
    const isDarkMode = () => {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // Create particles
    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 1
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5
      })
    }

    // Animation loop
    const animate = () => {
      time += 0.016
      const dark = isDarkMode()

      // Clear canvas with fade effect
      ctx.fillStyle = dark ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create new particles
      if (Math.random() < 0.3) {
        createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        
        // Update position based on super saddle gradient
        const saddleValue = superSaddle(particle.x, particle.y, time)
        const gradientX = Math.cos(saddleValue * Math.PI * 2) * 0.5
        const gradientY = Math.sin(saddleValue * Math.PI * 2) * 0.5
        
        particle.x += particle.vx + gradientX
        particle.y += particle.vy + gradientY
        particle.life -= 0.01

        // Remove dead particles
        if (particle.life <= 0 || 
            particle.x < 0 || particle.x > canvas.width ||
            particle.y < 0 || particle.y > canvas.height) {
          particles.splice(i, 1)
          continue
        }

        // Draw particle
        const alpha = particle.life / particle.maxLife
        const size = (1 - alpha) * 3 + 1
        
        ctx.save()
        ctx.globalAlpha = alpha * 0.6
        const hue = saddleValue * 360 + time * 50
        const saturation = 70
        const lightness = dark ? 60 : 50
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Draw super saddle contour lines
      ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < 20; i++) {
        const y = (canvas.height / 20) * i
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 2) {
          const saddleValue = superSaddle(x, y, time)
          const offsetY = Math.sin(saddleValue * Math.PI * 4) * 10
          if (x === 0) {
            ctx.moveTo(x, y + offsetY)
          } else {
            ctx.lineTo(x, y + offsetY)
          }
        }
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}

// Static preview SVGs for each visualization
const GridFieldPreview = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="300" height="200" fill="url(#grid)"/>
    {/* Grid field lines */}
    <path d="M50,50 Q80,70 110,60" stroke="#000" strokeWidth="1" fill="none"/>
    <path d="M50,70 Q85,85 120,75" stroke="#000" strokeWidth="1" fill="none"/>
    <path d="M50,90 Q90,100 130,90" stroke="#000" strokeWidth="1" fill="none"/>
    <path d="M190,50 Q160,70 130,60" stroke="#000" strokeWidth="1" fill="none"/>
    <path d="M190,70 Q155,85 120,75" stroke="#000" strokeWidth="1" fill="none"/>
    <path d="M190,90 Q150,100 110,90" stroke="#000" strokeWidth="1" fill="none"/>
    {/* Magnetic poles */}
    <circle cx="80" cy="70" r="8" fill="#ef4444"/>
    <circle cx="160" cy="70" r="8" fill="#3b82f6"/>
    <text x="80" y="75" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">+</text>
    <text x="160" y="75" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">-</text>
  </svg>
)

const FlowFieldPreview = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full">
    {/* Flow field particles */}
    <path d="M30,100 Q80,80 130,70 Q180,60 230,80" stroke="#666" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <path d="M40,120 Q90,100 140,90 Q190,80 240,100" stroke="#666" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <path d="M35,140 Q85,120 135,110 Q185,100 235,120" stroke="#666" strokeWidth="1.5" fill="none" opacity="0.7"/>
    <path d="M45,160 Q95,140 145,130 Q195,120 245,140" stroke="#666" strokeWidth="1.5" fill="none" opacity="0.7"/>
    {/* Particles */}
    <circle cx="130" cy="70" r="2" fill="#ef4444"/>
    <circle cx="140" cy="90" r="2" fill="#ef4444"/>
    <circle cx="135" cy="110" r="2" fill="#ef4444"/>
    <circle cx="145" cy="130" r="2" fill="#ef4444"/>
    {/* Magnetic poles */}
    <circle cx="70" cy="100" r="10" fill="#8b5cf6" stroke="#fff" strokeWidth="2"/>
    <circle cx="200" cy="100" r="10" fill="#06b6d4" stroke="#fff" strokeWidth="2"/>
  </svg>
)

const TurbulencePreview = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full">
    {/* Turbulent streamlines */}
    <path d="M20,100 Q60,80 100,90 Q140,100 180,85 Q220,70 260,90" stroke="#374151" strokeWidth="1.5" fill="none"/>
    <path d="M25,120 Q65,110 105,115 Q145,120 185,110 Q225,100 265,115" stroke="#374151" strokeWidth="1.5" fill="none"/>
    <path d="M30,80 Q70,60 110,70 Q150,80 190,65 Q230,50 270,70" stroke="#374151" strokeWidth="1.5" fill="none"/>
    {/* Vortex spirals */}
    <path d="M80,60 Q90,50 100,60 Q110,70 100,80 Q90,90 80,80 Q70,70 80,60" stroke="#059669" strokeWidth="2" fill="none"/>
    <path d="M200,120 Q210,110 220,120 Q230,130 220,140 Q210,150 200,140 Q190,130 200,120" stroke="#dc2626" strokeWidth="2" fill="none"/>
    {/* Turbulence sources */}
    <circle cx="90" cy="70" r="6" fill="#059669" opacity="0.8"/>
    <circle cx="210" cy="130" r="6" fill="#dc2626" opacity="0.8"/>
  </svg>
)

const TopographyPreview = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full">
    {/* Contour lines */}
    <ellipse cx="100" cy="80" rx="50" ry="30" fill="none" stroke="#374151" strokeWidth="1"/>
    <ellipse cx="100" cy="80" rx="35" ry="20" fill="none" stroke="#374151" strokeWidth="1.5"/>
    <ellipse cx="100" cy="80" rx="20" ry="12" fill="none" stroke="#374151" strokeWidth="2"/>
    <ellipse cx="220" cy="130" rx="40" ry="25" fill="none" stroke="#374151" strokeWidth="1"/>
    <ellipse cx="220" cy="130" rx="25" ry="15" fill="none" stroke="#374151" strokeWidth="1.5"/>
    {/* Elevation points */}
    <circle cx="100" cy="80" r="8" fill="#8B4513" stroke="#000" strokeWidth="1"/>
    <circle cx="100" cy="80" r="5" fill="#fff"/>
    <polygon points="100,76 97,82 103,82" fill="#8B4513"/>
    <circle cx="220" cy="130" r="8" fill="#4169E1" stroke="#000" strokeWidth="1"/>
    <circle cx="220" cy="130" r="5" fill="#fff"/>
    <polygon points="220,134 217,128 223,128" fill="#4169E1"/>
    {/* Labels */}
    <text x="100" y="100" textAnchor="middle" fontSize="8" fill="#666">Peak</text>
    <text x="220" y="150" textAnchor="middle" fontSize="8" fill="#666">Valley</text>
  </svg>
)

const CircularFieldPreview = () => (
  <svg viewBox="0 0 300 200" className="w-full h-full">
    {/* Circular field lines around left pole */}
    <circle cx="90" cy="100" r="25" fill="none" stroke="#000" strokeWidth="1"/>
    <circle cx="90" cy="100" r="40" fill="none" stroke="#000" strokeWidth="1"/>
    <circle cx="90" cy="100" r="55" fill="none" stroke="#000" strokeWidth="1"/>
    {/* Circular field lines around right pole */}
    <circle cx="210" cy="100" r="25" fill="none" stroke="#000" strokeWidth="1"/>
    <circle cx="210" cy="100" r="40" fill="none" stroke="#000" strokeWidth="1"/>
    <circle cx="210" cy="100" r="55" fill="none" stroke="#000" strokeWidth="1"/>
    {/* Magnetic poles */}
    <circle cx="90" cy="100" r="12" fill="#ef4444" stroke="#000" strokeWidth="2"/>
    <circle cx="210" cy="100" r="12" fill="#3b82f6" stroke="#000" strokeWidth="2"/>
    <text x="90" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">+</text>
    <text x="210" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">−</text>
    {/* Labels */}
    <text x="90" y="130" textAnchor="middle" fontSize="8" fill="#666">North</text>
    <text x="210" y="130" textAnchor="middle" fontSize="8" fill="#666">South</text>
  </svg>
)

const visualizations = [
  {
    title: 'Grid Field',
    path: '/grid-field',
    icon: Grid3X3,
    description: 'Generate structured geometric patterns perfect for packaging backgrounds and brand textures.',
    features: ['Precise grid control', 'Dynamic line patterns', 'Scalable geometry'],
    preview: GridFieldPreview
  },
  {
    title: 'Flow Field',
    path: '/flow-field',
    icon: Magnet,
    description: 'Create flowing, organic patterns ideal for modern brand identities and packaging wraps.',
    features: ['Fluid motion patterns', 'Particle trail effects', 'Organic flow lines'],
    preview: FlowFieldPreview
  },
  {
    title: 'Turbulence',
    path: '/turbulence',
    icon: Wind,
    description: 'Design complex swirling patterns and textures for premium packaging and brand elements.',
    features: ['Vortex pattern generation', 'Turbulent textures', 'Noise-based variation'],
    preview: TurbulencePreview
  },
  {
    title: 'Topography',
    path: '/topography',
    icon: Mountain,
    description: 'Build layered contour patterns for sophisticated packaging design and brand depth.',
    features: ['Layered contour lines', 'Elevation-based patterns', 'Depth visualization'],
    preview: TopographyPreview
  },
  {
    title: 'Circular Field',
    path: '/circular-field',
    icon: Radio,
    description: 'Craft concentric ring patterns and radial designs for logos and circular packaging.',
    features: ['Concentric ring systems', 'Radial pattern control', 'Circular compositions'],
    preview: CircularFieldPreview
  }
]

export default function HomePage() {
  return (
    <AppLayout showNavigation={true} navigationVariant="header">
      {/* Hero Section - Golden ratio proportions */}
      <section className="container mx-auto px-8 py-24 relative overflow-hidden">
        {/* Animated Background */}
        <SuperSaddleBackground />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start relative z-10">
          {/* Main content - 3/5 of width (golden ratio) */}
          <div className="lg:col-span-3">
            <h2 className="text-6xl md:text-7xl font-normal tracking-tight mb-8 text-foreground leading-none">
              Visualization
              <span className="block text-muted-foreground font-light mt-2">Studio</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Professional pattern generation toolkit for creative branding and packaging design. 
              Create unique geometric patterns, flowing textures, and dynamic visual systems with precision control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group w-fit text-base px-8 py-3">
                <Link href="/grid-field">
                  Start Creating
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-fit text-base px-8 py-3">
                <Link href="#tools">
                  Explore Tools
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Side content - 2/5 of width */}
          <div className="lg:col-span-2">
          </div>
        </div>
      </section>

      {/* Tools Section - Structured grid */}
      <section id="tools" className="container mx-auto px-8 py-24">
        <div className="mb-12">
          <h3 className="text-3xl font-normal mb-4 text-foreground">Visualization Tools</h3>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive toolkit for creating sophisticated patterns and textures for professional design applications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visualizations.map((viz) => (
            <Link key={viz.path} href={viz.path} className="block group">
              <Card className="h-full hover:shadow-lg hover:shadow-black/5 transition-all duration-200 cursor-pointer border-2 hover:border-accent group-hover:scale-[1.02]">
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
                  <ul className="space-y-2 mb-4">
                    {viz.features.map((feature, index) => (
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
                    Try Now
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
                  Community Suggestions
                </h3>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Help shape the future of Visualization Studio by suggesting new visualization tools and features. 
              Vote on existing ideas and contribute your own creative concepts.
            </p>
          </div>
          
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 py-3">
                <Link href="/suggestions">
                  View Suggestions
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 py-3">
                <Link href="/suggestions/new">
                  Submit New Idea
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
              About Visualization Studio
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-medium mb-3 text-foreground">Professional Pattern Generation</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Visualization Studio provides a comprehensive toolkit for creating sophisticated patterns and textures. 
                  Whether you're designing packaging, branding materials, or digital assets, our tools offer the precision 
                  and flexibility needed for professional results.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Each visualization tool is designed with both creative freedom and technical precision in mind, 
                allowing you to explore endless possibilities while maintaining control over every aspect of your design.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-medium mb-4 text-foreground">Powered by H23</h4>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Developed by <a href="https://h23.fi" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors font-medium">H23</a>, 
              a creative technology agency that specializes in building digital tools and experiences for ambitious brands.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our expertise in creative technology, branding, and interactive experiences informs every aspect 
              of Visualization Studio, ensuring it meets the needs of professional designers and creative teams.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  )
} 