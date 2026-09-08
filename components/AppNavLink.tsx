'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

const PRIMARY_CLASS =
  'inline-flex items-center justify-center bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-center text-sm sm:text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'

const SECONDARY_CLASS =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'

function cx(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type AppNavLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

export function AppPrimaryLink({ href, children, className }: AppNavLinkProps) {
  return (
    <Link href={href} className={cx(PRIMARY_CLASS, className)}>
      {children}
    </Link>
  )
}

export function AppSecondaryButton({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={cx(SECONDARY_CLASS, className)}>
      {children}
    </button>
  )
}
