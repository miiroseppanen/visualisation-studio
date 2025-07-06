'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Bug, Lightbulb, AlertTriangle, CheckCircle, Clock, Filter, SortAsc, User, FileText, Tag, Zap, MessageSquare, ThumbsUp, ThumbsDown, Search, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { IssueNavigation, IssueMobileNavigation } from '@/components/navigation/IssueNavigation'
import Link from 'next/link'

interface Issue {
  id: string
  title: string
  description: string
  author: string
  timestamp: Date
  upvotes: number
  downvotes: number
  comments: number
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'bug' | 'feature' | 'improvement' | 'idea'
  category: string
  assignedTo?: string
}

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Canvas rendering glitch on mobile devices',
    description: 'The visualization canvas shows artifacts when viewed on mobile devices, particularly on iOS Safari. The issue appears to be related to the WebGL context initialization.',
    author: 'Mobile Developer',
    timestamp: new Date('2024-01-15'),
    upvotes: 8,
    downvotes: 1,
    comments: 3,
    status: 'in-progress',
    priority: 'high',
    type: 'bug',
    category: 'Rendering',
    assignedTo: 'Graphics Team'
  },
  {
    id: '2',
    title: 'Add real-time collaboration features',
    description: 'Implement real-time collaboration where multiple users can work on the same visualization simultaneously. Include cursor tracking and change synchronization.',
    author: 'UX Designer',
    timestamp: new Date('2024-01-14'),
    upvotes: 15,
    downvotes: 2,
    comments: 7,
    status: 'open',
    priority: 'medium',
    type: 'feature',
    category: 'Collaboration'
  },
  {
    id: '3',
    title: 'Performance optimization for particle systems',
    description: 'The particle swarm visualization becomes laggy with more than 1000 particles. Need to implement spatial partitioning and GPU acceleration.',
    author: 'Performance Engineer',
    timestamp: new Date('2024-01-13'),
    upvotes: 12,
    downvotes: 0,
    comments: 5,
    status: 'open',
    priority: 'high',
    type: 'improvement',
    category: 'Performance'
  },
  {
    id: '4',
    title: 'Add export functionality for visualizations',
    description: 'Users should be able to export their visualizations as high-quality images, videos, or interactive web components.',
    author: 'Product Manager',
    timestamp: new Date('2024-01-12'),
    upvotes: 20,
    downvotes: 1,
    comments: 12,
    status: 'open',
    priority: 'medium',
    type: 'feature',
    category: 'Export'
  },
  {
    id: '5',
    title: 'Dark mode toggle not working properly',
    description: 'The dark mode toggle sometimes doesn\'t update all UI elements immediately, leaving some components in the wrong theme.',
    author: 'Frontend Developer',
    timestamp: new Date('2024-01-11'),
    upvotes: 6,
    downvotes: 0,
    comments: 2,
    status: 'resolved',
    priority: 'low',
    type: 'bug',
    category: 'UI/UX',
    assignedTo: 'Frontend Team'
  },
  {
    id: '6',
    title: 'Add support for custom shaders',
    description: 'Allow users to write and upload custom GLSL shaders for advanced visual effects and custom rendering pipelines.',
    author: 'Graphics Programmer',
    timestamp: new Date('2024-01-10'),
    upvotes: 18,
    downvotes: 3,
    comments: 8,
    status: 'open',
    priority: 'medium',
    type: 'feature',
    category: 'Graphics'
  },
  {
    id: '7',
    title: 'Memory leak in wave interference simulation',
    description: 'The wave interference visualization has a memory leak that causes the browser to become unresponsive after extended use.',
    author: 'QA Engineer',
    timestamp: new Date('2024-01-09'),
    upvotes: 10,
    downvotes: 0,
    comments: 4,
    status: 'in-progress',
    priority: 'critical',
    type: 'bug',
    category: 'Memory',
    assignedTo: 'Backend Team'
  },
  {
    id: '8',
    title: 'Add tutorial system for new users',
    description: 'Create an interactive tutorial system that guides new users through the basic features and helps them create their first visualization.',
    author: 'Content Creator',
    timestamp: new Date('2024-01-08'),
    upvotes: 14,
    downvotes: 1,
    comments: 6,
    status: 'open',
    priority: 'low',
    type: 'improvement',
    category: 'Onboarding'
  }
]

