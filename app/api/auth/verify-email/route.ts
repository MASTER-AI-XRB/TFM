import { NextRequest } from 'next/server'
import { apiError, apiOk } from '@/lib/api-response'
import { logError } from '@/lib/logger'
import { verifyEmailToken } from '@/lib/verify-email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json().catch(() => ({ token: '' }))
    const outcome = await verifyEmailToken(
      typeof token === 'string' ? token : ''
    )

    if (outcome === 'taken') {
      return apiError('Aquest email ja està registrat', 409)
    }
    if (outcome === 'invalid') {
      return apiError('Token invàlid o expirat', 400)
    }

    return apiOk({ ok: true })
  } catch (error) {
    logError('Error verificant email:', error)
    return apiError('Error verificant l\'email', 500)
  }
}
