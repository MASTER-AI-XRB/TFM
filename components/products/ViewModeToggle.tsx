'use client'

import type { ViewMode } from '@/lib/client-session'
import { useI18n } from '@/lib/i18n'

type Props = {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ viewMode, onChange }: Props) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={() => onChange(viewMode === 'grid' ? 'list' : 'grid')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={
        viewMode === 'grid'
          ? t('products.switchToListView')
          : t('products.switchToGridView')
      }
      aria-label={
        viewMode === 'grid'
          ? t('products.switchToListView')
          : t('products.switchToGridView')
      }
    >
      {viewMode === 'grid' ? (
        <svg
          className="w-6 h-6 text-gray-700 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-gray-700 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      )}
    </button>
  )
}
