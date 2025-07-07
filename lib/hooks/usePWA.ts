'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  isInstalled: boolean
  isUpdateAvailable: boolean
  isOffline: boolean
  canInstall: boolean
  deferredPrompt: any
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isUpdateAvailable: false,
    isOffline: false,
    canInstall: false,
    deferredPrompt: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if app is installed
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      setPwaState(prev => ({ ...prev, isInstalled }))
    }

    // Check offline status
    const checkOfflineStatus = () => {
      setPwaState(prev => ({ ...prev, isOffline: !navigator.onLine }))
    }

    // Handle before install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setPwaState(prev => ({ 
        ...prev, 
        canInstall: true, 
        deferredPrompt: e 
      }))
    }

    // Handle app installed
    const handleAppInstalled = () => {
      setPwaState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false, 
        deferredPrompt: null 
      }))
    }

    // Initial checks
    checkInstallation()
    checkOfflineStatus()

    // Event listeners
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkInstallation)
    window.addEventListener('online', checkOfflineStatus)
    window.addEventListener('offline', checkOfflineStatus)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Service worker update handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setPwaState(prev => ({ ...prev, isUpdateAvailable: false }))
      })
    }

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkInstallation)
      window.removeEventListener('online', checkOfflineStatus)
      window.removeEventListener('offline', checkOfflineStatus)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (pwaState.deferredPrompt) {
      pwaState.deferredPrompt.prompt()
      const { outcome } = await pwaState.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setPwaState(prev => ({ 
        ...prev, 
        canInstall: false, 
        deferredPrompt: null 
      }))
    }
  }

  const updateApp = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const setUpdateAvailable = (available: boolean) => {
    setPwaState(prev => ({ ...prev, isUpdateAvailable: available }))
  }

  return {
    ...pwaState,
    installApp,
    updateApp,
    setUpdateAvailable
  }
} 