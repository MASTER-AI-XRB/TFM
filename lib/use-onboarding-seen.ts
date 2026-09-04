import { useSyncExternalStore } from 'react'
import { ONBOARDING_CHANGE_EVENT, ONBOARDING_KEY } from '@/lib/onboarding-constants'

export function markOnboardingSeen() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ONBOARDING_KEY, '1')
  window.dispatchEvent(new Event(ONBOARDING_CHANGE_EVENT))
}

function subscribeOnboardingSeen(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => onStoreChange()
  window.addEventListener(ONBOARDING_CHANGE_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(ONBOARDING_CHANGE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

function getOnboardingSeenSnapshot(): boolean {
  if (typeof window === 'undefined') return true
  return !!window.localStorage.getItem(ONBOARDING_KEY)
}

export function useOnboardingSeen(): boolean {
  return useSyncExternalStore(
    subscribeOnboardingSeen,
    getOnboardingSeenSnapshot,
    () => true
  )
}
