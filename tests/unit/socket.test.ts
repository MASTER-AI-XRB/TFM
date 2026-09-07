import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { getSocketUrl } from '@/lib/socket'

describe('getSocketUrl', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns env URL when provided', () => {
    process.env.NEXT_PUBLIC_SOCKET_URL = 'https://example.com'
    Object.defineProperty(window, 'location', {
      value: { hostname: 'xarxanglesola.vercel.app', protocol: 'https:' },
      writable: true,
    })
    expect(getSocketUrl()).toBe('https://example.com')
  })

  it('returns null when no env and production host', () => {
    process.env.NEXT_PUBLIC_SOCKET_URL = ''
    Object.defineProperty(window, 'location', {
      value: { hostname: 'app.vercel.app', protocol: 'https:' },
      writable: true,
    })
    expect(getSocketUrl()).toBeNull()
  })

  it('builds local socket URL when no env', () => {
    process.env.NEXT_PUBLIC_SOCKET_URL = ''
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost', protocol: 'http:' },
      writable: true,
    })
    expect(getSocketUrl()).toBe('http://localhost:3001')
  })
})

describe('wakeSocketServer', () => {
  it('builds /health from the socket URL', async () => {
    const { getSocketHealthUrl } = await import('@/lib/socket')
    expect(getSocketHealthUrl('https://xarxanglesola-production.up.railway.app')).toBe(
      'https://xarxanglesola-production.up.railway.app/health'
    )
    expect(getSocketHealthUrl('https://example.com/')).toBe('https://example.com/health')
  })

  it('does not wake localhost (dev)', async () => {
    const { shouldWakeSocketServer } = await import('@/lib/socket')
    expect(shouldWakeSocketServer('http://localhost:3001')).toBe(false)
    expect(shouldWakeSocketServer('http://127.0.0.1:3001')).toBe(false)
    expect(shouldWakeSocketServer('https://xarxanglesola-production.up.railway.app')).toBe(true)
  })
})

describe('getAppSocketClientOptions', () => {
  it('connects immediately so Engine.IO can wake Railway, and does not reuse a closed manager', async () => {
    const { getAppSocketClientOptions } = await import('@/lib/socket')
    const options = getAppSocketClientOptions('tok')
    expect(options.auth).toEqual({ token: 'tok' })
    expect(options.autoConnect).not.toBe(false)
    expect(options.forceNew).toBe(true)
    expect(options.reconnection).toBe(true)
    expect(options.reconnectionAttempts).toBeGreaterThanOrEqual(10)
  })
})
