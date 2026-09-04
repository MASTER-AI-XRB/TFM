'use client'

import { useSyncExternalStore } from 'react'
import { getSocketUrl } from '@/lib/socket'

const SOCKET_URL_OVERRIDE_KEY = 'socketUrlOverride'

function subscribeSocketUrl(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

function getSocketUrlSnapshot(): string | null {
  if (typeof window === 'undefined') return null
  return getSocketUrl()
}

/** URL del socket només al client; snapshot servidor sempre null (evita mismatch d'hidratació). */
export function useSocketUrlClient(): string | null {
  return useSyncExternalStore(subscribeSocketUrl, getSocketUrlSnapshot, () => null)
}

export { SOCKET_URL_OVERRIDE_KEY }
