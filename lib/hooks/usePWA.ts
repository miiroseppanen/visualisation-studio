'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  canInstall: boolean
  isInstalled: boolean
  isOnline: boolean
  hasUpdate: boolean
  installPrompt: any
  installApp: () => Promise<void>
  showInstallToast: () => void
}

export function usePWA(): PWAState {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if app is installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInApp)
    }

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setCanInstall(true)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setInstallPrompt(null)
    }

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setHasUpdate(true)
    }

    // Check initial state
    checkIfInstalled()
    updateOnlineStatus()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate)
      }
    }
  }, [])

  const installApp = async (): Promise<void> => {
    if (installPrompt) {
      try {
        const result = await installPrompt.prompt()
        console.log('Install prompt result:', result)
        
        if (result.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
        
        setInstallPrompt(null)
        setCanInstall(false)
      } catch (error) {
        console.error('Error during installation:', error)
        throw error
      }
    }
  }

  const showInstallToast = () => {
    // This will be handled by the parent component
    // The hook just provides the function interface
  }

  return {
    canInstall,
    isInstalled,
    isOnline,
    hasUpdate,
    installPrompt,
    installApp,
    showInstallToast
  }
} 