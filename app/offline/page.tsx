'use client'

import Link from 'next/link'
import { H23Logo } from '@/components/ui/h23-logo'
import { useTranslation } from 'react-i18next'

export default function OfflinePage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <H23Logo size="lg" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {t('offline.title')}
          </h1>
          
          <p className="text-muted-foreground">
            {t('offline.lostConnection')}
          </p>
          
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="font-semibold text-foreground mb-2">
              {t('offline.availableOffline')}
            </h2>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• {t('offline.homeAndNavigation')}</li>
              <li>• {t('offline.visitedVisualisations')}</li>
              <li>• {t('offline.basicFunctionality')}</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.tryAgain')}
          </button>
          
          <Link
            href="/"
            className="block w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.goHome')}
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {t('offline.checkConnection')}
        </p>
      </div>
    </div>
  )
} 