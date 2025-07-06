import { useState, useEffect, useCallback } from 'react'
import { VisualizationSuggestion, SuggestionFilters, SuggestionStats } from '../types'
import { suggestionsService, createSuggestionsService } from '../services/suggestions-service'
import { VisualizationGenerator, GeneratedVisualization } from '../services/visualization-generator'

interface UseSuggestionsOptions {
  autoLoad?: boolean
  filters?: SuggestionFilters
  providerType?: 'local' | 'api' | 'file' | 'sqlite'
  providerConfig?: any
}

interface UseSuggestionsReturn {
  // Data
  suggestions: VisualizationSuggestion[]
  stats: SuggestionStats | null
  loading: boolean
  error: string | null
  
  // CRUD operations
  createSuggestion: (suggestion: Omit<VisualizationSuggestion, 'id' | 'timestamp' | 'lastModified' | 'version'>) => Promise<VisualizationSuggestion>
  updateSuggestion: (id: string, updates: Partial<VisualizationSuggestion>) => Promise<void>
  deleteSuggestion: (id: string) => Promise<void>
  
  // Voting and interaction
  upvoteSuggestion: (id: string) => Promise<void>
  downvoteSuggestion: (id: string) => Promise<void>
  incrementViews: (id: string) => Promise<void>
  toggleFavorite: (id: string, userId: string) => Promise<void>
  
  // Filtering and searching
  setFilters: (filters: SuggestionFilters) => void
  clearFilters: () => void
  currentFilters: SuggestionFilters | undefined
  
  // Visualization generation
  generateVisualization: (suggestionId: string) => GeneratedVisualization | null
  generateFromTemplate: (
    title: string,
    description: string,
    type: 'grid-field' | 'flow-field' | 'turbulence' | 'circular-field' | 'topography' | 'custom',
    baseSettings?: any,
    animationSettings?: any,
    customParameters?: Record<string, any>
  ) => Partial<VisualizationSuggestion>
  
  // Export/Import
  exportSuggestions: () => Promise<string>
  importSuggestions: (jsonData: string) => Promise<void>
  
  // Database management
  clearAllSuggestions: () => Promise<void>
  clearSampleData: () => Promise<void>
  
  // Utility
  refresh: () => Promise<void>
  getSuggestionById: (id: string) => VisualizationSuggestion | undefined
}

