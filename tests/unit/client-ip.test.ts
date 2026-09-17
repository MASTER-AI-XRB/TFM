import { describe, expect, it } from 'vitest'
import { getClientIp } from '@/lib/client-ip'

describe('getClientIp', () => {
  it('prefereix x-vercel-forwarded-for i ignora un X-Forwarded-For esquerre', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.2.3.4, 9.9.9.9',
      'x-vercel-forwarded-for': '203.0.113.10',
    })
    expect(getClientIp(headers)).toBe('203.0.113.10')
  })

  it('no fa servir X-Forwarded-For com a identitat', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.2.3.4, 9.9.9.9',
    })
    expect(getClientIp(headers)).toBe('unknown')
  })

  it('accepta x-real-ip si no hi ha capçalera de Vercel', () => {
    const headers = new Headers({
      'x-real-ip': '198.51.100.20',
      'x-forwarded-for': '1.2.3.4',
    })
    expect(getClientIp(headers)).toBe('198.51.100.20')
  })
})
