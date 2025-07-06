'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Lightbulb, ThumbsUp, ThumbsDown, MessageSquare, Calendar, X, Filter, SortAsc, User, FileText, Tag, Zap, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { NewSuggestionNavigation, NewSuggestionMobileNavigation } from '@/components/navigation/PageNavigation'
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

const categories = [
  'Organic', 'Geometric', 'Physics', 'Algorithm', 'Abstract', 'Mathematical', 'Artistic', 'Scientific'
]

const complexityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-red-500/10 text-red-700 dark:text-red-300' }
]

export default function NewSuggestionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    complexity: 'medium' as const
  })
  
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on the title field when the component mounts
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically submit to your backend
    console.log('Submitting suggestion:', formData)
    
    // For now, just redirect back to suggestions page
    window.location.href = '/suggestions'
  }

  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {/* Page Navigation */}
        <NewSuggestionMobileNavigation />
        <div className="hidden md:block">
          <NewSuggestionNavigation />
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmitSuggestion} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="title" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Title</span>
                  </Label>
                  <Input
                    ref={titleInputRef}
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter visualization title"
                    className="h-14 text-base font-light focus:ring-2 focus:ring-ring/20"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="author" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Your Name</span>
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter your name"
                    className="h-14 text-base font-light focus:ring-2 focus:ring-ring/20"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Description</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your visualization idea in detail..."
                  rows={5}
                  className="text-base font-light resize-none focus:ring-2 focus:ring-ring/20"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="category" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>Category</span>
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-14 text-base font-light px-4 border border-input bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="complexity" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>Complexity</span>
                  </Label>
                  <select
                    id="complexity"
                    value={formData.complexity}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as any }))}
                    className="w-full h-14 text-base font-light px-4 border border-input bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md"
                    required
                  >
                    {complexityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-8 border-t border-border">
                <Link href="/suggestions">
                  <Button 
                    type="button" 
                    className="h-16 px-8 text-lg font-medium tracking-wide hover:bg-accent transition-all duration-300"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 h-16 text-lg font-medium tracking-wide bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Submit Suggestion
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 