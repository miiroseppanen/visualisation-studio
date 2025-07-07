'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Download, X } from 'lucide-react'

export default function PWAInstallToast() {
  const { canInstall, isInstalled, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the toast before
    const dismissed = localStorage.getItem('pwa-toast-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show toast only on mobile devices that can install the app
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const shouldShow = isMobile && canInstall && !isInstalled

    if (shouldShow) {
      // Delay showing the toast to let the page load first
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-toast-dismissed', 'true')
  }

  const handleInstall = async () => {
    try {
      await installApp()
      handleDismiss()
    } catch (error) {
      console.error('Installation failed:', error)
      // Don't dismiss if installation fails
    }
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-primary-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Install App</p>
          <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
} 