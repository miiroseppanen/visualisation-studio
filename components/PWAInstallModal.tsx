'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { X, Download, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PWAInstallModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const { canInstall, isInstalled, installApp } = usePWA()
  const { t } = useTranslation()

  const handleInstall = async () => {
    if (canInstall) {
      try {
        await installApp()
        onClose()
      } catch (error) {
        console.error('Installation failed:', error)
      }
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen || isInstalled) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t('pwa.installApp')}</h2>
              <p className="text-xs text-muted-foreground">{t('pwa.addToHomeScreen')}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-muted/30 rounded-lg p-3">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {t('pwa.quickAccess')}</li>
            <li>• {t('pwa.worksOffline')}</li>
            <li>• {t('pwa.appLikeExperience')}</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors text-sm"
          >
            {t('common.later')}
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
          >
            <Smartphone className="w-3 h-3" />
            {t('pwa.install')}
          </button>
        </div>
      </div>
    </div>
  )
} 