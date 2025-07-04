'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Lightbulb, ThumbsUp, MessageSquare, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import VisualizationLayout from '@/components/layout/VisualizationLayout'

interface Suggestion {
  id: string
  title: string
  description: string
  author: string
  timestamp: Date
  votes: number
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
    votes: 12,
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
    votes: 8,
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
    votes: 15,
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
    votes: 6,
    status: 'pending',
    category: 'Geometric',
    complexity: 'medium'
  }
]

const categories = [
  'Organic', 'Geometric', 'Physics', 'Algorithm', 'Abstract', 'Mathematical', 'Artistic', 'Scientific'
]

const complexityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  implemented: { label: 'Implemented', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'votes' | 'date'>('votes')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    complexity: 'medium' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSuggestion: Suggestion = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      author: formData.author,
      timestamp: new Date(),
      votes: 0,
      status: 'pending',
      category: formData.category,
      complexity: formData.complexity
    }
    
    setSuggestions(prev => [newSuggestion, ...prev])
    setFormData({
      title: '',
      description: '',
      author: '',
      category: '',
      complexity: 'medium'
    })
    setShowForm(false)
  }

  const handleVote = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s)
    )
  }

  const filteredSuggestions = suggestions
    .filter(s => filter === 'all' || s.status === filter)
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

  const settingsContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Suggestions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share your visualization ideas and vote on existing suggestions.
        </p>
        
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Suggest New Visualization'}
        </Button>

        {showForm && (
          <Card className="p-4 mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter visualization title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your visualization idea..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="author">Your Name</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
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
                <Label htmlFor="complexity">Complexity</Label>
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
          </Card>
        )}
      </div>

      <div>
        <h4 className="font-medium mb-2">Filter & Sort</h4>
        <div className="space-y-2">
          <div>
            <Label htmlFor="filter">Filter by Status</Label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Suggestions</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="implemented">Implemented</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="sort">Sort by</Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              <option value="votes">Most Voted</option>
              <option value="date">Newest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <VisualizationLayout
      settingsContent={settingsContent}
      showVisualizationNav={true}
      visualizationNavProps={{
        showBackButton: true,
        backButtonText: 'Home',
        backButtonFallbackPath: '/'
      }}
    >
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Visualization Suggestions</h1>
              <p className="text-muted-foreground">
                Share ideas and vote on new visualizations
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium">{suggestion.title}</h3>
                      <Badge className={cn(statusConfig[suggestion.status].color)}>
                        {statusConfig[suggestion.status].label}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{suggestion.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{suggestion.timestamp.toLocaleDateString()}</span>
                      </div>
                      <Badge variant="outline">{suggestion.category}</Badge>
                      <Badge className={cn(
                        complexityLevels.find(l => l.value === suggestion.complexity)?.color
                      )}>
                        {complexityLevels.find(l => l.value === suggestion.complexity)?.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(suggestion.id)}
                      className="flex flex-col items-center p-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{suggestion.votes}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No suggestions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </VisualizationLayout>
  )
} 