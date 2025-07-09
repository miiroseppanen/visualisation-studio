import i18next, { i18n as I18nInstance } from 'i18next';
import enTranslations from './locales/en.json';
import fiTranslations from './locales/fi.json';

export const languages = {
  en: 'English',
  fi: 'Suomi',
};

export function createI18n(language: string): I18nInstance {
  const instance = i18next.createInstance();
  instance.init({
    resources: {
      en: { translation: enTranslations },
      fi: { translation: fiTranslations },
    },
    lng: language,
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    contextSeparator: '_',
    pluralSeparator: '_',
    ns: ['translation'],
    defaultNS: 'translation',
    supportedLngs: ['en', 'fi'],
    keySeparator: '.',
    nsSeparator: ':',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });
  return instance;
}