function firstHeaderValue(value: string | null): string | null {
  if (!value) return null
  const first = value.split(',')[0]?.trim()
  return first || null
}

/** IP de client per rate-limit. No es fia de X-Forwarded-For (spoofable). */
export function getClientIp(headers: Headers): string {
  const vercel = firstHeaderValue(headers.get('x-vercel-forwarded-for'))
  if (vercel) return vercel
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}
