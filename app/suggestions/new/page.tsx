'use client'

import React, { useState } from 'react'
import { ArrowLeft, Lightbulb, Sparkles, Palette, Zap, Target, Layers, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import VisualizationLayout from '@/components/layout/VisualizationLayout'
import Link from 'next/link'

const categories = [
  'Organic', 'Geometric', 'Physics', 'Algorithm', 'Abstract', 'Mathematical', 'Artistic', 'Scientific'
]

const complexityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
]

const visualizationTypes = [
  {
    icon: Palette,
    title: 'Pattern Generation',
    description: 'Repeating motifs, tessellations, and geometric designs',
    examples: ['Fractal patterns', 'Islamic geometric art', 'Cellular automata', 'Tiling systems']
  },
  {
    icon: Zap,
    title: 'Dynamic Systems',
    description: 'Animated and interactive visualizations',
    examples: ['Particle systems', 'Wave simulations', 'Fluid dynamics', 'Reaction-diffusion']
  },
  {
    icon: Target,
    title: 'Data Visualization',
    description: 'Representing data through visual means',
    examples: ['Network graphs', 'Tree structures', 'Heat maps', 'Scatter plots']
  },
  {
    icon: Layers,
    title: '3D & Depth',
    description: 'Multi-dimensional and spatial visualizations',
    examples: ['Topographic maps', '3D surfaces', 'Depth fields', 'Volumetric data']
  },
  {
    icon: Globe,
    title: 'Natural Phenomena',
    description: 'Simulations of natural processes and systems',
    examples: ['Weather patterns', 'Ecosystem dynamics', 'Geological formations', 'Astronomical objects']
  },
  {
    icon: Sparkles,
    title: 'Abstract Art',
    description: 'Non-representational and artistic visualizations',
    examples: ['Generative art', 'Color field theory', 'Composition studies', 'Texture generation']
  }
]

export default function NewSuggestionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    complexity: 'medium' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('New suggestion submitted:', formData)
    
    // For now, just redirect back to suggestions page
    window.location.href = '/suggestions'
  }

  const settingsContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Submit New Suggestion</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share your visualization idea with the community.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter visualization title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your visualization idea in detail..."
              rows={6}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="author">Your Name *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-border rounded-md bg-background"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="complexity">Complexity *</Label>
            <select
              id="complexity"
              value={formData.complexity}
              onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as any }))}
              className="w-full p-2 border border-border rounded-md bg-background"
              required
            >
              {complexityLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <Button type="submit" className="w-full">
            Submit Suggestion
          </Button>
        </form>
      </div>
    </div>
  )

  return (
    <VisualizationLayout
      settingsContent={settingsContent}
      showVisualizationNav={true}
      visualizationNavProps={{
        showBackButton: true,
        backButtonText: 'Back to Suggestions',
        backButtonFallbackPath: '/suggestions'
      }}
    >
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Suggest New Visualization</h1>
              <p className="text-muted-foreground">
                Share your creative ideas for new visualization tools
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {/* Inspiration Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">What Kinds of Visualizations Can We Create?</h2>
              <p className="text-muted-foreground mb-6">
                Visualization Studio is designed to generate sophisticated patterns and textures for creative applications. 
                Here are some categories of visualizations that could be implemented:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visualizationTypes.map((type, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <type.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{type.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {type.examples.map((example, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Guidelines Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Suggestion Guidelines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">What Makes a Good Suggestion</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clear and specific visualization concept</li>
                    <li>• Practical applications in design or branding</li>
                    <li>• Feasible to implement with current technology</li>
                    <li>• Unique or innovative approach</li>
                    <li>• Detailed description of parameters and controls</li>
                  </ul>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Current Capabilities</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time parameter adjustment</li>
                    <li>• Export to SVG format</li>
                    <li>• Color and theme customization</li>
                    <li>• Mobile-responsive design</li>
                    <li>• Interactive controls and sliders</li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* Examples Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Example Suggestions</h2>
              <div className="space-y-3">
                <Card className="p-4">
                  <h3 className="font-medium mb-1">"Fractal Tree Generator"</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create branching fractal trees with customizable parameters like branch angle, length ratio, and recursion depth. 
                    Perfect for organic pattern generation and natural texture creation.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">Organic</Badge>
                    <Badge variant="outline" className="text-xs">Medium Complexity</Badge>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-1">"Wave Interference Patterns"</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Simulate wave interference with multiple wave sources. Show constructive and destructive interference patterns 
                    with real-time parameter adjustment for scientific and artistic applications.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">Physics</Badge>
                    <Badge variant="outline" className="text-xs">High Complexity</Badge>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizationLayout>
  )
} 