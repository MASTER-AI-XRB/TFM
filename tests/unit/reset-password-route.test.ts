import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockFindFirst = vi.fn()
const mockUpdate = vi.fn()
const mockSessionDeleteMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    session: {
      deleteMany: (...args: unknown[]) => mockSessionDeleteMany(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

function postReset(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockUpdate.mockReset()
    mockSessionDeleteMany.mockReset()
    mockUpdate.mockResolvedValue({})
    mockSessionDeleteMany.mockResolvedValue({ count: 2 })
  })

  it('incrementa sessionVersion i esborra sessions NextAuth', async () => {
    const { POST } = await import('@/app/api/auth/reset-password/route')
    mockFindFirst.mockResolvedValue({
      id: 'user-reset',
      resetToken: 'valid-token',
      resetTokenExpiry: new Date(Date.now() + 60_000),
    })

    const response = await POST(
      postReset({ token: 'valid-token', password: 'nova-pass' })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.message).toMatch(/restablida/i)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-reset' },
      data: {
        password: expect.any(String),
        resetToken: null,
        resetTokenExpiry: null,
        sessionVersion: { increment: 1 },
      },
    })
    expect(mockSessionDeleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-reset' },
    })
  })
})
