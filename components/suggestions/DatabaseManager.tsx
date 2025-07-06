'use client'

import { useState } from 'react'
import { useSuggestions } from '@/lib/hooks/useSuggestions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Database, RefreshCw, AlertTriangle } from 'lucide-react'

interface DatabaseManagerProps {
  className?: string
}

export function DatabaseManager({ className }: DatabaseManagerProps) {
  const { 
    suggestions, 
    stats, 
    loading, 
    error, 
    clearAllSuggestions, 
    refresh 
  } = useSuggestions()
  
  const [isClearing, setIsClearing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleClearAll = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }

    setIsClearing(true)
    try {
      await clearAllSuggestions()
      setShowConfirmation(false)
    } catch (error) {
      console.error('Failed to clear suggestions:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const handleCancelClear = () => {
    setShowConfirmation(false)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            Manage suggestion storage and database operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {suggestions.length}
              </div>
              <div className="text-sm text-gray-600">Total Suggestions</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Database Records</div>
            </div>
          </div>

          {/* Status Breakdown */}
          {stats && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Status Breakdown:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <Badge key={status} variant="outline">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={refresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              onClick={handleClearAll}
              disabled={loading || isClearing}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {showConfirmation ? 'Confirm Clear' : 'Clear All'}
            </Button>

            {showConfirmation && (
              <Button
                onClick={handleCancelClear}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Confirmation Warning */}
          {showConfirmation && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to delete all {suggestions.length} suggestions? 
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {(loading || isClearing) && (
            <div className="text-center text-sm text-gray-600">
              {isClearing ? 'Clearing suggestions...' : 'Loading...'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 