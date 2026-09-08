import { describe, expect, it } from 'vitest'
import { formatTranslation, listTranslationKeys, type Locale } from '@/lib/i18n-format'

const CONFIG_GDPR_KEYS = [
  'config.version',
  'config.gdpr.title',
  'config.gdpr.exportDescription',
  'config.gdpr.deleteDescription',
  'legal.gdpr.exportData',
  'legal.gdpr.deleteAccount',
] as const

describe('i18n locale parity', () => {
  it('does not fall back to raw keys for GDPR copy on the settings screen', () => {
    const locales: Locale[] = ['ca', 'es', 'en']
    for (const locale of locales) {
      for (const key of CONFIG_GDPR_KEYS) {
        expect(formatTranslation(locale, key), `${locale} ${key}`).not.toBe(key)
      }
    }
  })

  it('keeps every Catalan key translated in Spanish and English', () => {
    const caKeys = listTranslationKeys('ca')
    for (const locale of ['es', 'en'] as const) {
      const present = new Set(listTranslationKeys(locale))
      const missing = caKeys.filter((key) => !present.has(key))
      expect(missing, `missing in ${locale}`).toEqual([])
    }
  })
})
