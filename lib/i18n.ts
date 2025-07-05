import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from './locales/en.json'
import fiTranslations from './locales/fi.json'

// Define available languages
export const languages = {
  en: 'English',
  fi: 'Suomi'
}

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      fi: {
        translation: fiTranslations
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    interpolation: {
      escapeValue: false // React already does escaping
    },

    // Add support for context and plurals
    contextSeparator: '_',
    pluralSeparator: '_',
    
    // Namespace handling
    ns: ['translation'],
    defaultNS: 'translation',

    // Language whitelist
    supportedLngs: ['en', 'fi'],
    
    // Key handling
    keySeparator: '.',
    nsSeparator: ':'
  })

export default i18n