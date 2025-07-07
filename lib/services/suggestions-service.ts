import { VisualizationSuggestion, SuggestionFilters, SuggestionStats } from '../types'
import { PrismaProvider } from '../database/prisma-provider'

// Storage interfaces for different backends
interface StorageProvider {
  save(suggestion: VisualizationSuggestion): Promise<void>
  get(id: string): Promise<VisualizationSuggestion | null>
  getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]>
  update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void>
  delete(id: string): Promise<void>
  getStats(): Promise<SuggestionStats>
  clearAll(): Promise<void>
}

// Prisma Database Provider Implementation
class PrismaStorageProvider implements StorageProvider {
  private prismaProvider: PrismaProvider

  constructor() {
    this.prismaProvider = new PrismaProvider()
  }

  async save(suggestion: VisualizationSuggestion): Promise<void> {
    await this.prismaProvider.init()
    try {
      await this.prismaProvider.save(suggestion)
    } finally {
      await this.prismaProvider.close()
    }
  }

  async get(id: string): Promise<VisualizationSuggestion | null> {
    await this.prismaProvider.init()
    try {
      return await this.prismaProvider.get(id)
    } finally {
      await this.prismaProvider.close()
    }
  }

  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    await this.prismaProvider.init()
    try {
      return await this.prismaProvider.getAll(filters)
    } finally {
      await this.prismaProvider.close()
    }
  }

  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    await this.prismaProvider.init()
    try {
      await this.prismaProvider.update(id, updates)
    } finally {
      await this.prismaProvider.close()
    }
  }

  async delete(id: string): Promise<void> {
    await this.prismaProvider.init()
    try {
      await this.prismaProvider.delete(id)
    } finally {
      await this.prismaProvider.close()
    }
  }

  async getStats(): Promise<SuggestionStats> {
    await this.prismaProvider.init()
    try {
      return await this.prismaProvider.getStats()
    } finally {
      await this.prismaProvider.close()
    }
  }

  async clearAll(): Promise<void> {
    await this.prismaProvider.init()
    try {
      await this.prismaProvider.clearAll()
    } finally {
      await this.prismaProvider.close()
    }
  }
}

// Local Storage Implementation
class LocalStorageProvider implements StorageProvider {
  private readonly STORAGE_KEY = 'visualization-suggestions'
  private readonly STATS_KEY = 'visualization-suggestions-stats'

  async save(suggestion: VisualizationSuggestion): Promise<void> {
    const suggestions = await this.getAll()
    const existingIndex = suggestions.findIndex(s => s.id === suggestion.id)
    
    if (existingIndex >= 0) {
      suggestions[existingIndex] = { ...suggestion, lastModified: new Date() }
    } else {
      suggestions.push({ ...suggestion, lastModified: new Date() })
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(suggestions))
    await this.updateStats()
  }

  async get(id: string): Promise<VisualizationSuggestion | null> {
    const suggestions = await this.getAll()
    return suggestions.find(s => s.id === id) || null
  }

  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []
    
    let suggestions: VisualizationSuggestion[] = JSON.parse(stored)
    
    // Convert date strings back to Date objects
    suggestions = suggestions.map(s => ({
      ...s,
      timestamp: new Date(s.timestamp),
      lastModified: new Date(s.lastModified)
    }))
    
    // Apply filters
    if (filters) {
      suggestions = this.applyFilters(suggestions, filters)
    }
    
    return suggestions
  }

  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    const suggestions = await this.getAll()
    const index = suggestions.findIndex(s => s.id === id)
    
    if (index >= 0) {
      suggestions[index] = { ...suggestions[index], ...updates, lastModified: new Date() }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(suggestions))
      await this.updateStats()
    }
  }

  async delete(id: string): Promise<void> {
    const suggestions = await this.getAll()
    const filtered = suggestions.filter(s => s.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    await this.updateStats()
  }

  async getStats(): Promise<SuggestionStats> {
    const stored = localStorage.getItem(this.STATS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    
    return await this.updateStats()
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.STATS_KEY)
  }

  private async updateStats(): Promise<SuggestionStats> {
    const suggestions = await this.getAll()
    
    const stats: SuggestionStats = {
      total: suggestions.length,
      byStatus: {},
      byCategory: {},
      byComplexity: {},
      topRated: [],
      mostViewed: [],
      recentlyAdded: []
    }
    
    // Calculate statistics
    suggestions.forEach(s => {
      stats.byStatus[s.status] = (stats.byStatus[s.status] || 0) + 1
      stats.byCategory[s.category] = (stats.byCategory[s.category] || 0) + 1
      stats.byComplexity[s.complexity] = (stats.byComplexity[s.complexity] || 0) + 1
    })
    
    // Get top rated (by score)
    stats.topRated = suggestions
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      .slice(0, 5)
    
    // Get most viewed
    stats.mostViewed = suggestions
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
    
    // Get recently added
    stats.recentlyAdded = suggestions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
    
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats))
    return stats
  }

  private applyFilters(suggestions: VisualizationSuggestion[], filters: SuggestionFilters): VisualizationSuggestion[] {
    return suggestions.filter(s => {
      if (filters.category && s.category !== filters.category) return false
      if (filters.complexity && s.complexity !== filters.complexity) return false
      if (filters.status && s.status !== filters.status) return false
      if (filters.difficulty && s.difficulty !== filters.difficulty) return false
      if (filters.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => s.tags.includes(tag))
        if (!hasTag) return false
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matches = s.title.toLowerCase().includes(searchLower) ||
                       s.description.toLowerCase().includes(searchLower) ||
                       s.tags.some(tag => tag.toLowerCase().includes(searchLower))
        if (!matches) return false
      }
      return true
    }).sort((a, b) => {
      if (!filters.sortBy) return 0
      
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'score':
          aValue = a.upvotes - a.downvotes
          bValue = b.upvotes - b.downvotes
          break
        case 'date':
          aValue = a.timestamp.getTime()
          bValue = b.timestamp.getTime()
          break
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'views':
          aValue = a.views
          bValue = b.views
          break
        case 'favorites':
          aValue = a.favorites
          bValue = b.favorites
          break
        default:
          return 0
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }
}

