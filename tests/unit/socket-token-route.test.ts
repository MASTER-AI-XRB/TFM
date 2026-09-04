import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createSessionToken, sessionCookieName } from '@/lib/auth'

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockGetServerSession = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}))

vi.mock('@/lib/nextauth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

const expiredLastLogin = () => {
  const date = new Date()
  date.setDate(date.getDate() - 31)
  return date
}

function postRequest(cookie?: string) {
  const headers = new Headers()
  if (cookie) {
    headers.set('cookie', `${sessionCookieName}=${cookie}`)
  }
  return new NextRequest('http://localhost:3000/api/auth/socket-token', {
    method: 'POST',
    headers,
  })
}

describe('POST /api/auth/socket-token', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockFindUnique.mockReset()
    mockUpdate.mockReset()
    mockGetServerSession.mockReset()
    mockGetServerSession.mockResolvedValue(null)
  })

  it('exporta POST i no GET, perquè el GET no pot mutar estat', async () => {
    const route = await import('@/app/api/auth/socket-token/route')
    expect(route.GET).toBeUndefined()
    expect(typeof route.POST).toBe('function')
  })

  it('retorna 401 sense sessió i no escriu a la base de dades', async () => {
    const { POST } = await import('@/app/api/auth/socket-token/route')
    const response = await POST(postRequest())
    expect(response.status).toBe(401)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('expira el nickname passwordless amb lastLoginAt > 30 dies via POST', async () => {
    const { POST } = await import('@/app/api/auth/socket-token/route')
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({
      id: 'user-1',
      nickname: 'veí',
      password: null,
      lastLoginAt: expiredLastLogin(),
    })
    mockUpdate.mockResolvedValue({ id: 'user-1', nickname: null })

    const response = await POST(postRequest())
    const body = await response.json()

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { nickname: null },
    })
    expect(response.status).toBe(200)
    expect(body).toEqual({ needsNickname: true })
  })

  it('emet token i cookie de sessió per a un usuari vàlid sense update', async () => {
    const { POST } = await import('@/app/api/auth/socket-token/route')
    const token = createSessionToken('user-2', 'anna')
    mockFindUnique.mockResolvedValue({
      id: 'user-2',
      nickname: 'anna',
      password: 'hashed',
      lastLoginAt: new Date(),
    })

    const response = await POST(postRequest(token ?? undefined))
    const body = await response.json()

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(body.nickname).toBe('anna')
    expect(body.socketToken).toBeTruthy()
    expect(response.cookies.get(sessionCookieName)?.value).toBeTruthy()
  })
})
