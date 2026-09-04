'use client'

import { useI18n } from '@/lib/i18n'

export type ProductFiltersState = {
  name: string
  user: string
  dateFrom: string
  dateTo: string
}

type Props = {
  filters: ProductFiltersState
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  onChange: (key: keyof ProductFiltersState, value: string) => void
  onClear: () => void
  filteredCount: number
  totalCount: number
}

export function ProductFiltersPanel({
  filters,
  mobileOpen,
  onMobileOpenChange,
  onChange,
  onClear,
  filteredCount,
  totalCount,
}: Props) {
  const { t } = useI18n()
  const activeCount = [filters.name, filters.user, filters.dateFrom, filters.dateTo].filter(
    Boolean
  ).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 mb-6">
      <button
        type="button"
        onClick={() => onMobileOpenChange(!mobileOpen)}
        className="md:hidden w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700"
      >
        <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {t('products.filters.title')}
          {activeCount > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
            mobileOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`${mobileOpen ? 'block' : 'hidden'} md:block p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="min-w-0">
            <label
              htmlFor="filter-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('products.filters.name')}
            </label>
            <input
              type="text"
              id="filter-name"
              value={filters.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder={t('products.filters.namePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor="filter-user"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('products.filters.user')}
            </label>
            <input
              type="text"
              id="filter-user"
              value={filters.user}
              onChange={(e) => onChange('user', e.target.value)}
              placeholder={t('products.filters.userPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor="filter-date-from"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('products.filters.dateFrom')}
            </label>
            <div className="flex">
              <input
                type="date"
                id="filter-date-from"
                value={filters.dateFrom}
                onChange={(e) => onChange('dateFrom', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minWidth: 0 }}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="filter-date-to"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('products.filters.dateTo')}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                id="filter-date-to"
                value={filters.dateTo}
                onChange={(e) => onChange('dateTo', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-full"
              />
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  title={t('products.filters.clearFilters')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
        {activeCount > 0 && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {t('products.showing', { filtered: filteredCount, total: totalCount })}
          </div>
        )}
      </div>
    </div>
  )
}
