'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { logError, logWarn } from '@/lib/client-logger'
import { formatTranslation, type Locale } from '@/lib/i18n-format'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  translateText: (text: string, targetLocale?: Locale) => Promise<string>
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  // Sempre començar amb 'ca' per evitar mismatch d'hidratació (servidor no té localStorage)
  const [locale, setLocaleState] = useState<Locale>('ca')

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'ca' || savedLocale === 'es' || savedLocale === 'en')) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string =>
      formatTranslation(locale, key, params),
    [locale]
  )

  const translateText = useCallback(async (text: string, targetLocale?: Locale): Promise<string> => {
    const target = targetLocale || locale

    try {
      // Sense detecció d'idioma per evitar problemes amb franc en producció
      const sourceLang = target === 'ca' ? 'es' : 'ca'

      const localeMap: Record<Locale, string> = {
        ca: 'ca',
        es: 'es',
        en: 'en',
      }

      const targetLang = localeMap[target]

      if (sourceLang === targetLang) {
        return text
      }

      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      )
      if (!response.ok) {
        return text
      }
      const data = await response.json()
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText
      }
      return text
    } catch (error) {
      logError('Error translating text:', error)
      return text
    }
  }, [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t, translateText }),
    [locale, setLocale, t, translateText]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

const fallbackI18n: I18nContextType = {
  locale: 'ca',
  setLocale: () => {},
  t: (key: string, params?: Record<string, string | number>) =>
    formatTranslation('ca', key, params),
  translateText: async (text: string) => text,
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    if (process.env.NODE_ENV !== 'production') {
      logWarn('useI18n must be used within I18nProvider')
    }
    return fallbackI18n
  }
  return context
}
