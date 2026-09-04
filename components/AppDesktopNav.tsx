'use client'

import Link from 'next/link'
import { NAV_ITEMS, NAV_ICON_PATHS } from '@/components/nav-items'

const LINK_CLASS =
  'group flex items-center justify-center rounded-lg p-2 text-gray-500 dark:text-gray-400 opacity-70 hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400 transition-[opacity,color,background-color,transform,box-shadow] duration-200 ease-out hover:scale-110 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:shadow-[0_0_18px_rgba(59,130,246,0.4)] dark:hover:shadow-[0_0_18px_rgba(96,165,250,0.35)]'

type Props = {
  t: (key: string) => string
}

export function AppDesktopNav({ t }: Props) {
  return (
    <nav
      className="hidden md:flex flex-1 min-w-0 justify-evenly items-center gap-1 px-6"
      aria-label="Navegació principal"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={LINK_CLASS}
          title={t(item.titleKey)}
          aria-label={t(item.titleKey)}
        >
          <svg
            className="h-5 w-5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {NAV_ICON_PATHS[item.icon]}
          </svg>
        </Link>
      ))}
    </nav>
  )
}
