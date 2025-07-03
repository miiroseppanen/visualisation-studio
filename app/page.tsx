'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Grid3X3, Magnet, Sparkles, Code, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <h1 className="text-lg font-normal">Magnetic Field Studio</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/grid-field" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Grid Field
              </Link>
              <Link href="/flow-field" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Flow Field
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-normal tracking-tight mb-8 text-foreground">
            Magnetic
            <span className="block text-muted-foreground font-light">Field Studio</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl">
            Design and test interactive SVG illustrations of magnetic fields. 
            Build grid patterns and flow fields that respond to magnetic poles in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="group w-fit">
              <Link href="/grid-field">
                Start Creating
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-fit">
              <Link href="#visualizations">
                View Examples
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Visualizations Section */}
      <section id="visualizations" className="container mx-auto px-4 py-24">
        <div className="mb-16">
          <h3 className="text-3xl font-normal mb-4">Visualization Tools</h3>
          <p className="text-muted-foreground max-w-2xl">Two powerful tools for creating magnetic field illustrations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl">
          {/* Grid Field Card */}
          <Card className="group hover:shadow-sm transition-all duration-200 border-border/30 hover:border-border/60">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center">
                  <Grid3X3 className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-normal">Grid Field</CardTitle>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Create a field of lines that respond to magnetic poles. 
                Each line is pulled toward the direction you set.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted/30 rounded-sm grid-field-preview flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <Grid3X3 className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Interactive Grid Preview</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Code className="w-4 h-4" />
                  <span>SVG-based</span>
                </div>
                <Button asChild variant="outline" className="group">
                  <Link href="/grid-field">
                    <Play className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                    Open Grid Field
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Flow Field Card */}
          <Card className="group hover:shadow-sm transition-all duration-200 border-border/30 hover:border-border/60">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center">
                  <Magnet className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-normal">Flow Field</CardTitle>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Design magnetic field illustrations with custom poles and 
                interactive particle systems.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted/30 rounded-sm magnetic-field-preview flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <Magnet className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Magnetic Field Preview</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Code className="w-4 h-4" />
                  <span>SVG-based</span>
                </div>
                <Button asChild variant="outline" className="group">
                  <Link href="/flow-field">
                    <Play className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                    Open Flow Field
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-16">
          <h3 className="text-3xl font-normal mb-4">Design Principles</h3>
          <p className="text-muted-foreground max-w-2xl">Built for creators who want precision and performance</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl">
          <div className="space-y-6">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-normal text-lg">Real-time Preview</h4>
            <p className="text-muted-foreground leading-relaxed">
              See your changes instantly as you adjust parameters and magnetic poles.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-normal text-lg">SVG Export</h4>
            <p className="text-muted-foreground leading-relaxed">
              Export your illustrations as scalable vector graphics for any use case.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-normal text-lg">Interactive Testing</h4>
            <p className="text-muted-foreground leading-relaxed">
              Test your magnetic field behavior with interactive controls and real-time feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-muted-foreground">
            <p>Magnetic Field Studio — Create precise visualizations</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 