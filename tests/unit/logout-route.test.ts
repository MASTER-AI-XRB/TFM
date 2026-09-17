import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { sessionCookieName } from '@/lib/auth'

const mockSessionDeleteMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      deleteMany: (...args: unknown[]) => mockSessionDeleteMany(...args),
    },
  },
}))

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    mockSessionDeleteMany.mockReset()
    mockSessionDeleteMany.mockResolvedValue({ count: 1 })
  })

  it('caduca xarxa_session i les cookies NextAuth, i esborra la sessió de la BD', async () => {
    const { POST } = await import('@/app/api/auth/logout/route')
    const request = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        cookie: `${sessionCookieName}=hmac-token; next-auth.session-token=db-session-token`,
      },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(response.cookies.get(sessionCookieName)?.value).toBe('')
    expect(response.cookies.get('next-auth.session-token')?.value).toBe('')
    expect(mockSessionDeleteMany).toHaveBeenCalledWith({
      where: { sessionToken: 'db-session-token' },
    })
  })

  it('no toca la taula Session si no hi ha cookie NextAuth', async () => {
    const { POST } = await import('@/app/api/auth/logout/route')
    const request = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    })

    await POST(request)
    expect(mockSessionDeleteMany).not.toHaveBeenCalled()
  })
})
