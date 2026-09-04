/** Nom de la cookie de sessió de l’app (sense deps Node — usable a Edge). */
export const SESSION_COOKIE_NAME = 'xarxa_session'

export type AuthSessionPayload = {
  userId: string
  nickname: string
}

export type AuthGuardInput = {
  pathname: string
  session: AuthSessionPayload | null
  hasNextAuthCookie: boolean
}

export type AuthGuardResult =
  | { action: 'next' }
  | { action: 'redirect'; to: string }

function hasNickname(session: AuthSessionPayload | null): boolean {
  return Boolean(session?.nickname?.trim())
}

/**
 * Decisió pura de redirecció d’auth per pàgines (consumida pel middleware).
 * La cookie `xarxa_session` és la font de veritat; la cookie next-auth
 * només cobreix el handshake OAuth abans que s’emeti `xarxa_session`.
 */
export function decideAuthRedirect(input: AuthGuardInput): AuthGuardResult {
  const { pathname, session, hasNextAuthCookie } = input
  const authenticated = Boolean(session) || hasNextAuthCookie
  const nick = hasNickname(session)

  if (pathname === '/app/complete-profile') {
    if (!authenticated) {
      return { action: 'redirect', to: '/' }
    }
    if (nick) {
      return { action: 'redirect', to: '/app' }
    }
    return { action: 'next' }
  }

  if (pathname === '/app' || pathname.startsWith('/app/')) {
    if (!authenticated) {
      return { action: 'redirect', to: '/' }
    }
    if (session && !nick) {
      return { action: 'redirect', to: '/app/complete-profile' }
    }
    // next-auth sense xarxa_session encara: permet handshake (layout demana socket-token)
    return { action: 'next' }
  }

  if (pathname === '/') {
    if (nick || hasNextAuthCookie) {
      // Sessió app o handshake OAuth → /app (layout emet xarxa_session / complete-profile)
      return { action: 'redirect', to: '/app' }
    }
  }

  return { action: 'next' }
}

export const NEXTAUTH_SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
] as const
