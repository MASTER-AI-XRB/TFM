'use client'

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

type OnboardingContextValue = {
  isOnboardingActive: boolean
  setOnboardingActive: (active: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const value = useMemo(
    () => ({ isOnboardingActive, setOnboardingActive: setIsOnboardingActive }),
    [isOnboardingActive]
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) return { isOnboardingActive: false, setOnboardingActive: () => {} }
  return ctx
}
