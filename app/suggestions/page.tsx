'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Lightbulb, ThumbsUp, ThumbsDown, MessageSquare, Calendar, X, Filter, SortAsc, User, FileText, Tag, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { SuggestionsNavigation, SuggestionsMobileNavigation } from '@/components/navigation/PageNavigation'
import Link from 'next/link'

interface Suggestion {
  id: string
  title: string
  description: string
  author: string
  timestamp: Date
  upvotes: number
  downvotes: number
  status: 'pending' | 'approved' | 'implemented' | 'rejected'
  category: string
  complexity: 'low' | 'medium' | 'high'
}

const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    title: 'Fractal Tree Generator',
    description: 'Create branching fractal trees with customizable parameters like branch angle, length ratio, and recursion depth. Perfect for organic pattern generation.',
    author: 'Creative Designer',
    timestamp: new Date('2024-01-15'),
    upvotes: 12,
    downvotes: 2,
    status: 'approved',
    category: 'Organic',
    complexity: 'medium'
  },
  {
    id: '2',
    title: 'Wave Interference Patterns',
    description: 'Simulate wave interference with multiple wave sources. Show constructive and destructive interference patterns with real-time parameter adjustment.',
    author: 'Physics Enthusiast',
    timestamp: new Date('2024-01-10'),
    upvotes: 8,
    downvotes: 1,
    status: 'pending',
    category: 'Physics',
    complexity: 'high'
  },
  {
    id: '3',
    title: 'Particle Swarm Optimization',
    description: 'Visualize particle swarm behavior with customizable fitness functions. Show particles converging to optimal solutions in real-time.',
    author: 'Algorithm Designer',
    timestamp: new Date('2024-01-08'),
    upvotes: 15,
    downvotes: 0,
    status: 'implemented',
    category: 'Algorithm',
    complexity: 'high'
  },
  {
    id: '4',
    title: 'Geometric Tessellation',
    description: 'Create repeating geometric patterns with customizable shapes and colors. Support for various tessellation types like regular, semi-regular, and aperiodic.',
    author: 'Pattern Designer',
    timestamp: new Date('2024-01-05'),
    upvotes: 6,
    downvotes: 3,
    status: 'pending',
    category: 'Geometric',
    complexity: 'medium'
  },
  {
    id: '5',
    title: 'Neural Network Visualization',
    description: 'Interactive visualization of neural network architectures with real-time training visualization and layer-by-layer activation patterns.',
    author: 'AI Researcher',
    timestamp: new Date('2024-01-03'),
    upvotes: 20,
    downvotes: 1,
    status: 'approved',
    category: 'Algorithm',
    complexity: 'high'
  },
  {
    id: '6',
    title: 'Fluid Dynamics Simulation',
    description: 'Real-time fluid simulation with customizable viscosity, temperature, and pressure parameters. Perfect for scientific visualization.',
    author: 'Physics Professor',
    timestamp: new Date('2024-01-01'),
    upvotes: 18,
    downvotes: 2,
    status: 'pending',
    category: 'Physics',
    complexity: 'high'
  },
  {
    id: '7',
    title: 'Mandelbrot Set Explorer',
    description: 'Interactive exploration of the Mandelbrot set with zoom capabilities, color mapping, and parameter adjustment.',
    author: 'Mathematician',
    timestamp: new Date('2023-12-28'),
    upvotes: 14,
    downvotes: 0,
    status: 'implemented',
    category: 'Mathematical',
    complexity: 'medium'
  },
  {
    id: '8',
    title: 'DNA Helix Visualization',
    description: '3D visualization of DNA structure with customizable base pairs, rotation, and molecular dynamics simulation.',
    author: 'Biologist',
    timestamp: new Date('2023-12-25'),
    upvotes: 9,
    downvotes: 4,
    status: 'pending',
    category: 'Scientific',
    complexity: 'high'
  }
]

const categories = [
  'Organic', 'Geometric', 'Physics', 'Algorithm', 'Abstract', 'Mathematical', 'Artistic', 'Scientific'
]

const complexityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-red-500/10 text-red-700 dark:text-red-300' }
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  approved: { label: 'Approved', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  implemented: { label: 'Implemented', color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-700 dark:text-red-300' }
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterComplexity, setFilterComplexity] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'title'>('score')

  const handleUpvote = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s)
    )
  }

  const handleDownvote = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, downvotes: s.downvotes + 1 } : s)
    )
  }

  const filteredSuggestions = suggestions
    .filter(s => {
      const categoryMatch = !filterCategory || s.category === filterCategory
      const complexityMatch = !filterComplexity || s.complexity === filterComplexity
      return categoryMatch && complexityMatch
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const aScore = a.upvotes - a.downvotes
        const bScore = b.upvotes - b.downvotes
        return bScore - aScore
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

  const positiveSuggestions = filteredSuggestions.filter(s => (s.upvotes - s.downvotes) >= 0)
  const negativeSuggestions = filteredSuggestions.filter(s => (s.upvotes - s.downvotes) < 0)

  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {/* Page Navigation */}
        <SuggestionsMobileNavigation />
        <div className="hidden md:block">
          <SuggestionsNavigation />
        </div>
        {/* Main Content */}
        <div className="container mx-auto px-8 py-8">
          {/* Add Suggestion Button */}
          <div className="mb-8">
            <Link href="/suggestions/new" className="block">
              <Button 
                className="w-full h-14 text-base font-light tracking-wide hover:bg-accent transition-all duration-300 group"
                variant="outline"
              >
                <Plus className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground" />
                Suggest New Visualization
              </Button>
            </Link>
          </div>

          {/* Filter Controls */}
          <div className="mb-8 p-6 bg-card rounded-lg border">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Filters</span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-10 px-4 border border-input bg-background text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select
                  value={filterComplexity}
                  onChange={(e) => setFilterComplexity(e.target.value)}
                  className="h-10 px-4 border border-input bg-background text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md"
                >
                  <option value="">All Complexities</option>
                  {complexityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'title')}
                  className="h-10 px-4 border border-input bg-background text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md"
                >
                  <option value="score">Sort by Score</option>
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                </select>
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-lg font-light text-foreground">
                  {positiveSuggestions.length} Popular Suggestions
                  {negativeSuggestions.length > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      • {negativeSuggestions.length} Less Popular
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              {positiveSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-8 hover:bg-accent/50 transition-all duration-300">
                  <div className="flex items-start space-x-6">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center space-y-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(suggestion.id)}
                        className="w-12 h-12 p-0 hover:bg-accent transition-all duration-300"
                      >
                        <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                      </Button>
                      <div className="text-center">
                        <div className="text-lg font-light text-foreground">
                          {suggestion.upvotes - suggestion.downvotes > 0 ? '+' : ''}
                          {suggestion.upvotes - suggestion.downvotes}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.upvotes}↑ {suggestion.downvotes}↓
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownvote(suggestion.id)}
                        className="w-12 h-12 p-0 hover:bg-accent transition-all duration-300"
                      >
                        <ThumbsDown className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-foreground mb-2">
                            {suggestion.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{suggestion.author}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {suggestion.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        
                        <Badge variant="outline">
                          {suggestion.category}
                        </Badge>
                        
                        <Badge className={cn(
                          complexityLevels.find(l => l.value === suggestion.complexity)?.color
                        )}>
                          {complexityLevels.find(l => l.value === suggestion.complexity)?.label}
                        </Badge>
                        
                        <Badge className={cn(
                          statusConfig[suggestion.status].color
                        )}>
                          {statusConfig[suggestion.status].label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Negative Suggestions Section */}
              {negativeSuggestions.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                      <ThumbsDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Less Popular Suggestions ({negativeSuggestions.length})
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {negativeSuggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="p-4 hover:bg-accent/50 transition-all duration-300">
                        <div className="flex items-start space-x-4">
                          {/* Vote Section - Smaller */}
                          <div className="flex flex-col items-center space-y-1 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(suggestion.id)}
                              className="w-8 h-8 p-0 hover:bg-accent transition-all duration-300"
                            >
                              <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                            </Button>
                            <div className="text-center">
                              <div className="text-sm font-light text-muted-foreground">
                                {suggestion.upvotes - suggestion.downvotes}
                              </div>
                              <div className="text-xs text-muted-foreground/60">
                                {suggestion.upvotes}↑ {suggestion.downvotes}↓
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownvote(suggestion.id)}
                              className="w-8 h-8 p-0 hover:bg-accent transition-all duration-300"
                            >
                              <ThumbsDown className="w-3 h-3 text-muted-foreground" />
                            </Button>
                          </div>
                          
                          {/* Content Section - Smaller */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-base font-light text-foreground mb-1">
                                  {suggestion.title}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{suggestion.author}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {suggestion.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              
                              <Badge className={cn(
                                'text-xs',
                                complexityLevels.find(l => l.value === suggestion.complexity)?.color
                              )}>
                                {complexityLevels.find(l => l.value === suggestion.complexity)?.label}
                              </Badge>
                              
                              <Badge className={cn(
                                'text-xs',
                                statusConfig[suggestion.status].color
                              )}>
                                {statusConfig[suggestion.status].label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {filteredSuggestions.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-light text-muted-foreground mb-2">No suggestions found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or be the first to suggest a new visualization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 