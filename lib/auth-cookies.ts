import { NextResponse } from 'next/server'
import { NEXTAUTH_SESSION_COOKIES, SESSION_COOKIE_NAME } from '@/lib/auth-guard'

export const NEXTAUTH_COOKIES_TO_CLEAR = [
  ...NEXTAUTH_SESSION_COOKIES,
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
] as const

export function expireAuthCookies(response: NextResponse) {
  const productionSecure = process.env.NODE_ENV === 'production'
  const names = [SESSION_COOKIE_NAME, ...NEXTAUTH_COOKIES_TO_CLEAR]
  for (const name of names) {
    const prefixed = name.startsWith('__Secure-') || name.startsWith('__Host-')
    response.cookies.set(name, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: prefixed || productionSecure,
      maxAge: 0,
      path: '/',
    })
  }
}

export function nextAuthSessionTokenFromRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined }
}): string | null {
  return (
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    null
  )
}
