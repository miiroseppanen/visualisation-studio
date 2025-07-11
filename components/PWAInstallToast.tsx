'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Download, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PWAInstallToast() {
  const { canInstall, isInstalled, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // Check if user has dismissed the toast before
    const dismissed = localStorage.getItem('pwa-toast-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show toast immediately on mobile devices that can install the app
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
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{t('pwa.installApp')}</p>
          <p className="text-xs text-muted-foreground">{t('pwa.addToHomeScreen')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('pwa.install')}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
} 