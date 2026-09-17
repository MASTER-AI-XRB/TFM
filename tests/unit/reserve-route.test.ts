import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createSessionToken, sessionCookieName } from '@/lib/auth'

const mockUserFindUnique = vi.fn()
const mockProductFindUnique = vi.fn()
const mockProductUpdate = vi.fn()
const mockFavoriteFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      update: (...args: unknown[]) => mockProductUpdate(...args),
    },
    favorite: {
      findMany: (...args: unknown[]) => mockFavoriteFindMany(...args),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}))

vi.mock('@/lib/socket', () => ({
  getSocketServerUrl: () => null,
}))

vi.mock('@/lib/notify-fetch', () => ({
  postSocketNotify: vi.fn(),
}))

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111'

function patchReserve(reserved: boolean, cookie?: string) {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (cookie) headers.set('cookie', `${sessionCookieName}=${cookie}`)
  return new NextRequest(`http://localhost:3000/api/products/${PRODUCT_ID}/reserve`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ reserved }),
  })
}

describe('PATCH /api/products/[id]/reserve', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockUserFindUnique.mockReset()
    mockProductFindUnique.mockReset()
    mockProductUpdate.mockReset()
    mockFavoriteFindMany.mockReset()
    mockUserFindUnique.mockResolvedValue({ sessionVersion: 0, nickname: 'propietari' })
    mockFavoriteFindMany.mockResolvedValue([])
    mockProductUpdate.mockResolvedValue({ reserved: false })
  })

  it('permet al propietari alliberar una reserva feta per un altre veí', async () => {
    const { PATCH } = await import('@/app/api/products/[id]/reserve/route')
    const token = createSessionToken('owner-id', 'propietari', 0)
    mockProductFindUnique.mockResolvedValue({
      id: PRODUCT_ID,
      userId: 'owner-id',
      name: 'Taladro',
      reserved: true,
      reservedById: 'neighbor-id',
    })

    const response = await PATCH(patchReserve(false, token ?? undefined), {
      params: Promise.resolve({ id: PRODUCT_ID }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.reserved).toBe(false)
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: { reserved: false, reservedById: null },
    })
  })

  it('rebutja desreservar si el caller no és ni propietari ni qui va reservar', async () => {
    const { PATCH } = await import('@/app/api/products/[id]/reserve/route')
    const token = createSessionToken('stranger-id', 'altre', 0)
    mockProductFindUnique.mockResolvedValue({
      id: PRODUCT_ID,
      userId: 'owner-id',
      name: 'Taladro',
      reserved: true,
      reservedById: 'neighbor-id',
    })

    const response = await PATCH(patchReserve(false, token ?? undefined), {
      params: Promise.resolve({ id: PRODUCT_ID }),
    })

    expect(response.status).toBe(403)
    expect(mockProductUpdate).not.toHaveBeenCalled()
  })
})