// File System Storage Implementation (for Node.js environments)
class FileSystemProvider implements StorageProvider {
  private readonly filePath: string
  
  constructor(filePath: string = './data/suggestions.json') {
    this.filePath = filePath
  }

  async save(suggestion: VisualizationSuggestion): Promise<void> {
    // Implementation for file system storage
    // This would use Node.js fs module to save to JSON files
    throw new Error('FileSystemProvider not implemented in browser environment')
  }

  async get(id: string): Promise<VisualizationSuggestion | null> {
    throw new Error('FileSystemProvider not implemented in browser environment')
  }

  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    throw new Error('FileSystemProvider not implemented in browser environment')
  }

  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    throw new Error('FileSystemProvider not implemented in browser environment')
  }

  async delete(id: string): Promise<void> {
    throw new Error('FileSystemProvider not implemented in browser environment')
  }

  async getStats(): Promise<SuggestionStats> {
    throw new Error('FileSystemProvider not implemented in browser environment')
  }

  async clearAll(): Promise<void> {
    throw new Error('FileSystemProvider not implemented in browser environment')
  }
}

// API Storage Implementation (for backend integration)
class APIProvider implements StorageProvider {
  private readonly baseUrl: string
  
  constructor(baseUrl: string = '/api/suggestions') {
    this.baseUrl = baseUrl
  }

