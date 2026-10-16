import { describe, expect, it } from 'vitest'
import {
  isNotifyAuthorized,
  isSessionVersionCurrent,
  resolveHandshakePrincipal,
} from '@/lib/socket-security'

describe('isNotifyAuthorized', () => {
  it('rebutja si no hi ha secret (fail-closed)', () => {
    expect(isNotifyAuthorized('', 'token')).toBe(false)
    expect(isNotifyAuthorized(undefined, 'token')).toBe(false)
    expect(isNotifyAuthorized('secret', undefined)).toBe(false)
  })

  it('rebutja un token incorrecte', () => {
    expect(isNotifyAuthorized('secret', 'wrong')).toBe(false)
  })

  it('accepta el token exacte', () => {
    expect(isNotifyAuthorized('secret', 'secret')).toBe(true)
  })
})

describe('resolveHandshakePrincipal', () => {
  it('no accepta userId/nickname de la query si NODE_ENV no és development', () => {
    expect(
      resolveHandshakePrincipal({
        tokenUserId: null,
        tokenNickname: null,
        query: { userId: 'attacker', nickname: 'fake' },
        nodeEnv: 'production',
      })
    ).toEqual({ userId: null, nickname: null })

    expect(
      resolveHandshakePrincipal({
        tokenUserId: null,
        tokenNickname: null,
        query: { userId: 'attacker', nickname: 'fake' },
        nodeEnv: undefined,
      })
    ).toEqual({ userId: null, nickname: null })
  })

  it('només en development omple la identitat des de la query si falta el token', () => {
    expect(
      resolveHandshakePrincipal({
        tokenUserId: null,
        tokenNickname: null,
        query: { userId: 'dev-user', nickname: 'devnick' },
        nodeEnv: 'development',
      })
    ).toEqual({ userId: 'dev-user', nickname: 'devnick' })
  })

  it('prefereix el token HMAC davant la query', () => {
    expect(
      resolveHandshakePrincipal({
        tokenUserId: 'real-id',
        tokenNickname: 'anna',
        query: { userId: 'attacker', nickname: 'fake' },
        nodeEnv: 'development',
      })
    ).toEqual({ userId: 'real-id', nickname: 'anna' })
  })
})

describe('isSessionVersionCurrent', () => {
  it('accepta quan el sv del token coincideix amb User.sessionVersion', () => {
    expect(isSessionVersionCurrent(0, 0)).toBe(true)
    expect(isSessionVersionCurrent(3, 3)).toBe(true)
    expect(isSessionVersionCurrent(undefined, 0)).toBe(true)
  })

  it('rebutja un token mintat abans d’incrementar sessionVersion', () => {
    expect(isSessionVersionCurrent(0, 1)).toBe(false)
    expect(isSessionVersionCurrent(2, 3)).toBe(false)
    expect(isSessionVersionCurrent(0, null)).toBe(false)
    expect(isSessionVersionCurrent(0, undefined)).toBe(false)
  })
})
