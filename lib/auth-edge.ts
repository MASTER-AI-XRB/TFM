import {
  NEXTAUTH_SESSION_COOKIES,
  SESSION_COOKIE_NAME,
  decideAuthRedirect,
  type AuthSessionPayload,
} from '@/lib/auth-guard'

function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-secret-change-me'
  }
  return null
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (padded.length % 4)) % 4
  const binary = atob(padded + '='.repeat(padLength))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function bytesToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

/**
 * Verificació de `xarxa_session` compatible amb Edge (middleware).
 * Mateix format HMAC-SHA256 + base64url que `verifySessionToken` a Node.
 * No importa `lib/auth` (Node crypto) — el middleware ha de restar Edge-safe.
 */
export async function verifySessionTokenEdge(
  token?: string | null
): Promise<AuthSessionPayload | null> {
  const secret = getSecret()
  if (!secret || !token) return null

  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(encoded)
    )
    const expected = bytesToBase64Url(sigBuffer)
    if (!timingSafeEqualString(signature, expected)) {
      return null
    }

    const payloadJson = new TextDecoder().decode(base64UrlToBytes(encoded))
    const payload = JSON.parse(payloadJson) as {
      userId?: string
      nickname?: string
      exp?: number
    }
    if (!payload?.userId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return {
      userId: payload.userId,
      nickname: payload.nickname ?? '',
    }
  } catch {
    return null
  }
}

export function hasNextAuthSessionCookie(
  getCookie: (name: string) => string | undefined
): boolean {
  return NEXTAUTH_SESSION_COOKIES.some((name) => Boolean(getCookie(name)))
}

export { decideAuthRedirect, SESSION_COOKIE_NAME as sessionCookieName }
