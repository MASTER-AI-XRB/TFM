import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockFindUnique = vi.fn()
const mockFindFirst = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockSendVerificationEmail = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

vi.mock('@/lib/mailer', () => ({
  sendVerificationEmail: (...args: unknown[]) => mockSendVerificationEmail(...args),
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}))

function postLogin(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login isNewUser email occupancy', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockFindUnique.mockReset()
    mockFindFirst.mockReset()
    mockCreate.mockReset()
    mockUpdate.mockReset()
    mockSendVerificationEmail.mockReset()
    mockSendVerificationEmail.mockResolvedValue(undefined)
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({
      id: 'new-user',
      nickname: 'anna',
      sessionVersion: 0,
      pendingEmail: 'anna@example.com',
    })
  })

  it('crea el compte sense ocupar User.email i desa pendingEmail', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    const response = await POST(
      postLogin({
        nickname: 'anna',
        email: 'anna@example.com',
        password: 'secret1',
        isNewUser: true,
      })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.needsEmailVerification).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nickname: 'anna',
        email: null,
        pendingEmail: 'anna@example.com',
        emailVerifyToken: expect.any(String),
        emailVerifyTokenExpiry: expect.any(Date),
      }),
    })
    expect(mockSendVerificationEmail).toHaveBeenCalled()
  })
})
