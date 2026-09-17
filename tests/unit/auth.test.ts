import { describe, expect, it, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createSessionToken, verifySessionToken } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('auth tokens', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('creates and verifies a session token', () => {
    const token = createSessionToken('user-id', 'nickname')
    expect(token).toBeTruthy()
    const payload = verifySessionToken(token)
    expect(payload?.userId).toBe('user-id')
    expect(payload?.nickname).toBe('nickname')
    expect(payload?.sv).toBe(0)
  })

  it('rejects a token minted before sessionVersion changed', async () => {
    const { prisma } = await import('@/lib/prisma')
    const token = createSessionToken('user-id', 'nickname', 0)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      sessionVersion: 1,
    } as never)

    const request = new NextRequest('http://localhost:3000/api/x', {
      headers: { cookie: `xarxa_session=${token}` },
    })
    const { getAuthUserId } = await import('@/lib/auth')
    expect(await getAuthUserId(request)).toBeNull()
  })

  it('accepts a token whose sessionVersion matches the user row', async () => {
    const { prisma } = await import('@/lib/prisma')
    const token = createSessionToken('user-id', 'nickname', 3)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      sessionVersion: 3,
    } as never)

    const request = new NextRequest('http://localhost:3000/api/x', {
      headers: { cookie: `xarxa_session=${token}` },
    })
    const { getAuthUserId } = await import('@/lib/auth')
    expect(await getAuthUserId(request)).toBe('user-id')
  })

  it('returns null for tampered token', () => {
    const token = createSessionToken('user-id', 'nickname')
    expect(token).toBeTruthy()
    const tampered = `${token}-broken`
    expect(verifySessionToken(tampered)).toBeNull()
  })
})
