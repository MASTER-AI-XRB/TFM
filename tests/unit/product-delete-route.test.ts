import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createSessionToken, sessionCookieName } from '@/lib/auth'

const mockUserFindUnique = vi.fn()
const mockProductFindUnique = vi.fn()
const mockProductDelete = vi.fn()
const mockFavoriteFindMany = vi.fn()
const mockDeleteStored = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      delete: (...args: unknown[]) => mockProductDelete(...args),
    },
    favorite: {
      findMany: (...args: unknown[]) => mockFavoriteFindMany(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}))

vi.mock('@/lib/socket', () => ({
  getSocketServerUrl: () => null,
}))

vi.mock('@/lib/notify-fetch', () => ({
  postSocketNotify: vi.fn(),
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

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111'

describe('DELETE /api/products/[id]', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockUserFindUnique.mockReset()
    mockProductFindUnique.mockReset()
    mockProductDelete.mockReset()
    mockFavoriteFindMany.mockReset()
    mockDeleteStored.mockReset()
    mockUserFindUnique.mockResolvedValue({ sessionVersion: 0 })
    mockProductDelete.mockResolvedValue({})
    mockDeleteStored.mockResolvedValue(undefined)
  })

  it('esborra objectes d’imatge abans d’eliminar la fila', async () => {
    const { DELETE } = await import('@/app/api/products/[id]/route')
    const token = createSessionToken('owner-id', 'propietari', 0)
    mockProductFindUnique.mockResolvedValue({
      id: PRODUCT_ID,
      userId: 'owner-id',
      name: 'Taladro',
      images: JSON.stringify(['https://abc.public.blob.vercel-storage.com/x.png']),
    })

    const headers = new Headers()
    headers.set('cookie', `${sessionCookieName}=${token}`)
    const request = new NextRequest(
      `http://localhost:3000/api/products/${PRODUCT_ID}`,
      { method: 'DELETE', headers }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: PRODUCT_ID }),
    })

    expect(response.status).toBe(200)
    expect(mockDeleteStored).toHaveBeenCalledWith(
      JSON.stringify(['https://abc.public.blob.vercel-storage.com/x.png'])
    )
    expect(mockProductDelete).toHaveBeenCalled()
  })
})
