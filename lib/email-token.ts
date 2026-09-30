import crypto from 'crypto'

export function hashEmailToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export function newEmailToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('hex')
  return { raw, hash: hashEmailToken(raw) }
}

export function emailTokenExpiry(hours = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