export function useSuggestions(options: UseSuggestionsOptions = {}): UseSuggestionsReturn {
  const {
    autoLoad = true,
    filters: initialFilters,
    providerType = 'local',
    providerConfig
  } = options

  const [suggestions, setSuggestions] = useState<VisualizationSuggestion[]>([])
  const [stats, setStats] = useState<SuggestionStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SuggestionFilters | undefined>(initialFilters)
  const [service] = useState(() => createSuggestionsService(providerType, providerConfig))

  // Load suggestions
  const loadSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [suggestionsData, statsData] = await Promise.all([
        service.getAllSuggestions(filters),
        service.getStats()
      ])
      
      setSuggestions(suggestionsData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }, [service, filters])

  // Auto-load on mount and when filters change
  useEffect(() => {
    if (autoLoad) {
      loadSuggestions()
    }
  }, [loadSuggestions, autoLoad])

  // CRUD operations
  const createSuggestion = useCallback(async (suggestion: Omit<VisualizationSuggestion, 'id' | 'timestamp' | 'lastModified' | 'version'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const newSuggestion = await service.createSuggestion(suggestion)
      await loadSuggestions() // Refresh the list
      return newSuggestion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create suggestion')
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, loadSuggestions])

  const updateSuggestion = useCallback(async (id: string, updates: Partial<VisualizationSuggestion>) => {
    setLoading(true)
    setError(null)
    
    try {
      await service.updateSuggestion(id, updates)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update suggestion')
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, loadSuggestions])

  const deleteSuggestion = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await service.deleteSuggestion(id)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete suggestion')
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, loadSuggestions])

  // Voting and interaction
  const upvoteSuggestion = useCallback(async (id: string) => {
    try {
      await service.upvoteSuggestion(id)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upvote suggestion')
    }
  }, [service, loadSuggestions])

  const downvoteSuggestion = useCallback(async (id: string) => {
    try {
      await service.downvoteSuggestion(id)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to downvote suggestion')
    }
  }, [service, loadSuggestions])

  const incrementViews = useCallback(async (id: string) => {
    try {
      await service.incrementViews(id)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to increment views')
    }
  }, [service, loadSuggestions])

  const toggleFavorite = useCallback(async (id: string, userId: string) => {
    try {
      await service.toggleFavorite(id, userId)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite')
    }
  }, [service, loadSuggestions])

  // Filtering
  const updateFilters = useCallback((newFilters: SuggestionFilters) => {
    setFilters(newFilters)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(undefined)
  }, [])

  // Visualization generation
  const generateVisualization = useCallback((suggestionId: string): GeneratedVisualization | null => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return null
    
    return VisualizationGenerator.generateFromSuggestion(suggestion)
  }, [suggestions])

  const generateFromTemplate = useCallback((
    title: string,
    description: string,
    type: 'grid-field' | 'flow-field' | 'turbulence' | 'circular-field' | 'topography' | 'custom',
    baseSettings?: any,
    animationSettings?: any,
    customParameters?: Record<string, any>
  ) => {
    return VisualizationGenerator.createTemplateSuggestion(
      title,
      description,
      type,
      baseSettings,
      animationSettings,
      customParameters
    )
  }, [])

  // Export/Import
  const exportSuggestions = useCallback(async (): Promise<string> => {
    try {
      return await service.exportSuggestions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export suggestions')
      throw err
    }
  }, [service])

  const importSuggestions = useCallback(async (jsonData: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await service.importSuggestions(jsonData)
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import suggestions')
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, loadSuggestions])

  // Database management
  const clearAllSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await service.clearAllSuggestions()
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear suggestions')
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, loadSuggestions])

  const clearSampleData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await service.clearSampleData()
      await loadSuggestions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear sample data')
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, loadSuggestions])

  // Utility
  const refresh = useCallback(async () => {
    await loadSuggestions()
  }, [loadSuggestions])

  const getSuggestionById = useCallback((id: string) => {
    return suggestions.find(s => s.id === id)
  }, [suggestions])

  return {
    // Data
    suggestions,
    stats,
    loading,
    error,
    
    // CRUD operations
    createSuggestion,
    updateSuggestion,
    deleteSuggestion,
    
    // Voting and interaction
    upvoteSuggestion,
    downvoteSuggestion,
    incrementViews,
    toggleFavorite,
    
    // Filtering and searching
    setFilters: updateFilters,
    clearFilters,
    currentFilters: filters,
    
    // Visualization generation
    generateVisualization,
    generateFromTemplate,
    
    // Export/Import
    exportSuggestions,
    importSuggestions,
    
    // Database management
    clearAllSuggestions,
    clearSampleData,
    
    // Utility
    refresh,
    getSuggestionById
  }
}

// Convenience hook for a single suggestion
export function useSuggestion(id: string, options: UseSuggestionsOptions = {}) {
  const { suggestions, loading, error, ...rest } = useSuggestions({
    ...options,
    autoLoad: false
  })
  
  const [suggestion, setSuggestion] = useState<VisualizationSuggestion | null>(null)
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleError, setSingleError] = useState<string | null>(null)

  const loadSuggestion = useCallback(async () => {
    if (!id) return
    
    setSingleLoading(true)
    setSingleError(null)
    
    try {
      const data = await rest.getSuggestionById(id)
      setSuggestion(data || null)
    } catch (err) {
      setSingleError(err instanceof Error ? err.message : 'Failed to load suggestion')
    } finally {
      setSingleLoading(false)
    }
  }, [id, rest])

  useEffect(() => {
    loadSuggestion()
  }, [loadSuggestion])

  const { refresh: _, ...restWithoutRefresh } = rest
  
  return {
    suggestion,
    loading: singleLoading,
    error: singleError,
    refresh: loadSuggestion,
    ...restWithoutRefresh
  }
} 