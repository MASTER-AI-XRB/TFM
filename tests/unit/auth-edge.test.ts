import { describe, expect, it, beforeEach } from 'vitest'
import { createSessionToken } from '@/lib/auth'
import { verifySessionTokenEdge } from '@/lib/auth-edge'

describe('verifySessionTokenEdge', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret'
  })

  it('verifica un token creat amb createSessionToken (Node)', async () => {
    const token = createSessionToken('user-id', 'nickname')
    expect(token).toBeTruthy()
    const payload = await verifySessionTokenEdge(token)
    expect(payload).toEqual({ userId: 'user-id', nickname: 'nickname' })
  })

  it('rebutja un token manipulat', async () => {
    const token = createSessionToken('user-id', 'nickname')
    expect(await verifySessionTokenEdge(`${token}-x`)).toBeNull()
  })
})
