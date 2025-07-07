'use client'

import { usePWA } from '@/lib/hooks/usePWA'
import { Download, Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react'

export default function PWAStatus() {
  const { 
    isInstalled, 
    isUpdateAvailable, 
    isOffline, 
    canInstall, 
    installApp, 
    updateApp 
  } = usePWA()

  // Only show on mobile devices
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (!isMobile || (!isInstalled && !isUpdateAvailable && !isOffline && !canInstall)) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {/* Settings Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            // You can add a modal or navigation to PWA settings here
            console.log('PWA Settings clicked')
          }}
          className="p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg hover:bg-background transition-colors"
          title="PWA Settings"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}

      {/* Online indicator */}
      {!isOffline && isInstalled && (
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </div>
      )}

      {/* Update available */}
      {isUpdateAvailable && (
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          <span>Update Available</span>
          <button
            onClick={updateApp}
            className="ml-2 bg-white text-blue-500 px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
          >
            Update
          </button>
        </div>
      )}

      {/* Install prompt */}
      {canInstall && !isInstalled && (
        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" />
          <span>Install App</span>
          <button
            onClick={installApp}
            className="ml-2 bg-primary-foreground text-primary px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
          >
            Install
          </button>
        </div>
      )}
    </div>
  )
} 