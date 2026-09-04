import { logError } from '@/lib/client-logger'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i)
  return out
}

/** Registers web push when permission is already granted. Returns the active subscription. */
export async function registerPushSubscription(
  signal: AbortSignal
): Promise<PushSubscription | null> {
  if (typeof window === 'undefined') return null
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  if (window.Notification?.permission !== 'granted') return null

  try {
    const vapidRes = await fetch('/api/notifications/vapid-public-key', { signal })
    if (!vapidRes.ok) return null
    const { publicKey } = await vapidRes.json()
    if (!publicKey || signal.aborted) return null

    const reg = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' })
    await reg.update()
    if (signal.aborted) return null

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })
    }
    if (!sub || signal.aborted) {
      if (sub && signal.aborted) {
        await sub.unsubscribe().catch(() => {})
      }
      return null
    }

    const res = await fetch('/api/notifications/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
      credentials: 'same-origin',
      signal,
    })
    if (!res.ok) {
      logError('push-subscribe failed', res.status)
      return null
    }
    return sub
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      logError('registerPushSubscription', error)
    }
    return null
  }
}
