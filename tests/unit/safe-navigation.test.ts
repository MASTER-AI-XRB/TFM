import { describe, expect, it } from 'vitest'
import { resolvePushActionUrl } from '@/lib/socket-security'
import { sameOriginPath } from '@/lib/safe-navigation'

describe('resolvePushActionUrl', () => {
  const origin = 'https://xarxanglesola.vercel.app'

  it('prefixa rutes relatives amb l’origen de l’app', () => {
    expect(resolvePushActionUrl('/app/products/1', origin)).toBe(
      'https://xarxanglesola.vercel.app/app/products/1'
    )
  })

  it('rebutja una URL absoluta d’un altre origen', () => {
    expect(resolvePushActionUrl('https://example.invalid/phish', origin)).toBe(
      'https://xarxanglesola.vercel.app/app'
    )
  })

  it('conserva una URL absoluta del mateix origen', () => {
    expect(
      resolvePushActionUrl('https://xarxanglesola.vercel.app/app/chat', origin)
    ).toBe('https://xarxanglesola.vercel.app/app/chat')
  })
})

describe('sameOriginPath', () => {
  const origin = 'https://xarxanglesola.vercel.app'

  it('deixa passar rutes relatives', () => {
    expect(sameOriginPath('/app', origin)).toBe('/app')
  })

  it('redueix URLs foranes a /app', () => {
    expect(sameOriginPath('https://example.invalid/phish', origin)).toBe('/app')
  })
})
