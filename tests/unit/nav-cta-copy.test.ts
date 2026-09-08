import { describe, expect, it } from 'vitest'
import { formatTranslation, type Locale } from '@/lib/i18n-format'

const CTA_KEYS = [
  'favorites.explore',
  'myProducts.publishFirst',
  'productDetail.backToProducts',
  'products.beFirst',
  'common.back',
] as const

const LOCALES: Locale[] = ['ca', 'es', 'en']

describe('empty-state and back CTA copy', () => {
  it('does not use unicode arrows; the button chrome carries direction', () => {
    for (const locale of LOCALES) {
      for (const key of CTA_KEYS) {
        const text = formatTranslation(locale, key)
        expect(text, `${locale} ${key}`).not.toMatch(/[←→]/)
      }
    }
  })
})
