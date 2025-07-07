'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  canInstall: boolean
  isInstalled: boolean
  isOffline: boolean
  isUpdateAvailable: boolean
  installPrompt: any
  installApp: () => Promise<void>
  updateApp: () => void
  setUpdateAvailable: (available: boolean) => void
}

export function usePWA(): PWAState {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
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
      setIsOffline(!navigator.onLine)
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
      setIsUpdateAvailable(true)
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

  const updateApp = () => {
    // Reload the page to apply the update
    window.location.reload()
  }

  const setUpdateAvailable = (available: boolean) => {
    setIsUpdateAvailable(available)
  }

  return {
    canInstall,
    isInstalled,
    isOffline,
    isUpdateAvailable,
    installPrompt,
    installApp,
    updateApp,
    setUpdateAvailable
  }
} 