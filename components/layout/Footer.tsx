import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ui/ThemeProvider'

// Footer Background Animation Component
const FooterBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { theme } = useTheme()
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
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

    // Mathematical line functions (simplified for footer)
    const harmonicFunction = (x: number, y: number, t: number) => {
      const scale = 0.008
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      return Math.sin(xScaled + t * 0.2) * Math.cos(yScaled + t * 0.15) * 
             Math.sin(Math.sqrt(xScaled * xScaled + yScaled * yScaled) + t * 0.1)
    }

    const fractalFunction = (x: number, y: number, t: number) => {
      const scale = 0.006
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      return Math.sin(xScaled * 2 + t * 0.3) * Math.cos(yScaled * 2 + t * 0.25) * 
             Math.sin(xScaled * yScaled + t * 0.15)
    }

    const spiralFunction = (x: number, y: number, t: number) => {
      const scale = 0.01
      const xScaled = (x - canvas.width / 2) * scale
      const yScaled = (y - canvas.height / 2) * scale
      
      const angle = Math.atan2(yScaled, xScaled)
      const radius = Math.sqrt(xScaled * xScaled + yScaled * yScaled)
      
      return Math.sin(angle * 3 + radius * 2 + t * 0.2) * Math.cos(radius + t * 0.15)
    }

    // Get current theme
    const getCurrentTheme = () => {
      if (theme === 'dark') return 'dark'
      if (theme === 'light') return 'light'
      if (theme === 'pastel') return 'pastel'
      if (!window.matchMedia) return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    // Create mathematical lines
    const createLine = (x: number, y: number, type: 'harmonic' | 'fractal' | 'spiral') => {
      const angle = Math.random() * Math.PI * 2
      const length = 30 + Math.random() * 60 // Shorter lines for footer
      
      lines.push({
        x1: x,
        y1: y,
        x2: x + Math.cos(angle) * length,
        y2: y + Math.sin(angle) * length,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.4,
        type
      })
    }

    // Initialize lines - fewer for footer
    for (let i = 0; i < 20; i++) {
      createLine(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        ['harmonic', 'fractal', 'spiral'][Math.floor(Math.random() * 3)] as any
      )
    }

    // Animation loop
    const animate = (currentTime: number) => {
      // Frame rate control - limit to 24 FPS for footer
      if (currentTime - lastTimeRef.current < 42) { // ~24 FPS
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      time += Math.min(deltaTime * 0.001, 0.042)
      frameCountRef.current++
      
      const currentTheme = getCurrentTheme()

      if (!ctx || !canvas) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Clear canvas with theme-appropriate background
      let bgColor: string
      if (currentTheme === 'dark') {
        bgColor = '#000000' // Full black for dark theme
      } else if (currentTheme === 'pastel') {
        bgColor = '#ffffff' // Full white for pastel theme
      } else {
        bgColor = '#ffffff' // Full white for light theme
      }
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw lines
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]
        line.life -= 0.01

        if (line.life <= 0) {
          lines.splice(i, 1)
          continue
        }

        const alpha = line.life / line.maxLife
        let strokeColor: string
        
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
        ctx.lineWidth = 0.6 // Thinner lines for footer
        ctx.globalAlpha = alpha * 0.3 // Lower opacity for subtle effect

        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()
      }

      // Create new lines - reduced frequency
      if (lines.length < 25 && frameCountRef.current % 6 === 0) {
        for (let i = 0; i < 1; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          
          const harmonic = harmonicFunction(x, y, time)
          const fractal = fractalFunction(x, y, time)
          const spiral = spiralFunction(x, y, time)
          
          const maxValue = Math.max(Math.abs(harmonic), Math.abs(fractal), Math.abs(spiral))
          
          if (maxValue > 0.5) {
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
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-30"
    />
  )
}

export default function Footer() {
  return (
    <footer className="relative bg-background border-t border-border/20 mt-20 overflow-hidden">
      {/* Background Animation */}
      <FooterBackground />
      
      {/* Content with relative positioning */}
      <div className="relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Visualisointi Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional pattern generation toolkit for creative branding and packaging design.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://h23.fi/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-sm font-medium">H23</span>
              </a>
              <span className="text-muted-foreground/40">•</span>
              <a 
                href="https://www.linkedin.com/company/h23" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-sm">LinkedIn</span>
              </a>
              <span className="text-muted-foreground/40">•</span>
              <a 
                href="https://www.instagram.com/h23agency" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-sm">Instagram</span>
              </a>
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/grid-field" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Grid Field
                </Link>
              </li>
              <li>
                <Link href="/flow-field" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Flow Field
                </Link>
              </li>
              <li>
                <Link href="/circular-field" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Circular Field
                </Link>
              </li>
              <li>
                <Link href="/wave-interference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Wave Interference
                </Link>
              </li>
              <li>
                <Link href="/wave-interference-2" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Wave Interference 2
                </Link>
              </li>
              <li>
                <Link href="/particle-swarm" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Particle Swarm
                </Link>
              </li>
              <li>
                <Link href="/neural-network" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Neural Network
                </Link>
              </li>
              <li>
                <Link href="/cellular-automata" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cellular Automata
                </Link>
              </li>
              <li>
                <Link href="/sound-wave" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sound Wave
                </Link>
              </li>
              <li>
                <Link href="/topography" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Topography
                </Link>
              </li>
              <li>
                <Link href="/turbulence" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Turbulence
                </Link>
              </li>
              <li>
                <Link href="/mathematical-lines" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mathematical Lines
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/suggestions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Suggestions
                </Link>
              </li>
              <li>
                <Link href="/suggestions/new" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Submit Idea
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/miiroseppanen/visualisation-studio.git" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://h23.fi/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  H23 Agency
                </a>
              </li>
              <li>
                <a 
                  href="https://h23.fi/work" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Work
                </a>
              </li>
              <li>
                <a 
                  href="https://h23.fi/info" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/20 mt-8 sm:mt-12 pt-8 sm:pt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 Visualisointi Studio. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  )
} 