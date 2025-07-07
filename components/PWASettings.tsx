'use client'

import { useState } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PWASettings() {
  const { isInstalled, isOffline, resetInstallPrompt } = usePWA()
  const [isResetting, setIsResetting] = useState(false)
  const { t } = useTranslation()

  const handleResetInstallPrompt = () => {
    setIsResetting(true)
    resetInstallPrompt()
    
    // Show success message briefly
    setTimeout(() => {
      setIsResetting(false)
    }, 2000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          {t('pwa.settings')}
        </CardTitle>
        <CardDescription>
          {t('pwa.settingsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Installation Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium">{t('pwa.installationStatus')}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isInstalled ? t('pwa.installed') : t('pwa.notInstalled')}
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isOffline ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">{t('pwa.connection')}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isOffline ? t('pwa.offline') : t('pwa.online')}
          </span>
        </div>

        {/* Reset Install Prompt */}
        <div className="pt-2">
          <Button
            onClick={handleResetInstallPrompt}
            disabled={isResetting}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? t('pwa.resetting') : t('pwa.resetInstallPrompt')}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t('pwa.showInstallGuideAgain')}
          </p>
        </div>

        {/* Installation Instructions */}
        {!isInstalled && (
          <div className="pt-2">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                {t('pwa.showInstallInstructions')}
              </summary>
              <div className="mt-3 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
                <div>
                  <strong>iOS Safari:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>{t('pwa.iosStep1')}</li>
                    <li>{t('pwa.iosStep2')}</li>
                    <li>{t('pwa.iosStep3')}</li>
                  </ol>
                </div>
                <div>
                  <strong>Android Chrome:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>{t('pwa.androidStep1')}</li>
                    <li>{t('pwa.androidStep2')}</li>
                    <li>{t('pwa.androidStep3')}</li>
                  </ol>
                </div>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 