import { describe, expect, it } from 'vitest'
import { decideAuthRedirect } from '@/lib/auth-guard'

describe('decideAuthRedirect', () => {
  it('redirigeix a / si /app no té sessió ni cookie next-auth', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app',
        session: null,
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'redirect', to: '/' })
  })

  it('permet /app amb sessió i nickname', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app/favorites',
        session: { userId: 'u1', nickname: 'anna' },
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'next' })
  })

  it('redirigeix a complete-profile si la sessió no té nickname', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app',
        session: { userId: 'u1', nickname: '' },
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'redirect', to: '/app/complete-profile' })
  })

  it('permet complete-profile sense nickname', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app/complete-profile',
        session: { userId: 'u1', nickname: '' },
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'next' })
  })

  it('permet complete-profile amb cookie next-auth encara sense xarxa_session', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app/complete-profile',
        session: null,
        hasNextAuthCookie: true,
      })
    ).toEqual({ action: 'next' })
  })

  it('redirigeix complete-profile a /app si ja té nickname', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app/complete-profile',
        session: { userId: 'u1', nickname: 'anna' },
        hasNextAuthCookie: true,
      })
    ).toEqual({ action: 'redirect', to: '/app' })
  })

  it('permet /app temporalment amb cookie next-auth (handshake OAuth)', () => {
    expect(
      decideAuthRedirect({
        pathname: '/app/chat',
        session: null,
        hasNextAuthCookie: true,
      })
    ).toEqual({ action: 'next' })
  })

  it('redirigeix / a /app si ja hi ha sessió amb nickname', () => {
    expect(
      decideAuthRedirect({
        pathname: '/',
        session: { userId: 'u1', nickname: 'anna' },
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'redirect', to: '/app' })
  })

  it('redirigeix / a /app si hi ha cookie next-auth (handshake OAuth)', () => {
    expect(
      decideAuthRedirect({
        pathname: '/',
        session: null,
        hasNextAuthCookie: true,
      })
    ).toEqual({ action: 'redirect', to: '/app' })
  })

  it('deixar passar / sense sessió', () => {
    expect(
      decideAuthRedirect({
        pathname: '/',
        session: null,
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'next' })
  })

  it('no aplica a rutes públiques com /privacy', () => {
    expect(
      decideAuthRedirect({
        pathname: '/privacy',
        session: null,
        hasNextAuthCookie: false,
      })
    ).toEqual({ action: 'next' })
  })
})
