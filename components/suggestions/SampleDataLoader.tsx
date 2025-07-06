'use client'

import { useState } from 'react'
import { useSuggestions } from '@/lib/hooks/useSuggestions'
import { generateSampleSuggestions } from '@/lib/database/sample-suggestions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, Download, AlertTriangle, CheckCircle } from 'lucide-react'

interface SampleDataLoaderProps {
  className?: string
}

export function SampleDataLoader({ className }: SampleDataLoaderProps) {
  const { suggestions, loading, error, importSuggestions } = useSuggestions()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoadSampleData = async () => {
    setIsLoading(true)
    try {
      const sampleSuggestions = generateSampleSuggestions()
      const jsonData = JSON.stringify(sampleSuggestions)
      await importSuggestions(jsonData)
      setIsLoaded(true)
    } catch (error) {
      console.error('Failed to load sample data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasExistingData = suggestions.length > 0

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Sample Data
          </CardTitle>
          <CardDescription>
            Load sample business-focused visualization suggestions for packaging, branding, events, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-medium text-gray-700">
              {hasExistingData ? `${suggestions.length} suggestions loaded` : 'No suggestions yet'}
            </div>
            <div className="text-sm text-gray-600">
              {hasExistingData ? 'Database is populated with sample data' : 'Click below to load sample data'}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {isLoaded && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully loaded {suggestions.length} sample suggestions into the database!
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleLoadSampleData}
              disabled={loading || isLoading || hasExistingData}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading Sample Data...' : 'Load Sample Suggestions'}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            Sample data includes 10 business-focused visualization suggestions for packaging, branding, events, and more
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 