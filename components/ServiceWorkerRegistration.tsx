'use client'

import { useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'

export default function ServiceWorkerRegistration() {
  const { 
    isInstalled, 
    isUpdateAvailable, 
    isOffline, 
    canInstall, 
    installApp, 
    updateApp, 
    setUpdateAvailable 
  } = usePWA()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registered successfully:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })

        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }

      window.addEventListener('load', registerSW)
    }
  }, [setUpdateAvailable])

  return (
    <>
      {/* Update notification */}
      {isUpdateAvailable && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Update Available</h3>
              <p className="text-sm opacity-90">A new version is ready to install</p>
            </div>
            <button
              onClick={updateApp}
              className="ml-4 px-3 py-1 bg-primary-foreground text-primary rounded text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Install prompt */}
      {canInstall && !isInstalled && (
        <div className="fixed bottom-4 left-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install App</h3>
              <p className="text-sm opacity-90">Add to home screen for quick access</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={installApp}
                className="px-3 py-1 bg-primary-foreground text-primary rounded text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-white p-2 rounded-lg shadow-lg z-50 text-sm">
          You're offline
        </div>
      )}
    </>
  )
} 