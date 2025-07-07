'use client'

import { useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'

export default function ServiceWorkerRegistration() {
  const { setUpdateAvailable } = usePWA()

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

  // This component only handles service worker registration
  // No UI elements are rendered
  return null
} 