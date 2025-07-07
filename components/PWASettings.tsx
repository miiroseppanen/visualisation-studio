'use client'

import { useState } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function PWASettings() {
  const { isInstalled, isOffline, resetInstallPrompt } = usePWA()
  const [isResetting, setIsResetting] = useState(false)

  const handleResetInstallPrompt = () => {
    setIsResetting(true)
    resetInstallPrompt()
    
    // Show success message briefly
    setTimeout(() => {
      setIsResetting(false)
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          PWA Settings
        </CardTitle>
        <CardDescription>
          Manage Progressive Web App settings and installation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Installation Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium">Installation Status</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isInstalled ? 'Installed' : 'Not Installed'}
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isOffline ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">Connection</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isOffline ? 'Offline' : 'Online'}
          </span>
        </div>

        {/* Reset Install Prompt */}
        <div className="pt-2">
          <Button
            onClick={handleResetInstallPrompt}
            disabled={isResetting}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset Install Prompt'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will show the installation guide again
          </p>
        </div>

        {/* Installation Instructions */}
        {!isInstalled && (
          <div className="pt-2">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                Show Installation Instructions
              </summary>
              <div className="mt-3 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
                <div>
                  <strong>iOS Safari:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Tap the Share button <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span></li>
                    <li>Select "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
                <div>
                  <strong>Android Chrome:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Tap the menu button ⋮</li>
                    <li>Select "Add to Home screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 