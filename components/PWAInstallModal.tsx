'use client'

import React from 'react'
import { X, Share, Plus, Menu, Download, Smartphone, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PWAInstallModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const { t } = useTranslation()
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const isChrome = /Chrome/.test(navigator.userAgent)
  const isSafari = /Safari/.test(navigator.userAgent) && !isChrome

  const getInstructions = () => {
    if (isIOS && isSafari) {
      return [
        {
          icon: Share,
          title: 'Tap the Share button',
          description: 'Look for the share icon in your browser toolbar'
        },
        {
          icon: Plus,
          title: 'Select "Add to Home Screen"',
          description: 'Scroll down and tap "Add to Home Screen"'
        },
        {
          icon: Smartphone,
          title: 'Confirm installation',
          description: 'Tap "Add" to install the app on your home screen'
        }
      ]
    } else if (isAndroid && isChrome) {
      return [
        {
          icon: Menu,
          title: 'Open browser menu',
          description: 'Tap the three dots menu in the top right'
        },
        {
          icon: Plus,
          title: 'Select "Add to Home Screen"',
          description: 'Tap "Add to Home Screen" from the menu'
        },
        {
          icon: Smartphone,
          title: 'Confirm installation',
          description: 'Tap "Add" to install the app'
        }
      ]
    } else if (isChrome) {
      return [
        {
          icon: Download,
          title: 'Look for the install icon',
          description: 'Find the install icon in your address bar'
        },
        {
          icon: Plus,
          title: 'Click to install',
          description: 'Click the install icon to add to your home screen'
        },
        {
          icon: Monitor,
          title: 'Launch the app',
          description: 'The app will open in a new window'
        }
      ]
    } else {
      return [
        {
          icon: Menu,
          title: 'Open browser menu',
          description: 'Look for the menu button in your browser'
        },
        {
          icon: Plus,
          title: 'Find install option',
          description: 'Look for "Add to Home Screen" or "Install"'
        },
        {
          icon: Smartphone,
          title: 'Follow browser instructions',
          description: 'Follow your browser\'s specific installation steps'
        }
      ]
    }
  }

  const instructions = getInstructions()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t('pwa.installInstructions')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-3">
            {instructions.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {React.createElement(step.icon, {
                    className: "w-4 h-4 text-primary"
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
} 