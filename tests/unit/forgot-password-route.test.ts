import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { hashEmailToken } from '@/lib/email-token'

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockSendMail = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      sendMail: (...args: unknown[]) => mockSendMail(...args),
    }),
  },
}))

function postForgot(email: string) {
  return new NextRequest('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.EMAIL_HOST = 'smtp.test.local'
    process.env.EMAIL_USER = 'user'
    process.env.EMAIL_PASS = 'pass'
    mockFindUnique.mockReset()
    mockUpdate.mockReset()
    mockSendMail.mockReset()
    mockSendMail.mockResolvedValue({})
    mockUpdate.mockResolvedValue({})
  })

  it('desa el hash del token, no el hex cru que s’envia al correu', async () => {
    const { POST } = await import('@/app/api/auth/forgot-password/route')
    mockFindUnique.mockResolvedValue({
      id: 'user-reset',
      email: 'anna@example.com',
      nickname: 'anna',
    })

    const response = await POST(postForgot('anna@example.com'))
    expect(response.status).toBe(200)

    const stored = mockUpdate.mock.calls[0]?.[0]?.data?.resetToken as string
    expect(stored).toMatch(/^[a-f0-9]{64}$/)

    const html = String(mockSendMail.mock.calls[0]?.[0]?.html ?? '')
    const mailed = html.match(/reset-password\/([a-f0-9]{64})/)?.[1]
    expect(mailed).toBeTruthy()
    expect(stored).toBe(hashEmailToken(mailed as string))
    expect(stored).not.toBe(mailed)
  })
})
