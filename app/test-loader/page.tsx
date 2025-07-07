'use client'

import { useState } from 'react'
import { Loader, FullScreenLoader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export default function TestLoaderPage() {
  const { t } = useTranslation()
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const [isProgressLoading, setIsProgressLoading] = useState(false)

  const startProgressLoading = () => {
    setIsProgressLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev === undefined || prev >= 100) {
          clearInterval(interval)
          setIsProgressLoading(false)
          return undefined
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loader Test Page</h1>
          <p className="text-muted-foreground">
            Testing the new unified horizontal line loader
          </p>
        </div>

        {/* Basic Loader */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Animated Loader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 relative">
              <Loader size="lg" />
            </div>
          </CardContent>
        </Card>

        {/* Progress-based Loader */}
        <Card>
          <CardHeader>
            <CardTitle>Progress-based Loader</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-32 relative">
              {isProgressLoading && <Loader size="lg" progress={progress} />}
            </div>
            <div className="flex gap-4">
              <Button onClick={startProgressLoading} disabled={isProgressLoading}>
                Start Progress Loading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsProgressLoading(false)
                  setProgress(undefined)
                }}
              >
                Reset
              </Button>
            </div>
            {progress !== undefined && (
              <p className="text-sm text-muted-foreground">
                Progress: {progress}%
              </p>
            )}
          </CardContent>
        </Card>

        {/* Full Screen Loader */}
        <Card>
          <CardHeader>
            <CardTitle>Full Screen Loader</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowFullScreen(true)}>
              Show Full Screen Loader
            </Button>
          </CardContent>
        </Card>

        {/* Loader with Text */}
        <Card>
          <CardHeader>
            <CardTitle>Loader with Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 relative">
              <Loader size="md" showText text="Loading with custom text..." />
            </div>
          </CardContent>
        </Card>

        {/* Different Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Different Sizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-16 relative">
              <Loader size="sm" />
            </div>
            <div className="h-16 relative">
              <Loader size="md" />
            </div>
            <div className="h-16 relative">
              <Loader size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Loader Overlay */}
      {showFullScreen && (
        <FullScreenLoader 
          text="Loading full screen..." 
          progress={progress}
        />
      )}

      {/* Close button for full screen loader */}
      {showFullScreen && (
        <Button 
          className="fixed top-4 right-4 z-[60]"
          onClick={() => setShowFullScreen(false)}
        >
          Close
        </Button>
      )}
    </div>
  )
} 