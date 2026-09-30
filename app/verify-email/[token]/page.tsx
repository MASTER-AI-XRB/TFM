import { VerifyEmailResult } from '@/components/auth/VerifyEmailResult'
import { logError } from '@/lib/logger'
import { verifyEmailToken, type VerifyEmailOutcome } from '@/lib/verify-email'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ token: string }>
}

export default async function VerifyEmailPage({ params }: PageProps) {
  const { token } = await params

  let state: VerifyEmailOutcome = 'invalid'
  try {
    state = await verifyEmailToken(token ?? '')
  } catch (error) {
    logError('Error verificant email a la pàgina:', error)
    state = 'invalid'
  }

  return <VerifyEmailResult state={state} />
}
