import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { hashEmailToken } from '@/lib/email-token'

const mockFindFirst = vi.fn()
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

function postVerify(token: string) {
  return new NextRequest('http://localhost:3000/api/auth/verify-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  })
}

describe('POST /api/auth/verify-email', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockFindUnique.mockReset()
    mockUpdate.mockReset()
    mockUpdate.mockResolvedValue({})
  })

  it('passa pendingEmail a User.email i marca emailVerified', async () => {
    const { POST } = await import('@/app/api/auth/verify-email/route')
    const raw = 'a'.repeat(64)
    mockFindFirst.mockResolvedValue({
      id: 'user-1',
      pendingEmail: 'victim@example.com',
    })
    mockFindUnique.mockResolvedValue(null)

    const response = await POST(postVerify(raw))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        emailVerifyToken: hashEmailToken(raw),
        emailVerifyTokenExpiry: { gt: expect.any(Date) },
      },
    })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        email: 'victim@example.com',
        emailVerified: expect.any(Date),
        pendingEmail: null,
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
      },
    })
  })

  it('no pisa un email ja ocupat per un altre usuari', async () => {
    const { POST } = await import('@/app/api/auth/verify-email/route')
    mockFindFirst.mockResolvedValue({
      id: 'user-1',
      pendingEmail: 'victim@example.com',
    })
    mockFindUnique.mockResolvedValue({ id: 'google-user' })

    const response = await POST(postVerify('b'.repeat(64)))
    expect(response.status).toBe(409)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
