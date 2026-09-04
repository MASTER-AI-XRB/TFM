'use client'

import { useSyncExternalStore } from 'react'
import { SESSION_CHANGE_EVENT } from '@/lib/client-session'

function subscribeStoredNickname(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener('storage', handler)
  window.addEventListener(SESSION_CHANGE_EVENT, handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(SESSION_CHANGE_EVENT, handler)
  }
}

function getStoredNicknameSnapshot(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('nickname')
}

export function useStoredNickname(): string | null {
  return useSyncExternalStore(
    subscribeStoredNickname,
    getStoredNicknameSnapshot,
    () => null
  )
}
