import { logWarn } from '@/lib/logger'

type NotifyContext = {
  targetUserId: string
  label: string
}

function formatNotifyError(status: number, body: string): string {
  if (status === 401) {
    return 'Revisa AUTH_SECRET/NOTIFY_SECRET (mateix a Vercel i Railway).'
  }
  try {
    const parsed = JSON.parse(body) as { error?: string }
    return (parsed?.error ?? body) || String(status)
  } catch {
    return body || String(status)
  }
}

/** POST to the socket notify endpoint; checks HTTP status before reading the body. */
export async function postSocketNotify(
  url: string,
  init: RequestInit,
  context: NotifyContext
): Promise<void> {
  try {
    const response = await fetch(url, init)
    if (response.ok || response.status === 404) {
      return
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      logWarn(`${context.label} fallit:`, {
        status: response.status,
        targetUserId: context.targetUserId,
        detail: formatNotifyError(response.status, body),
      })
    }
  } catch (err) {
    logWarn(`${context.label} error xarxa:`, {
      targetUserId: context.targetUserId,
      error: String((err as Error)?.message || err),
    })
  }
}
