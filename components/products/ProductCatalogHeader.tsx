'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import type { ViewMode } from '@/lib/client-session'
import { ViewModeToggle } from '@/components/products/ViewModeToggle'
import { RefreshSpinButton } from '@/components/products/RefreshSpinButton'

type ProductCatalogHeaderProps = {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onRefresh: () => void
}

export function ProductCatalogHeader({
  viewMode,
  onViewModeChange,
  onRefresh,
}: ProductCatalogHeaderProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t('products.title')}
        </h1>
        <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
        <RefreshSpinButton onRefresh={onRefresh} />
      </div>
      <Link
        href="/app/products/new"
        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm sm:text-base"
      >
        {t('products.newProduct')}
      </Link>
    </div>
  )
}
