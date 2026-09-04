'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

type Props = {
  onRefresh: () => void
}

export function RefreshSpinButton({ onRefresh }: Props) {
  const { t } = useI18n()
  const [spinning, setSpinning] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        setSpinning(true)
        onRefresh()
        setTimeout(() => setSpinning(false), 500)
      }}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={t('products.refresh')}
      aria-label={t('products.refresh')}
    >
      <svg
        className={`w-6 h-6 text-gray-700 dark:text-gray-300 inline-block ${
          spinning ? 'animate-refresh-spin' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  )
}
