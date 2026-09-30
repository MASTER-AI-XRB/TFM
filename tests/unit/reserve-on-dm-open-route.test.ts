import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createSessionToken, sessionCookieName } from '@/lib/auth'

const mockUserFindUnique = vi.fn()
const mockProductFindUnique = vi.fn()
const mockProductUpdateMany = vi.fn()
const mockFavoriteFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    product: {
      findUnique: (...args: unknown[]) => mockProductFindUnique(...args),
      updateMany: (...args: unknown[]) => mockProductUpdateMany(...args),
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

function postReserve(body?: Record<string, unknown>, cookie?: string) {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (cookie) headers.set('cookie', `${sessionCookieName}=${cookie}`)
  return new NextRequest(
    `http://localhost:3000/api/products/${PRODUCT_ID}/reserve-on-dm-open`,
    {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }
  )
}

describe('POST /api/products/[id]/reserve-on-dm-open', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
    mockUserFindUnique.mockReset()
    mockProductFindUnique.mockReset()
    mockProductUpdateMany.mockReset()
    mockFavoriteFindMany.mockReset()
    mockUserFindUnique.mockResolvedValue({ sessionVersion: 0, nickname: 'veí' })
    mockFavoriteFindMany.mockResolvedValue([])
  })

  it('retorna 401 sense sessió', async () => {
    const { POST } = await import('@/app/api/products/[id]/reserve-on-dm-open/route')
    const response = await POST(postReserve({ ownerNickname: 'propietari' }), {
      params: Promise.resolve({ id: PRODUCT_ID }),
    })
    expect(response.status).toBe(401)
    expect(mockProductUpdateMany).not.toHaveBeenCalled()
  })

  it('no reserva si el nickname no és el del propietari', async () => {
    const { POST } = await import('@/app/api/products/[id]/reserve-on-dm-open/route')
    const token = createSessionToken('neighbor-id', 'veí', 0)
    mockProductFindUnique.mockResolvedValue({
      id: PRODUCT_ID,
      userId: 'owner-id',
      reserved: false,
      name: 'Taladro',
      user: { nickname: 'propietari' },
    })

    const response = await POST(
      postReserve({ ownerNickname: 'un-altre' }, token ?? undefined),
      { params: Promise.resolve({ id: PRODUCT_ID }) }
    )

    expect(response.status).toBe(403)
    expect(mockProductUpdateMany).not.toHaveBeenCalled()
  })

  it('reserva si el caller no és propietari i el nickname coincideix', async () => {
    const { POST } = await import('@/app/api/products/[id]/reserve-on-dm-open/route')
    const token = createSessionToken('neighbor-id', 'veí', 0)
    mockProductFindUnique.mockResolvedValue({
      id: PRODUCT_ID,
      userId: 'owner-id',
      reserved: false,
      name: 'Taladro',
      user: { nickname: 'propietari' },
    })
    mockProductUpdateMany.mockResolvedValue({ count: 1 })

    const response = await POST(
      postReserve({ ownerNickname: 'propietari' }, token ?? undefined),
      { params: Promise.resolve({ id: PRODUCT_ID }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.reserved).toBe(true)
    expect(mockProductUpdateMany).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID, reserved: false },
      data: { reserved: true, reservedById: 'neighbor-id' },
    })
  })
})
