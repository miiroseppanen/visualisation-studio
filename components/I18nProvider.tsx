'use client'

import React from 'react'
import i18n, { initI18n } from '@/lib/i18n-client';
import { useSyncExternalStore } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage: string;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    initI18n(initialLanguage);
    if (i18n.isInitialized) {
      setInitialized(true);
    } else {
      i18n.on('initialized', () => setInitialized(true));
    }
    // Cleanup listener on unmount
    return () => {
      i18n.off('initialized', () => setInitialized(true));
    };
  }, [initialLanguage]);

  if (!initialized) return null;
  return <>{children}</>;
}

export function useI18nInitialized() {
  return useSyncExternalStore(
    (cb) => {
      i18n.on('initialized', cb);
      return () => i18n.off('initialized', cb);
    },
    () => i18n.isInitialized,
    () => true // Assume initialized on the server to avoid SSR error
  );
}