  async save(suggestion: VisualizationSuggestion): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(suggestion)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to save suggestion: ${response.statusText}`)
    }
  }

  async get(id: string): Promise<VisualizationSuggestion | null> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get suggestion: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value))
        }
      })
    }
    
    const response = await fetch(`${this.baseUrl}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get suggestions: ${response.statusText}`)
    }
    
    return response.json()
  }

  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update suggestion: ${response.statusText}`)
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete suggestion: ${response.statusText}`)
    }
  }

  async getStats(): Promise<SuggestionStats> {
    const response = await fetch(`${this.baseUrl}/stats`)
    
    if (!response.ok) {
      throw new Error(`Failed to get stats: ${response.statusText}`)
    }
    
    return response.json()
  }

  async clearAll(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/clear`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to clear suggestions: ${response.statusText}`)
    }
  }
}

// Main Suggestions Service
export class SuggestionsService {
  private provider: StorageProvider

  constructor(provider: StorageProvider = new LocalStorageProvider()) {
    this.provider = provider
  }

  // CRUD operations
  async createSuggestion(suggestion: Omit<VisualizationSuggestion, 'id' | 'timestamp' | 'lastModified' | 'version'>): Promise<VisualizationSuggestion> {
    const newSuggestion: VisualizationSuggestion = {
      ...suggestion,
      id: this.generateId(),
      timestamp: new Date(),
      lastModified: new Date(),
      version: '1.0.0',
      views: 0,
      favorites: 0,
      comments: []
    }
    
    await this.provider.save(newSuggestion)
    return newSuggestion
  }

  async getSuggestion(id: string): Promise<VisualizationSuggestion | null> {
    return this.provider.get(id)
  }

  async getAllSuggestions(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    return this.provider.getAll(filters)
  }

  async updateSuggestion(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    await this.provider.update(id, updates)
  }

  async deleteSuggestion(id: string): Promise<void> {
    await this.provider.delete(id)
  }

  // Specialized operations
  async upvoteSuggestion(id: string): Promise<void> {
    const suggestion = await this.provider.get(id)
    if (suggestion) {
      await this.provider.update(id, { upvotes: suggestion.upvotes + 1 })
    }
  }

  async downvoteSuggestion(id: string): Promise<void> {
    const suggestion = await this.provider.get(id)
    if (suggestion) {
      await this.provider.update(id, { downvotes: suggestion.downvotes + 1 })
    }
  }

  async incrementViews(id: string): Promise<void> {
    const suggestion = await this.provider.get(id)
    if (suggestion) {
      await this.provider.update(id, { views: suggestion.views + 1 })
    }
  }

  async toggleFavorite(id: string, userId: string): Promise<void> {
    // Implementation would depend on how favorites are stored
    // This is a simplified version
    const suggestion = await this.provider.get(id)
    if (suggestion) {
      // In a real implementation, you'd track which users favorited which suggestions
      await this.provider.update(id, { favorites: suggestion.favorites + 1 })
    }
  }

  async getStats(): Promise<SuggestionStats> {
    return this.provider.getStats()
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Export/Import functionality
  async exportSuggestions(): Promise<string> {
    const suggestions = await this.provider.getAll()
    return JSON.stringify(suggestions, null, 2)
  }

  async importSuggestions(jsonData: string): Promise<void> {
    const suggestions: VisualizationSuggestion[] = JSON.parse(jsonData)
    
    for (const suggestion of suggestions) {
      await this.provider.save(suggestion)
    }
  }

  async clearAllSuggestions(): Promise<void> {
    await this.provider.clearAll()
  }

  // Clear sample data while keeping user-created suggestions
  async clearSampleData(): Promise<void> {
    const allSuggestions = await this.provider.getAll()
    
    // Filter out sample data based on characteristics
    const userSuggestions = allSuggestions.filter(suggestion => {
      // Keep suggestions that are likely user-created
      // Sample data typically has high upvotes, specific authors, or implementation details
      const isSampleData = 
        suggestion.upvotes > 10 || // High upvotes suggest sample data
        suggestion.author.includes('Designer') || // Sample author patterns
        suggestion.author.includes('Researcher') ||
        suggestion.author.includes('Specialist') ||
        suggestion.author.includes('Manager') ||
        suggestion.author.includes('Professor') ||
        suggestion.implementation?.type || // Has implementation details
        suggestion.tags.length > 3 || // Many tags suggest sample data
        suggestion.estimatedDevTime > 10 // High estimated time suggests sample data
      
      return !isSampleData
    })
    
    // Clear all and re-save only user suggestions
    await this.provider.clearAll()
    
    for (const suggestion of userSuggestions) {
      await this.provider.save(suggestion)
    }
  }
}

// Default service instance
export const suggestionsService = new SuggestionsService()

// Factory function to create service with different providers
export function createSuggestionsService(providerType: 'local' | 'api' | 'file' | 'prisma' = 'local', config?: any): SuggestionsService {
  let provider: StorageProvider
  
  switch (providerType) {
    case 'api':
      provider = new APIProvider(config?.baseUrl)
      break
    case 'file':
      provider = new FileSystemProvider(config?.filePath)
      break
    case 'prisma':
      provider = new PrismaStorageProvider()
      break
    case 'local':
    default:
      provider = new LocalStorageProvider()
      break
  }
  
  return new SuggestionsService(provider)
}

export interface Suggestion {
  _id?: string
  id?: string // for compatibility
  title: string
  description: string
  category: string
  complexity: string
  status: string
  upvotes: number
  downvotes: number
  author: string
  timestamp: string | Date
}

const API_BASE = '/api/suggestions'

export async function fetchSuggestions(): Promise<Suggestion[]> {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error('Failed to fetch suggestions')
  const data = await res.json()
  
  // Map database format to frontend format
  return data.map((s: any) => ({
    ...s,
    id: s._id || s.id,
    // Convert uppercase enum values to lowercase for frontend compatibility
    status: s.status?.toLowerCase() || 'pending',
    complexity: s.complexity?.toLowerCase() || 'medium',
    difficulty: s.difficulty?.toLowerCase() || 'intermediate'
  }))
}

export async function addSuggestion(suggestion: Omit<Suggestion, '_id' | 'id' | 'upvotes' | 'downvotes' | 'status' | 'timestamp'>): Promise<Suggestion> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suggestion),
  })
  if (!res.ok) throw new Error('Failed to add suggestion')
  const data = await res.json()
  
  // Map database format to frontend format
  return {
    ...data,
    id: data._id || data.id,
    // Convert uppercase enum values to lowercase for frontend compatibility
    status: data.status?.toLowerCase() || 'pending',
    complexity: data.complexity?.toLowerCase() || 'medium',
    difficulty: data.difficulty?.toLowerCase() || 'intermediate'
  }
}

export async function updateSuggestion(id: string, update: Partial<Suggestion>): Promise<Suggestion> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
  if (!res.ok) throw new Error('Failed to update suggestion')
  const data = await res.json()
  
  // Map database format to frontend format
  return {
    ...data,
    id: data._id || data.id,
    // Convert uppercase enum values to lowercase for frontend compatibility
    status: data.status?.toLowerCase() || 'pending',
    complexity: data.complexity?.toLowerCase() || 'medium',
    difficulty: data.difficulty?.toLowerCase() || 'intermediate'
  }
}

export async function deleteSuggestion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete suggestion')
} 