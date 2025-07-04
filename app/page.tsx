'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Grid3X3, Magnet, Wind, Mountain, Radio, Sparkles, Download, Play, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/layout/AppLayout'

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
      {/* Hero Section */}
      <section className="container mx-auto px-8 py-32">
        <div className="max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-normal tracking-tight mb-12 text-foreground leading-none">
            Visualization
            <span className="block text-muted-foreground font-light">Studio</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-16 leading-relaxed max-w-3xl">
            Professional pattern generation toolkit for creative branding and packaging design. 
            Create unique geometric patterns, flowing textures, and dynamic visual systems with precision control.
          </p>
          <p className="text-base text-muted-foreground mb-12 max-w-2xl">
            Visualization Studio is designed and developed by <a href="https://h23.fi" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors font-medium">H23</a>, a creative technology agency specializing in digital tools, branding, and interactive experiences for ambitious brands.
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
      <section id="tools" className="container mx-auto px-8 py-24">
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
                  <ul className="space-y-2">
                    {viz.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <Sparkles className="w-3 h-3 mr-2 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Button asChild size="lg" className="px-8 py-4 text-base font-semibold">
            <Link href="/suggestions">
              Suggest a New Visualization
            </Link>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-normal mb-8 text-foreground">
            About Visualization Studio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xl font-medium mb-4 text-foreground">Professional Pattern Generation</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Visualization Studio provides a comprehensive toolkit for creating sophisticated patterns and textures. 
                Whether you're designing packaging, branding materials, or digital assets, our tools offer the precision 
                and flexibility needed for professional results.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Each visualization tool is designed with both creative freedom and technical precision in mind, 
                allowing you to explore endless possibilities while maintaining control over every aspect of your design.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-medium mb-4 text-foreground">Powered by H23</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Developed by <a href="https://h23.fi" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors font-medium">H23</a>, 
                a creative technology agency that specializes in building digital tools and experiences for ambitious brands.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our expertise in creative technology, branding, and interactive experiences informs every aspect 
                of Visualization Studio, ensuring it meets the needs of professional designers and creative teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section id="suggestions" className="container mx-auto px-8 py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Lightbulb className="w-8 h-8 text-primary mr-3" />
            <h3 className="text-3xl md:text-4xl font-normal text-foreground">
              Community Suggestions
            </h3>
          </div>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help shape the future of Visualization Studio by suggesting new visualization tools and features. 
            Vote on existing ideas and contribute your own creative concepts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>
    </AppLayout>
  )
} 