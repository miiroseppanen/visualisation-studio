'use client'

import React, { useState, useRef } from 'react'
import { Bug, Plus, Lightbulb, Zap, ArrowLeft, FileText, User, Tag, AlertTriangle, MessageSquare, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { IssueNavigation, IssueMobileNavigation } from '@/components/navigation/IssueNavigation'
import Link from 'next/link'

const issueTypes = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-500/10 text-red-700 dark:text-red-300', description: 'Report a problem or unexpected behavior' },
  { value: 'feature', label: 'Feature Request', icon: Plus, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300', description: 'Request a new feature or functionality' },
  { value: 'improvement', label: 'Improvement', icon: Zap, color: 'bg-green-500/10 text-green-700 dark:text-green-300', description: 'Suggest an improvement to existing features' },
  { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300', description: 'Share a creative idea or concept' }
]

const categories = [
  'Rendering', 'Performance', 'UI/UX', 'Graphics', 'Collaboration', 'Export', 'Memory', 'Onboarding', 'API', 'Documentation', 'Mobile', 'Desktop', 'Accessibility'
]

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-500/10 text-gray-700 dark:text-gray-300', description: 'Nice to have, not urgent' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300', description: 'Important but not blocking' },
  { value: 'high', label: 'High', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300', description: 'Important and should be addressed soon' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/10 text-red-700 dark:text-red-300', description: 'Blocking issue that needs immediate attention' }
]

export default function NewIssuePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    type: 'bug' as const,
    category: '',
    priority: 'medium' as const,
    steps: '',
    expected: '',
    actual: '',
    environment: '',
    attachments: [] as File[]
  })

  const titleInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting issue:', formData)
    // Here you would typically submit to your backend
    window.location.href = '/issues'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const selectedType = issueTypes.find(t => t.value === formData.type)
  const selectedPriority = priorities.find(p => p.value === formData.priority)

  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {/* Page Navigation */}
        <IssueMobileNavigation />
        <div className="hidden md:block">
          <IssueNavigation />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Issue Type Selection */}
              <Card className="p-6">
                <Label className="text-base font-medium mb-4 block">Issue Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issueTypes.map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                        className={cn(
                          "p-4 border rounded-lg text-left transition-all duration-200",
                          formData.type === type.value
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/50 hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn("p-2 rounded-md", type.color)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>

              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Brief, descriptive title"
                      className="h-12 text-base"
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
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>Description</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a detailed description of the issue, feature request, or idea..."
                    rows={6}
                    className="text-base resize-none"
                    required
                  />
                </div>
              </Card>

              {/* Classification */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Classification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="category" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                      <Tag className="w-4 h-4" />
                      <span>Category</span>
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-12 text-base px-4 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {priorities.map(priority => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                          className={cn(
                            "p-3 border rounded-md text-sm transition-all duration-200",
                            formData.priority === priority.value
                              ? "border-foreground bg-foreground/5"
                              : "border-border hover:border-foreground/50"
                          )}
                        >
                          <div className="font-medium">{priority.label}</div>
                          <div className="text-xs text-muted-foreground">{priority.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="environment" className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Environment</span>
                    </Label>
                    <Input
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                      placeholder="Browser, OS, device, etc."
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </Card>

              {/* Bug-specific fields */}
              {formData.type === 'bug' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Bug Details</h2>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="steps" className="text-sm font-medium text-muted-foreground">
                        Steps to Reproduce
                      </Label>
                      <Textarea
                        id="steps"
                        value={formData.steps}
                        onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                        rows={4}
                        className="text-base resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="expected" className="text-sm font-medium text-muted-foreground">
                          Expected Behavior
                        </Label>
                        <Textarea
                          id="expected"
                          value={formData.expected}
                          onChange={(e) => setFormData(prev => ({ ...prev, expected: e.target.value }))}
                          placeholder="What should happen?"
                          rows={3}
                          className="text-base resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="actual" className="text-sm font-medium text-muted-foreground">
                          Actual Behavior
                        </Label>
                        <Textarea
                          id="actual"
                          value={formData.actual}
                          onChange={(e) => setFormData(prev => ({ ...prev, actual: e.target.value }))}
                          placeholder="What actually happens?"
                          rows={3}
                          className="text-base resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Attachments */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Attachments</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Add Files</span>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Screenshots, logs, or other relevant files
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.txt,.log,.json"
                  />

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Submit */}
              <div className="flex gap-4 pt-8 border-t border-border">
                <Link href="/issues">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="h-14 px-8 text-lg font-medium"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 h-14 text-lg font-medium bg-foreground text-background hover:bg-foreground/90"
                >
                  Submit Issue
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 