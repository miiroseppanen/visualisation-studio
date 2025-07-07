'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FullScreenLoader } from '@/components/ui/loader'
import '@/lib/i18n' // Initialize i18n

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Wait for i18n to be initialized
    if (i18n.isInitialized) {
      setIsInitialized(true)
    } else {
      i18n.on('initialized', () => {
        setIsInitialized(true)
      })
    }

    // Update document language attribute when language changes
    const handleLanguageChange = (lng: string) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lng)
      }
    }

    // Set initial language
    handleLanguageChange(i18n.language)

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
      i18n.off('initialized', () => {
        setIsInitialized(true)
      })
    }
  }, [i18n])

  // Show loading state while i18n is initializing
  if (!isInitialized) {
    return <FullScreenLoader text="Initialising..." />
  }

  return <>{children}</>
}