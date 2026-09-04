'use client'

import { useSyncExternalStore } from 'react'

function subscribeNoop(_onStoreChange: () => void) {
  return () => {}
}

function getIsVercelProductionSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname.includes('vercel.app') || hostname.includes('vercel.com')
}

/** Stable false on the server and during hydration; reads hostname only on the client. */
export function useIsVercelProduction(): boolean {
  return useSyncExternalStore(subscribeNoop, getIsVercelProductionSnapshot, () => false)
}
