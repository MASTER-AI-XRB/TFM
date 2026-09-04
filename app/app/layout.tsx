'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { useI18n } from '@/lib/i18n'
import LanguageSelector from '@/components/LanguageSelector'
import ThemeToggle from '@/components/ThemeToggle'
import { AppSocketProvider } from '@/components/AppSocketProvider'
import { clearStoredSession, getStoredNickname, setStoredSession } from '@/lib/client-session'
import { useStoredNickname } from '@/lib/use-stored-nickname'
import DevConsole from '@/components/DevConsole'
import { NavNotificationsBell } from '@/components/NavNotificationsBell'
import { AppInfoPopup } from '@/components/AppInfoPopup'
import { MobileNavCarousel } from '@/components/MobileNavCarousel'
import { AppDesktopNav } from '@/components/AppDesktopNav'
import { AppMobileMenu } from '@/components/AppMobileMenu'
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding-context'
import { useSocketTokenMutation } from '@/lib/use-socket-token'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [nickname, setNickname] = useState<string | null>(null)
  const [socketReady, setSocketReady] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const storedNickname = useStoredNickname()
  const router = useRouter()
  const pathname = usePathname()
  const sessionHook = useSession()
  const { data: session, status } = sessionHook ?? { data: null, status: 'loading' as const }
  const { t } = useI18n()
  const initialSyncDone = useRef(false)
  const firstFetchDone = useRef(false)
  const { trigger: fetchSocketToken } = useSocketTokenMutation()

  useEffect(() => {
    let cancelled = false

    const applyTokenData = (data: {
      nickname?: string
      socketToken?: string
      needsNickname?: boolean
    }) => {
      if (cancelled) return
      if (data?.needsNickname) {
        // Handshake OAuth: full navigation (evita router.replace dins useEffect).
        clearStoredSession()
        if (pathname !== '/app/complete-profile') {
          window.location.assign('/app/complete-profile')
        }
        return
      }
      if (data?.nickname && data?.socketToken) {
        setStoredSession(data.nickname, data.socketToken)
        setNickname(data.nickname)
        setSocketReady(true)
        return
      }
      firstFetchDone.current = false
      clearStoredSession()
    }

    const savedNickname = getStoredNickname()
    if (savedNickname) {
      if (!initialSyncDone.current) {
        initialSyncDone.current = true
        setNickname(savedNickname)
        setSocketReady(true)
      }
      // Renovar cookie httpOnly si cal (middleware ja ha validat l’accés)
      if (!firstFetchDone.current) {
        firstFetchDone.current = true
        void fetchSocketToken()
          .then((data) => {
            if (cancelled || !data) return
            if (data.needsNickname) {
              clearStoredSession()
              window.location.assign('/app/complete-profile')
              return
            }
            if (data.nickname && data.socketToken) {
              setStoredSession(data.nickname, data.socketToken)
              setNickname(data.nickname)
              setSocketReady(true)
            }
          })
          .catch(() => {
            if (!cancelled) firstFetchDone.current = false
          })
      }
    } else {
      initialSyncDone.current = true
      if (
        pathname !== '/app/complete-profile' &&
        status !== 'loading' &&
        session &&
        !firstFetchDone.current
      ) {
        firstFetchDone.current = true
        void fetchSocketToken()
          .then(applyTokenData)
          .catch(() => {
            if (!cancelled) {
              firstFetchDone.current = false
              clearStoredSession()
            }
          })
      }
    }

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- session?.user?.id evita bucle quan useSession retorna nova referència
  }, [router, pathname, status, session?.user?.id, fetchSocketToken])

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    clearStoredSession()
    if (session) {
      signOut({ redirect: false }).catch(() => null)
    }
    router.push('/')
  }

  if (!nickname) {
    if (pathname === '/app/complete-profile') {
      return <main>{children}</main>
    }
    // Si hi ha nickname a localStorage, l’effect el posarà; no redirigir abans (evita bucle / ↔ /app)
    if (storedNickname) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
        </main>
      )
    }
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <AppSocketProvider ready={socketReady}>
    <OnboardingProvider>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav
        className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700"
        aria-label="Barra superior"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-2 md:gap-4">
            {/* Logo */}
            <Link href="/app" className="flex items-center shrink-0">
              <div className="rounded-full overflow-hidden p-0.5 sm:p-1">
                <Image
                  src="/xarxa_logo.jpg"
                  alt="Xarxa Anglesola"
                  width={40}
                  height={40}
                  className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full object-cover"
                  priority
                />
              </div>
            </Link>
            {/* Missatge de benvinguda a l'esquerra, sempre visible */}
            <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm shrink-0 whitespace-nowrap ml-1">
              {t('nav.hello', { nickname })}
            </span>
            <MobileNavCarousel pathname={pathname} t={t} />
            <AppDesktopNav t={t} />
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
              <div className="hidden md:flex items-center gap-1 shrink-0">
                <ThemeToggle />
                <LanguageSelector />
              </div>
              <AppInfoPopup />
              <NavNotificationsBell />
              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white hover:bg-red-600 transition shrink-0"
                title={t('nav.logout')}
                aria-label={t('nav.logout')}
              >
                <span className="text-lg leading-none" aria-hidden>
                  ⏻
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {mobileMenuOpen ? (
            <AppMobileMenu
              t={t}
              onClose={() => setMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          ) : null}
        </div>
      </nav>
      <AppMain>{children}</AppMain>
      <DevConsole />
    </div>
    </OnboardingProvider>
    </AppSocketProvider>
  )
}

function AppMain({ children }: { children: React.ReactNode }) {
  const { isOnboardingActive } = useOnboarding()
  return (
    <main className={isOnboardingActive ? 'hidden' : undefined}>
      {children}
    </main>
  )
}

