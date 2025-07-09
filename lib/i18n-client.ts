import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import fiTranslations from './locales/fi.json';

const i18n = i18next;

export function initI18n(language: string) {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: enTranslations },
          fi: { translation: fiTranslations },
        },
        lng: language, // set initial language here!
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
      });
  } else if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }
}

export default i18n; 