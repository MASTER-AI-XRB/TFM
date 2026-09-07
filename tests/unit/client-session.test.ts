import { describe, expect, it } from 'vitest'
import { hasSocketCredentials } from '@/lib/client-session'

describe('hasSocketCredentials', () => {
  it('is false after refresh: nickname saved, token not in memory yet', () => {
    expect(hasSocketCredentials('anna', null)).toBe(false)
  })

  it('is true only when both nickname and token exist', () => {
    expect(hasSocketCredentials('anna', 'tok')).toBe(true)
    expect(hasSocketCredentials(null, 'tok')).toBe(false)
  })
})
