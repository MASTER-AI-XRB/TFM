'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'
import { NAV_ITEMS, NAV_ICON_PATHS } from '@/components/nav-items'

const LINK_CLASS =
  'flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition'

type Props = {
  t: (key: string) => string
  onClose: () => void
  onLogout: () => void
}

export function AppMobileMenu({ t, onClose, onLogout }: Props) {
  return (
    <div className="md:hidden border-t dark:border-gray-700 py-4">
      <div className="flex items-center gap-2 px-3 pb-3 mb-2 border-b dark:border-gray-700">
        <ThemeToggle />
        <LanguageSelector />
        <button
          type="button"
          onClick={() => {
            onClose()
            onLogout()
          }}
          className="ml-auto flex items-center justify-center w-9 h-9 rounded-full bg-red-500 text-white hover:bg-red-600 transition shrink-0"
          title={t('nav.logout')}
          aria-label={t('nav.logout')}
        >
          <span className="text-lg leading-none" aria-hidden>
            ⏻
          </span>
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={LINK_CLASS}
            aria-label={t(item.titleKey)}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {NAV_ICON_PATHS[item.icon]}
            </svg>
            {t(item.titleKey)}
          </Link>
        ))}
      </div>
    </div>
  )
}
