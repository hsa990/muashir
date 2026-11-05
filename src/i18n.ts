import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'

export type Lang = 'en' | 'ar'

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('muashir-lang')
    if (saved === 'en' || saved === 'ar') return saved
  } catch {
    // Storage can be blocked. Fall through to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initialLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
