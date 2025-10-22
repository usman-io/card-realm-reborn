import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from '../locales/en.json';
import esTranslation from '../locales/es.json';
import deTranslation from '../locales/de.json';
import frTranslation from '../locales/fr.json';
import zhTranslation from '../locales/zh.json';
import jaTranslation from '../locales/ja.json';

// Define available languages
export const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
} as const;

export type LanguageCode = keyof typeof languages;

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  de: { translation: deTranslation },
  fr: { translation: frTranslation },
  zh: { translation: zhTranslation },
  ja: { translation: jaTranslation },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback language
    lng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Cache user language preference
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;

