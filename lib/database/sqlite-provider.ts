import { VisualizationSuggestion, SuggestionFilters, SuggestionStats, Comment } from '../types'

// SQLite database provider for suggestions
export class SQLiteProvider {
  private db: any
  private dbPath: string

  constructor(dbPath: string = './data/suggestions.db') {
    this.dbPath = dbPath
  }

  // Initialize database connection
  async init(): Promise<void> {
    try {
      // In a browser environment, we'll use a different approach
      // For now, we'll create a mock implementation that uses IndexedDB
      if (typeof window !== 'undefined') {
        await this.initIndexedDB()
      } else {
        // Node.js environment - would use sqlite3 module
        throw new Error('SQLite not available in browser environment')
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  // Initialize IndexedDB for browser environment
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VisualizationStudioDB', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create suggestions store
        if (!db.objectStoreNames.contains('suggestions')) {
          const suggestionsStore = db.createObjectStore('suggestions', { keyPath: 'id' })
          suggestionsStore.createIndex('status', 'status', { unique: false })
          suggestionsStore.createIndex('category', 'category', { unique: false })
          suggestionsStore.createIndex('complexity', 'complexity', { unique: false })
          suggestionsStore.createIndex('timestamp', 'timestamp', { unique: false })
          suggestionsStore.createIndex('author', 'author', { unique: false })
          suggestionsStore.createIndex('score', 'score', { unique: false })
          suggestionsStore.createIndex('views', 'views', { unique: false })
          suggestionsStore.createIndex('favorites', 'favorites', { unique: false })
        }

        // Create comments store
        if (!db.objectStoreNames.contains('comments')) {
          const commentsStore = db.createObjectStore('comments', { keyPath: 'id' })
          commentsStore.createIndex('suggestionId', 'suggestionId', { unique: false })
          commentsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Create tags store
        if (!db.objectStoreNames.contains('tags')) {
          const tagsStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true })
          tagsStore.createIndex('name', 'name', { unique: true })
        }

        // Create suggestion tags store
        if (!db.objectStoreNames.contains('suggestionTags')) {
          const suggestionTagsStore = db.createObjectStore('suggestionTags', { keyPath: ['suggestionId', 'tagId'] })
          suggestionTagsStore.createIndex('suggestionId', 'suggestionId', { unique: false })
          suggestionTagsStore.createIndex('tagId', 'tagId', { unique: false })
        }

        // Create implementations store
        if (!db.objectStoreNames.contains('implementations')) {
          const implementationsStore = db.createObjectStore('implementations', { keyPath: 'suggestionId' })
        }

        // Create user interactions store
        if (!db.objectStoreNames.contains('userInteractions')) {
          const userInteractionsStore = db.createObjectStore('userInteractions', { keyPath: 'id', autoIncrement: true })
          userInteractionsStore.createIndex('suggestionId', 'suggestionId', { unique: false })
          userInteractionsStore.createIndex('userId', 'userId', { unique: false })
          userInteractionsStore.createIndex('interactionType', 'interactionType', { unique: false })
        }

        // Create statistics store
        if (!db.objectStoreNames.contains('statistics')) {
          const statisticsStore = db.createObjectStore('statistics', { keyPath: 'id' })
        }
      }
    })
  }

  // Save suggestion
  async save(suggestion: VisualizationSuggestion): Promise<void> {
    const transaction = this.db.transaction(['suggestions', 'tags', 'suggestionTags', 'implementations'], 'readwrite')

    try {
      // Save main suggestion
      const suggestionsStore = transaction.objectStore('suggestions')
      const suggestionData = {
        ...suggestion,
        score: suggestion.upvotes - suggestion.downvotes
      }
      await this.promisifyRequest(suggestionsStore.put(suggestionData))

      // Save tags
      if (suggestion.tags && suggestion.tags.length > 0) {
        const tagsStore = transaction.objectStore('tags')
        const suggestionTagsStore = transaction.objectStore('suggestionTags')

        // Clear existing tags for this suggestion
        const existingTags = await this.getSuggestionTags(suggestion.id)
        for (const tagId of existingTags) {
          await this.promisifyRequest(suggestionTagsStore.delete([suggestion.id, tagId]))
        }

        // Add new tags
        for (const tagName of suggestion.tags) {
          let tagId: number

          // Try to find existing tag
          const tagIndex = tagsStore.index('name')
          const existingTag = await this.promisifyRequest(tagIndex.get(tagName))
          
          if (existingTag) {
            tagId = existingTag.id
          } else {
            // Create new tag
            const newTag = await this.promisifyRequest(tagsStore.add({ name: tagName }))
            tagId = newTag as number
          }

          // Link tag to suggestion
          await this.promisifyRequest(suggestionTagsStore.add({
            suggestionId: suggestion.id,
            tagId: tagId
          }))
        }
      }

      // Save implementation details
      if (suggestion.implementation) {
        const implementationsStore = transaction.objectStore('implementations')
        await this.promisifyRequest(implementationsStore.put({
          suggestionId: suggestion.id,
          ...suggestion.implementation
        }))
      }

      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to save suggestion:', error)
      throw error
    }
  }

  // Get suggestion by ID
  async get(id: string): Promise<VisualizationSuggestion | null> {
    const transaction = this.db.transaction(['suggestions', 'tags', 'suggestionTags', 'implementations', 'comments'], 'readonly')
    
    try {
      const suggestionsStore = transaction.objectStore('suggestions')
      const suggestion = await this.promisifyRequest(suggestionsStore.get(id))
      
      if (!suggestion) return null

      // Get tags
      const tags = await this.getSuggestionTags(id)

      // Get implementation
      const implementationsStore = transaction.objectStore('implementations')
      const implementation = await this.promisifyRequest(implementationsStore.get(id))

      // Get comments
      const commentsStore = transaction.objectStore('comments')
      const commentsIndex = commentsStore.index('suggestionId')
      const comments = await this.promisifyRequest(commentsIndex.getAll(id))

      return {
        ...suggestion,
        tags,
        implementation: implementation || undefined,
        comments: comments || []
      }
    } catch (error) {
      console.error('Failed to get suggestion:', error)
      throw error
    }
  }

  // Get all suggestions with filters
  async getAll(filters?: SuggestionFilters): Promise<VisualizationSuggestion[]> {
    const transaction = this.db.transaction(['suggestions', 'tags', 'suggestionTags', 'implementations', 'comments'], 'readonly')
    
    try {
      const suggestionsStore = transaction.objectStore('suggestions')
      let suggestions = await this.promisifyRequest(suggestionsStore.getAll())

      // Apply filters
      if (filters) {
        suggestions = this.applyFilters(suggestions, filters)
      }

      // Enrich suggestions with tags, implementations, and comments
      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (suggestion) => {
          const tags = await this.getSuggestionTags(suggestion.id)
          const implementationsStore = transaction.objectStore('implementations')
          const implementation = await this.promisifyRequest(implementationsStore.get(suggestion.id))
          const commentsStore = transaction.objectStore('comments')
          const commentsIndex = commentsStore.index('suggestionId')
          const comments = await this.promisifyRequest(commentsIndex.getAll(suggestion.id))

          return {
            ...suggestion,
            tags,
            implementation: implementation || undefined,
            comments: comments || []
          }
        })
      )

      return enrichedSuggestions
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      throw error
    }
  }

  // Update suggestion
  async update(id: string, updates: Partial<VisualizationSuggestion>): Promise<void> {
    const existing = await this.get(id)
    if (!existing) {
      throw new Error(`Suggestion with id ${id} not found`)
    }

    const updated = {
      ...existing,
      ...updates,
      lastModified: new Date()
    }

    await this.save(updated)
  }

  // Delete suggestion
  async delete(id: string): Promise<void> {
    const transaction = this.db.transaction(['suggestions', 'suggestionTags', 'implementations', 'comments', 'userInteractions'], 'readwrite')
    
    try {
      const suggestionsStore = transaction.objectStore('suggestions')
      await this.promisifyRequest(suggestionsStore.delete(id))

      // Delete related data (cascade delete handled by IndexedDB)
      const suggestionTagsStore = transaction.objectStore('suggestionTags')
      const suggestionTagsIndex = suggestionTagsStore.index('suggestionId')
      const tags = await this.promisifyRequest(suggestionTagsIndex.getAll(id))
      for (const tag of tags) {
        await this.promisifyRequest(suggestionTagsStore.delete([tag.suggestionId, tag.tagId]))
      }

      const implementationsStore = transaction.objectStore('implementations')
      await this.promisifyRequest(implementationsStore.delete(id))

      const commentsStore = transaction.objectStore('comments')
      const commentsIndex = commentsStore.index('suggestionId')
      const comments = await this.promisifyRequest(commentsIndex.getAll(id))
      for (const comment of comments) {
        await this.promisifyRequest(commentsStore.delete(comment.id))
      }

      const userInteractionsStore = transaction.objectStore('userInteractions')
      const userInteractionsIndex = userInteractionsStore.index('suggestionId')
      const interactions = await this.promisifyRequest(userInteractionsIndex.getAll(id))
      for (const interaction of interactions) {
        await this.promisifyRequest(userInteractionsStore.delete(interaction.id))
      }

      await this.updateStatistics()
    } catch (error) {
      console.error('Failed to delete suggestion:', error)
      throw error
    }
  }

  // Get statistics
  async getStats(): Promise<SuggestionStats> {
    const transaction = this.db.transaction(['suggestions', 'statistics'], 'readonly')
    
    try {
      const statisticsStore = transaction.objectStore('statistics')
      const stats = await this.promisifyRequest(statisticsStore.get('main'))

      if (stats) {
        return {
          total: stats.total_suggestions,
          byStatus: {
            pending: stats.pending_count,
            approved: stats.approved_count,
            implemented: stats.implemented_count,
            rejected: stats.rejected_count
          },
          byCategory: await this.getCategoryStats(),
          byComplexity: await this.getComplexityStats(),
          topRated: await this.getTopRatedSuggestions(),
          mostViewed: await this.getMostViewedSuggestions(),
          recentlyAdded: await this.getRecentlyAddedSuggestions()
        }
      }

      return await this.updateStatistics()
    } catch (error) {
      console.error('Failed to get statistics:', error)
      throw error
    }
  }

  // Clear all suggestions
  async clearAll(): Promise<void> {
    const transaction = this.db.transaction([
      'suggestions', 
      'tags', 
      'suggestionTags', 
      'implementations', 
      'comments', 
      'userInteractions', 
      'statistics'
    ], 'readwrite')
    
    try {
      // Clear all stores
      const stores = ['suggestions', 'tags', 'suggestionTags', 'implementations', 'comments', 'userInteractions']
      
      for (const storeName of stores) {
        const store = transaction.objectStore(storeName)
        await this.promisifyRequest(store.clear())
      }

      // Reset statistics
      const statisticsStore = transaction.objectStore('statistics')
      await this.promisifyRequest(statisticsStore.put({
        id: 'main',
        total_suggestions: 0,
        pending_count: 0,
        approved_count: 0,
        implemented_count: 0,
        rejected_count: 0,
        last_updated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to clear all suggestions:', error)
      throw error
    }
  }

  // Helper methods
  private async getSuggestionTags(suggestionId: string): Promise<string[]> {
    const transaction = this.db.transaction(['suggestionTags', 'tags'], 'readonly')
    const suggestionTagsStore = transaction.objectStore('suggestionTags')
    const suggestionTagsIndex = suggestionTagsStore.index('suggestionId')
    const suggestionTags = await this.promisifyRequest(suggestionTagsIndex.getAll(suggestionId))

    const tagsStore = transaction.objectStore('tags')
    const tagNames = await Promise.all(
      suggestionTags.map(async (st: any) => {
        const tag = await this.promisifyRequest(tagsStore.get(st.tagId))
        return tag.name
      })
    )

    return tagNames
  }

  private applyFilters(suggestions: any[], filters: SuggestionFilters): any[] {
    return suggestions.filter(s => {
      if (filters.category && s.category !== filters.category) return false
      if (filters.complexity && s.complexity !== filters.complexity) return false
      if (filters.status && s.status !== filters.status) return false
      if (filters.difficulty && s.difficulty !== filters.difficulty) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matches = s.title.toLowerCase().includes(searchLower) ||
                       s.description.toLowerCase().includes(searchLower)
        if (!matches) return false
      }
      return true
    }).sort((a, b) => {
      if (!filters.sortBy) return 0
      
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        case 'date':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
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

  private async updateStatistics(): Promise<SuggestionStats> {
    const suggestions = await this.getAll()
    
    const stats = {
      total: suggestions.length,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byComplexity: {} as Record<string, number>,
      topRated: suggestions
        .filter(s => s.status !== 'rejected')
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      mostViewed: suggestions
        .filter(s => s.status !== 'rejected')
        .sort((a, b) => b.views - a.views)
        .slice(0, 5),
      recentlyAdded: suggestions
        .filter(s => s.status !== 'rejected')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
    }

    // Calculate status counts
    suggestions.forEach(s => {
      stats.byStatus[s.status] = (stats.byStatus[s.status] || 0) + 1
      stats.byCategory[s.category] = (stats.byCategory[s.category] || 0) + 1
      stats.byComplexity[s.complexity] = (stats.byComplexity[s.complexity] || 0) + 1
    })

    // Update statistics in database
    const transaction = this.db.transaction(['statistics'], 'readwrite')
    const statisticsStore = transaction.objectStore('statistics')
    await this.promisifyRequest(statisticsStore.put({
      id: 'main',
      total_suggestions: stats.total,
      pending_count: stats.byStatus.pending || 0,
      approved_count: stats.byStatus.approved || 0,
      implemented_count: stats.byStatus.implemented || 0,
      rejected_count: stats.byStatus.rejected || 0,
      last_updated: new Date().toISOString()
    }))

    return stats
  }

  private async getCategoryStats(): Promise<Record<string, number>> {
    const suggestions = await this.getAll()
    const stats: Record<string, number> = {}
    suggestions.forEach(s => {
      stats[s.category] = (stats[s.category] || 0) + 1
    })
    return stats
  }

  private async getComplexityStats(): Promise<Record<string, number>> {
    const suggestions = await this.getAll()
    const stats: Record<string, number> = {}
    suggestions.forEach(s => {
      stats[s.complexity] = (stats[s.complexity] || 0) + 1
    })
    return stats
  }

  private async getTopRatedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.getAll()
    return suggestions
      .filter(s => s.status !== 'rejected')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  private async getMostViewedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.getAll()
    return suggestions
      .filter(s => s.status !== 'rejected')
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }

  private async getRecentlyAddedSuggestions(): Promise<VisualizationSuggestion[]> {
    const suggestions = await this.getAll()
    return suggestions
      .filter(s => s.status !== 'rejected')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
} 