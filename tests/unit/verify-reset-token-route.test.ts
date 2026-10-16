import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { hashEmailToken } from '@/lib/email-token'

const mockFindFirst = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

describe('GET /api/auth/verify-reset-token', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
  })

  it('busca el token per hash SHA-256, no pel valor cru de la query', async () => {
    const { GET } = await import('@/app/api/auth/verify-reset-token/route')
    mockFindFirst.mockResolvedValue({ id: 'user-reset' })

    const request = new NextRequest(
      'http://localhost:3000/api/auth/verify-reset-token?token=valid-token'
    )
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.valid).toBe(true)
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        resetToken: hashEmailToken('valid-token'),
        resetTokenExpiry: { gt: expect.any(Date) },
      },
    })
  })
})
