'use client'

import { useSyncExternalStore } from 'react'
import {
  getStoredViewMode,
  setStoredViewMode,
  type ViewMode,
} from '@/lib/client-session'

export const VIEW_MODE_CHANGE_EVENT = 'xarxa-view-mode-change'

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener(VIEW_MODE_CHANGE_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(VIEW_MODE_CHANGE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

function setModeAndNotify(next: ViewMode) {
  setStoredViewMode(next)
}

export function useStoredViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const mode = useSyncExternalStore(
    subscribe,
    getStoredViewMode,
    () => 'list' as ViewMode
  )

  return [mode, setModeAndNotify]
}
