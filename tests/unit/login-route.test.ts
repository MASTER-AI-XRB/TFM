import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockCreate = vi.fn()
const mockDisconnect = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
    $disconnect: (...args: unknown[]) => mockDisconnect(...args),
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

vi.mock('@/lib/mailer', () => ({
  sendVerificationEmail: vi.fn(),
}))

function postLogin(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockFindUnique.mockReset()
    mockUpdate.mockReset()
    mockCreate.mockReset()
    mockDisconnect.mockReset()
    mockDisconnect.mockResolvedValue(undefined)
  })

  it('rebutja el login d’un usuari sense contrasenya i no n’escriu cap', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    mockFindUnique.mockResolvedValue({
      id: 'google-user',
      nickname: 'veígoogle',
      email: 'victim@example.com',
      password: null,
      sessionVersion: 0,
    })

    const response = await POST(
      postLogin({
        nickname: 'veigoogle',
        password: 'atacant1',
        isNewUser: false,
      })
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Nickname o contrasenya incorrectes')
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('accepta nickname i contrasenya correctes d’un usuari amb hash', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    const hash = await bcrypt.hash('secret1', 4)
    mockFindUnique.mockResolvedValue({
      id: 'user-pw',
      nickname: 'anna',
      email: 'anna@example.com',
      password: hash,
      sessionVersion: 2,
    })
    mockUpdate.mockResolvedValue({
      id: 'user-pw',
      nickname: 'anna',
      password: hash,
      sessionVersion: 2,
    })

    const response = await POST(
      postLogin({
        nickname: 'anna',
        password: 'secret1',
        isNewUser: false,
      })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.nickname).toBe('anna')
    expect(body.socketToken).toBeTruthy()
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-pw' },
      data: { lastLoginAt: expect.any(Date) },
    })
  })
})
