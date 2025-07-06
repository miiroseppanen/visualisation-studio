'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Lightbulb, ThumbsUp, ThumbsDown, MessageSquare, Calendar, X, Filter, SortAsc, User, FileText, Tag, Zap, Trash2, CheckCircle, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import AppLayout from '@/components/layout/AppLayout'
import { SuggestionsNavigation, SuggestionsMobileNavigation } from '@/components/navigation/PageNavigation'
import { useSuggestions } from '@/lib/hooks/useSuggestions'
import Link from 'next/link'

const categories = [
  'Packaging', 'Branding', 'Customer Experience', 'Events', 'Social Media', 'Audio Branding', 'Retail', 'Market Analysis', 'Supply Chain', 'Web Design'
]

const suggestionTypes = [
  { value: 'new-visual', label: 'New Visual', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { value: 'bug', label: 'Bug Fix', color: 'bg-red-500/10 text-red-700 dark:text-red-300' },
  { value: 'improvement', label: 'Improvement', color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  { value: 'feature', label: 'Feature', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
  { value: 'enhancement', label: 'Enhancement', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' }
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  approved: { label: 'Approved', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  implemented: { label: 'Implemented', color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-700 dark:text-red-300' }
}

// Admin PIN - in a real app, this would be stored securely
const ADMIN_PIN = '4321'

export default function SuggestionsPage() {
  const { 
    suggestions, 
    loading, 
    error, 
    upvoteSuggestion, 
    downvoteSuggestion,
    updateSuggestion,
    deleteSuggestion,
    clearSampleData
  } = useSuggestions()
  
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'title'>('score')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState(['', '', '', ''])
  const [adminAction, setAdminAction] = useState<{ type: 'delete' | 'mark-done', id: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  // Focus first input when modal opens
  useEffect(() => {
    if (showPinModal) {
      setTimeout(() => {
        pinRefs[0].current?.focus()
      }, 100)
    }
  }, [showPinModal])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newPin = [...pinInput]
    newPin[index] = value
    setPinInput(newPin)
    
    // Move to next input if digit entered
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pinInput[index] && index > 0) {
      pinRefs[index - 1].current?.focus()
    }
    
    // Handle paste
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 4).split('')
        const newPin = [...pinInput]
        digits.forEach((digit, i) => {
          if (i < 4) newPin[i] = digit
        })
        setPinInput(newPin)
        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, 3)
        pinRefs[nextIndex].current?.focus()
      })
    }
  }

  const handleUpvote = async (id: string) => {
    try {
      await upvoteSuggestion(id)
    } catch (error) {
      console.error('Failed to upvote:', error)
    }
  }

  const handleDownvote = async (id: string) => {
    try {
      await downvoteSuggestion(id)
    } catch (error) {
      console.error('Failed to downvote:', error)
    }
  }

  const handleAdminAction = (type: 'delete' | 'mark-done', id: string) => {
    if (!isAuthenticated) {
      setAdminAction({ type, id })
      setShowPinModal(true)
      return
    }
    
    executeAdminAction(type, id)
  }

  const executeAdminAction = async (type: 'delete' | 'mark-done', id: string) => {
    try {
      if (type === 'delete') {
        await deleteSuggestion(id)
      } else if (type === 'mark-done') {
        await updateSuggestion(id, { status: 'implemented' })
      }
    } catch (error) {
      console.error(`Failed to ${type} suggestion:`, error)
    }
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput.join('') === ADMIN_PIN) {
      setIsAuthenticated(true)
      setShowPinModal(false)
      setPinInput(['', '', '', ''])
      if (adminAction) {
        executeAdminAction(adminAction.type, adminAction.id)
        setAdminAction(null)
      }
    } else {
      alert('Incorrect PIN')
      setPinInput(['', '', '', ''])
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  const filteredSuggestions = suggestions
    .filter(s => {
      const categoryMatch = !filterCategory || s.category === filterCategory
      const typeMatch = !filterType || s.complexity === filterType
      // Hide disposed/rejected suggestions
      const notDisposed = s.status !== 'rejected'
      return categoryMatch && typeMatch && notDisposed
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const aScore = (a.upvotes || 0) - (a.downvotes || 0)
        const bScore = (b.upvotes || 0) - (b.downvotes || 0)
        return bScore - aScore
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  // Separate suggestions by status
  const pendingSuggestions = filteredSuggestions.filter(s => s.status === 'pending')
  const doneSuggestions = filteredSuggestions.filter(s => s.status === 'implemented')
  const approvedSuggestions = filteredSuggestions.filter(s => s.status === 'approved')

  if (loading) {
    return (
      <AppLayout showNavigation={false}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading suggestions...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout showNavigation={false}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Error loading suggestions</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen bg-background">
        {/* Page Navigation */}
        <SuggestionsMobileNavigation 
          isAuthenticated={isAuthenticated}
          onAdminClick={() => setShowPinModal(true)}
          onLogout={handleLogout}
        />
        <div className="hidden md:block">
          <SuggestionsNavigation 
            isAuthenticated={isAuthenticated}
            onAdminClick={() => setShowPinModal(true)}
            onLogout={handleLogout}
          />
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-10 px-4 border border-input bg-background text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md"
                >
                  <option value="">All Types</option>
                  {suggestionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
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
          <div className="space-y-6">
            {/* Pending Suggestions */}
            {pendingSuggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Pending Suggestions ({pendingSuggestions.length})
                </h3>
                <div className="space-y-4">
                  {pendingSuggestions.map((suggestion) => (
                    <Card 
                      key={suggestion.id} 
                      className="p-8 transition-all duration-300 hover:bg-accent/50"
                    >
                      <div className="flex items-start space-x-6">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpvote(suggestion.id)
                            }}
                            className="w-12 h-12 p-0 hover:bg-accent transition-all duration-300"
                          >
                            <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                          </Button>
                          <div className="text-center">
                            <div className="text-lg font-light text-foreground">
                              {(suggestion.upvotes || 0) - (suggestion.downvotes || 0) > 0 ? '+' : ''}
                              {(suggestion.upvotes || 0) - (suggestion.downvotes || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.upvotes || 0}↑ {suggestion.downvotes || 0}↓
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownvote(suggestion.id)
                            }}
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
                            
                            {/* Admin Actions */}
                            {isAuthenticated && (
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdminAction('mark-done', suggestion.id)
                                  }}
                                  className="w-8 h-8 p-0 hover:bg-green-100 hover:text-green-700"
                                  title="Mark as implemented"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdminAction('delete', suggestion.id)
                                  }}
                                  className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-700"
                                  title="Delete suggestion"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{suggestion.author}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(suggestion.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <Badge variant="outline">
                              {suggestion.category}
                            </Badge>
                            
                            <Badge className={cn(
                              suggestionTypes.find(t => t.value === suggestion.complexity)?.color
                            )}>
                              {suggestionTypes.find(t => t.value === suggestion.complexity)?.label}
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
                </div>
              </div>
            )}

            {/* Approved Suggestions */}
            {approvedSuggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
                  Approved Suggestions ({approvedSuggestions.length})
                </h3>
                <div className="space-y-4">
                  {approvedSuggestions.map((suggestion) => (
                    <Card 
                      key={suggestion.id} 
                      className="p-8 transition-all duration-300 hover:bg-accent/50"
                    >
                      <div className="flex items-start space-x-6">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpvote(suggestion.id)
                            }}
                            className="w-12 h-12 p-0 hover:bg-accent transition-all duration-300"
                          >
                            <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                          </Button>
                          <div className="text-center">
                            <div className="text-lg font-light text-foreground">
                              {(suggestion.upvotes || 0) - (suggestion.downvotes || 0) > 0 ? '+' : ''}
                              {(suggestion.upvotes || 0) - (suggestion.downvotes || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.upvotes || 0}↑ {suggestion.downvotes || 0}↓
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownvote(suggestion.id)
                            }}
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
                            
                            {/* Admin Actions */}
                            {isAuthenticated && (
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdminAction('mark-done', suggestion.id)
                                  }}
                                  className="w-8 h-8 p-0 hover:bg-green-100 hover:text-green-700"
                                  title="Mark as implemented"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdminAction('delete', suggestion.id)
                                  }}
                                  className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-700"
                                  title="Delete suggestion"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{suggestion.author}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(suggestion.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <Badge variant="outline">
                              {suggestion.category}
                            </Badge>
                            
                            <Badge className={cn(
                              suggestionTypes.find(t => t.value === suggestion.complexity)?.color
                            )}>
                              {suggestionTypes.find(t => t.value === suggestion.complexity)?.label}
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
                </div>
              </div>
            )}

            {/* Implemented Suggestions */}
            {doneSuggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">
                  Implemented Suggestions ({doneSuggestions.length})
                </h3>
                <div className="space-y-4">
                  {doneSuggestions.map((suggestion) => (
                    <Card 
                      key={suggestion.id} 
                      className="p-8 transition-all duration-300 hover:bg-accent/50"
                    >
                      <div className="flex items-start space-x-6">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpvote(suggestion.id)
                            }}
                            className="w-12 h-12 p-0 hover:bg-accent transition-all duration-300"
                          >
                            <ThumbsUp className="w-5 h-5 text-muted-foreground" />
                          </Button>
                          <div className="text-center">
                            <div className="text-lg font-light text-foreground">
                              {(suggestion.upvotes || 0) - (suggestion.downvotes || 0) > 0 ? '+' : ''}
                              {(suggestion.upvotes || 0) - (suggestion.downvotes || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.upvotes || 0}↑ {suggestion.downvotes || 0}↓
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownvote(suggestion.id)
                            }}
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
                            
                            {/* Admin Actions */}
                            {isAuthenticated && (
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdminAction('mark-done', suggestion.id)
                                  }}
                                  className="w-8 h-8 p-0 hover:bg-green-100 hover:text-green-700"
                                  title="Mark as implemented"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAdminAction('delete', suggestion.id)
                                  }}
                                  className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-700"
                                  title="Delete suggestion"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{suggestion.author}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(suggestion.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <Badge variant="outline">
                              {suggestion.category}
                            </Badge>
                            
                            <Badge className={cn(
                              suggestionTypes.find(t => t.value === suggestion.complexity)?.color
                            )}>
                              {suggestionTypes.find(t => t.value === suggestion.complexity)?.label}
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
                </div>
              </div>
            )}

            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No suggestions found matching your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Admin Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 4-digit PIN to perform admin actions.
              </p>
              <form onSubmit={handlePinSubmit}>
                                  <div className="flex gap-3 justify-center">
                    <Input
                      ref={pinRefs[0]}
                      type="text"
                      value={pinInput[0]}
                      onChange={(e) => handlePinChange(0, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(0, e)}
                      placeholder="•"
                      maxLength={1}
                      className="w-14 h-14 text-center text-lg font-mono border-2 focus:border-primary"
                      autoFocus
                    />
                    <Input
                      ref={pinRefs[1]}
                      type="text"
                      value={pinInput[1]}
                      onChange={(e) => handlePinChange(1, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(1, e)}
                      placeholder="•"
                      maxLength={1}
                      className="w-14 h-14 text-center text-lg font-mono border-2 focus:border-primary"
                    />
                    <Input
                      ref={pinRefs[2]}
                      type="text"
                      value={pinInput[2]}
                      onChange={(e) => handlePinChange(2, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(2, e)}
                      placeholder="•"
                      maxLength={1}
                      className="w-14 h-14 text-center text-lg font-mono border-2 focus:border-primary"
                    />
                    <Input
                      ref={pinRefs[3]}
                      type="text"
                      value={pinInput[3]}
                      onChange={(e) => handlePinChange(3, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(3, e)}
                      placeholder="•"
                      maxLength={1}
                      className="w-14 h-14 text-center text-lg font-mono border-2 focus:border-primary"
                    />
                  </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit" className="flex-1">
                    Authenticate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPinModal(false)
                      setPinInput(['', '', '', ''])
                      setAdminAction(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
} 