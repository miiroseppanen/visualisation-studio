'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Download, X, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show banner immediately on mobile devices that can install the app
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const shouldShow = isMobile && canInstall && !isInstalled

    if (shouldShow) {
      // Show immediately for first-time users
      setIsVisible(true)
    }
  }, [canInstall, isInstalled])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', 'true')
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
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t('pwa.installApp')}</p>
              <p className="text-xs opacity-90">{t('pwa.addToHomeScreen')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-primary rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('pwa.install')}
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-md transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 