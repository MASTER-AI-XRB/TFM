import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createSessionToken, sessionCookieName } from '@/lib/auth'

const mockUserFindUnique = vi.fn()
const mockUserDelete = vi.fn()
const mockProductFindMany = vi.fn()
const mockDeleteStored = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      delete: (...args: unknown[]) => mockUserDelete(...args),
    },
    product: {
      findMany: (...args: unknown[]) => mockProductFindMany(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

vi.mock('@/lib/stored-images', async () => {
  const actual = await vi.importActual<typeof import('@/lib/stored-images')>(
    '@/lib/stored-images'
  )
  return {
    ...actual,
    deleteStoredProductImages: (...args: unknown[]) => mockDeleteStored(...args),
  }
})

describe('DELETE /api/gdpr/delete', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockUserFindUnique.mockReset()
    mockUserDelete.mockReset()
    mockProductFindMany.mockReset()
    mockDeleteStored.mockReset()
    mockDeleteStored.mockResolvedValue(undefined)
    mockUserDelete.mockResolvedValue({})
  })

  it('esborra imatges dels productes abans d’eliminar el compte', async () => {
    const { DELETE } = await import('@/app/api/gdpr/delete/route')
    const token = createSessionToken('user-1', 'anna', 0)
    mockUserFindUnique.mockImplementation(async (args: { select?: { sessionVersion?: boolean } }) => {
      if (args?.select?.sessionVersion) return { sessionVersion: 0 }
      return { id: 'user-1', nickname: 'anna' }
    })
    mockProductFindMany.mockResolvedValue([
      { images: '["https://abc.public.blob.vercel-storage.com/a.png"]' },
      { images: '["/uploads/b.jpg"]' },
    ])

    const headers = new Headers()
    headers.set('cookie', `${sessionCookieName}=${token}`)
    const request = new NextRequest('http://localhost:3000/api/gdpr/delete', {
      method: 'DELETE',
      headers,
    })

    const response = await DELETE(request)
    expect(response.status).toBe(200)
    expect(mockProductFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { images: true },
    })
    expect(mockDeleteStored).toHaveBeenCalledTimes(2)
    expect(mockUserDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
  })
})
