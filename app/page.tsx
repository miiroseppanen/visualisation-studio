'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Grid3X3, Magnet, Wind, Mountain, Radio, Sparkles, Download, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    description: 'Create structured line fields that respond to magnetic poles with precise geometric control.',
    features: ['Magnetic pole interaction', 'Customizable line patterns', 'Real-time field updates'],
    preview: GridFieldPreview
  },
  {
    title: 'Flow Field',
    path: '/flow-field',
    icon: Magnet,
    description: 'Design flowing magnetic field illustrations with dynamic particle systems.',
    features: ['Interactive magnetic poles', 'Particle flow visualization', 'Field line generation'],
    preview: FlowFieldPreview
  },
  {
    title: 'Turbulence',
    path: '/turbulence',
    icon: Wind,
    description: 'Explore turbulent flow patterns with vortices, noise, and complex fluid dynamics.',
    features: ['Multiple turbulence sources', 'Streamline visualization', 'Noise-based variation'],
    preview: TurbulencePreview
  },
  {
    title: 'Topography',
    path: '/topography',
    icon: Mountain,
    description: 'Generate precise topographic contour lines from elevation points and terrain features.',
    features: ['Elevation point control', 'Contour line generation', 'Terrain visualization'],
    preview: TopographyPreview
  },
  {
    title: 'Circular Field',
    path: '/circular-field',
    icon: Radio,
    description: 'Visualize circular magnetic field lines around poles with concentric ring patterns.',
    features: ['Concentric circle generation', 'Pole interaction effects', 'Animation controls'],
    preview: CircularFieldPreview
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <h1 className="text-xl font-normal">Visualization Studio</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {visualizations.map(viz => (
                <Link 
                  key={viz.path}
                  href={viz.path} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {viz.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-8 py-32">
        <div className="max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-normal tracking-tight mb-12 text-foreground leading-none">
            Visualization
            <span className="block text-muted-foreground font-light">Studio</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-16 leading-relaxed max-w-3xl">
            Professional tools for creating precise scientific and mathematical visualizations. 
            Build interactive field patterns, flow dynamics, and topographic maps with real-time controls.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
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
      </section>

      {/* Tools Section */}
      <section id="tools" className="container mx-auto px-8 py-32">
        <div className="mb-20">
          <h3 className="text-4xl font-normal mb-6">Visualization Tools</h3>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Five specialized tools for creating professional scientific and mathematical visualizations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl">
          {visualizations.map((viz) => {
            const Icon = viz.icon
            const PreviewComponent = viz.preview
            return (
              <Link key={viz.path} href={viz.path} className="block group">
                <Card className="hover:shadow-sm transition-all duration-300 border-border/30 hover:border-border/60 cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-normal">{viz.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      {viz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-[3/2] bg-muted/20 rounded border border-border/20 overflow-hidden">
                      <PreviewComponent />
                    </div>
                    
                    <div className="space-y-2">
                      {viz.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Download className="w-3 h-3" />
                        <span>SVG Export</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        <span>Open Tool</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Principles Section */}
      <section className="container mx-auto px-8 py-32">
        <div className="mb-20">
          <h3 className="text-4xl font-normal mb-6">Design Principles</h3>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Built with precision, clarity, and functionality at the core
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 max-w-6xl">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-normal text-xl">Real-time Feedback</h4>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Immediate visual response to parameter changes enables rapid iteration and precise control.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-normal text-xl">Vector Output</h4>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Export high-quality SVG files that scale infinitely while maintaining crisp lines and precision.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-normal text-xl">Interactive Control</h4>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Direct manipulation of visual elements provides intuitive workflow and immediate understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="container mx-auto px-8 py-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <p className="text-muted-foreground">Visualization Studio</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Precision tools for scientific visualization
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 