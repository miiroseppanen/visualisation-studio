'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Download, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PWAInstallModal from './PWAInstallModal'

export default function PWAInstallToast() {
  const { canInstall, isInstalled, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // TEMPORARY: Ignore dismissed state for testing
    // const dismissed = localStorage.getItem('pwa-toast-dismissed')
    // if (dismissed) {
    //   setIsDismissed(true)
    //   console.log('PWA Toast: User has dismissed before')
    //   return
    // }

    // Show toast for mobile devices that haven't installed the app
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const shouldShow = isMobile && !isInstalled

    console.log('PWA Toast Debug:', {
      isMobile,
      isInstalled,
      shouldShow,
      dismissed: false, // Temporarily always false
      userAgent: navigator.userAgent
    })

    // TEMPORARY: Force show for testing
    if (isMobile) {
      setIsVisible(true)
      console.log('PWA Toast: Forcing visible for testing')
      return
    }

    if (shouldShow) {
      // Show the toast instantly for mobile users
      setIsVisible(true)
      console.log('PWA Toast: Setting visible to true')
    }
  }, [canInstall, isInstalled])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-toast-dismissed', 'true')
  }

  const handleInstall = async () => {
    console.log('PWA Install clicked. State:', { canInstall, isInstalled })
    
    try {
      // If we have the install prompt available, use it
      if (canInstall) {
        console.log('Using install prompt API')
        await installApp()
        handleDismiss()
      } else {
        // For browsers that don't support the install prompt API,
        // show the instructions modal (do not dismiss toast yet)
        console.log('Install prompt not available, showing instructions modal')
        setShowModal(true)
      }
    } catch (error) {
      console.error('Installation failed:', error)
      setShowModal(true) // Show instructions as fallback
    }
  }

  console.log('PWA Toast Render:', { isVisible, isDismissed })

  // TEMPORARY: Only check isVisible, ignore isDismissed for testing
  if (!isVisible) {
    console.log('PWA Toast: Returning null because', { isVisible, isDismissed })
    return null
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-2 duration-300">
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-primary-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t('pwa.installApp')}</p>
            <p className="text-xs text-muted-foreground">{t('pwa.addToHomeScreen')}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {t('pwa.install')}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
              aria-label={t('common.close')}
              style={{ height: '2.5rem', width: '2.5rem' }}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <PWAInstallModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          handleDismiss();
        }} 
      />
    </>
  )
} 