const categories = [
  'Rendering', 'Performance', 'UI/UX', 'Graphics', 'Collaboration', 'Export', 'Memory', 'Onboarding', 'API', 'Documentation'
]

const issueTypes = [
  { value: 'bug', label: 'Bug', icon: Bug, color: 'bg-red-500/10 text-red-700 dark:text-red-300' },
  { value: 'feature', label: 'Feature', icon: Plus, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { value: 'improvement', label: 'Improvement', icon: Zap, color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' }
]

const statusConfig = {
  open: { label: 'Open', icon: Clock, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  'in-progress': { label: 'In Progress', icon: AlertTriangle, color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  closed: { label: 'Closed', icon: X, color: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' }
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' },
  medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-500/10 text-red-700 dark:text-red-300' }
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'priority'>('score')
  const [searchQuery, setSearchQuery] = useState('')

  const handleUpvote = (id: string) => {
    setIssues(prev => 
      prev.map(issue => issue.id === id ? { ...issue, upvotes: issue.upvotes + 1 } : issue)
    )
  }

  const handleDownvote = (id: string) => {
    setIssues(prev => 
      prev.map(issue => issue.id === id ? { ...issue, downvotes: issue.downvotes + 1 } : issue)
    )
  }

  const filteredIssues = issues
    .filter(issue => {
      const categoryMatch = !filterCategory || issue.category === filterCategory
      const typeMatch = !filterType || issue.type === filterType
      const statusMatch = !filterStatus || issue.status === filterStatus
      const priorityMatch = !filterPriority || issue.priority === filterPriority
      const searchMatch = !searchQuery || 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.author.toLowerCase().includes(searchQuery.toLowerCase())
      
      return categoryMatch && typeMatch && statusMatch && priorityMatch && searchMatch
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const aScore = a.upvotes - a.downvotes
        const bScore = b.upvotes - b.downvotes
        return bScore - aScore
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    critical: issues.filter(i => i.priority === 'critical').length
  }

  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {/* Page Navigation */}
        <IssueMobileNavigation />
        <div className="hidden md:block">
          <IssueNavigation />
        </div>

        {/* Stats Bar */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                <div className="text-sm text-muted-foreground">Open</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="border-b border-border bg-card/30">
          <div className="container mx-auto px-8 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">All Types</option>
                  {issueTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">All Status</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">All Priorities</option>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="score">Sort by Score</option>
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="container mx-auto px-8 py-8">
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <Card key={issue.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center space-y-1 pt-1">
                        <button
                          onClick={() => handleUpvote(issue.id)}
                          className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs font-medium">{issue.upvotes}</span>
                        </button>
                        <button
                          onClick={() => handleDownvote(issue.id)}
                          className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-xs font-medium">{issue.downvotes}</span>
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors">
                            {issue.title}
                          </h3>
                        </div>

                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {issue.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {(() => {
                            const typeConfig = issueTypes.find(t => t.value === issue.type)
                            const Icon = typeConfig?.icon || FileText
                            return (
                              <Badge className={cn("flex items-center space-x-1", typeConfig?.color)}>
                                <Icon className="w-3 h-3" />
                                <span>{typeConfig?.label}</span>
                              </Badge>
                            )
                          })()}

                          <Badge className={cn("flex items-center space-x-1", priorityConfig[issue.priority].color)}>
                            <span>{priorityConfig[issue.priority].label}</span>
                          </Badge>

                          {(() => {
                            const statusConfigItem = statusConfig[issue.status]
                            const Icon = statusConfigItem.icon
                            return (
                              <Badge className={cn("flex items-center space-x-1", statusConfigItem.color)}>
                                <Icon className="w-3 h-3" />
                                <span>{statusConfigItem.label}</span>
                              </Badge>
                            )
                          })()}

                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{issue.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{issue.timestamp.toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{issue.comments} comments</span>
                            </span>
                          </div>
                          {issue.assignedTo && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              Assigned to {issue.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredIssues.length === 0 && (
              <div className="text-center py-12">
                <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No issues found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 