import { useCallback, useEffect, useState } from 'react'
import {
  fetchSuggestions,
  addSuggestion as apiAddSuggestion,
  updateSuggestion as apiUpdateSuggestion,
  deleteSuggestion as apiDeleteSuggestion,
  Suggestion
} from '../services/suggestions-service'

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSuggestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSuggestions()
      setSuggestions(data)
    } catch (err: any) {
      console.error('Error loading suggestions:', err)
      setError(err.message || 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const upvoteSuggestion = async (id: string) => {
    const suggestion = suggestions.find(s => s.id === id)
    if (!suggestion) return
    const updated = await apiUpdateSuggestion(id, { upvotes: (suggestion.upvotes || 0) + 1 })
    setSuggestions(suggestions.map(s => s.id === id ? updated : s))
  }

  const downvoteSuggestion = async (id: string) => {
    const suggestion = suggestions.find(s => s.id === id)
    if (!suggestion) return
    const updated = await apiUpdateSuggestion(id, { downvotes: (suggestion.downvotes || 0) + 1 })
    setSuggestions(suggestions.map(s => s.id === id ? updated : s))
  }

  const addSuggestion = async (suggestion: Omit<Suggestion, '_id' | 'id' | 'upvotes' | 'downvotes' | 'status' | 'timestamp'>) => {
    const newSuggestion = await apiAddSuggestion(suggestion)
    setSuggestions([newSuggestion, ...suggestions])
  }

  const updateSuggestion = async (id: string, update: Partial<Suggestion>) => {
    const updated = await apiUpdateSuggestion(id, update)
    setSuggestions(suggestions.map(s => s.id === id ? updated : s))
  }

  const deleteSuggestion = async (id: string) => {
    await apiDeleteSuggestion(id)
    setSuggestions(suggestions.filter(s => s.id !== id))
  }

  // clearSampleData is now a no-op (or could be implemented as a bulk delete API)
  const clearSampleData = async () => {}

  return {
    suggestions,
    loading,
    error,
    upvoteSuggestion,
    downvoteSuggestion,
    addSuggestion,
    updateSuggestion,
    deleteSuggestion,
    clearSampleData,
    reload: loadSuggestions,
  }
} 