'use client'

import { useI18n } from '@/lib/i18n'
import type { ViewMode } from '@/lib/client-session'
import { ViewModeToggle } from '@/components/products/ViewModeToggle'
import { RefreshSpinButton } from '@/components/products/RefreshSpinButton'
import { AppPrimaryLink } from '@/components/AppNavLink'

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
      <AppPrimaryLink href="/app/products/new" className="w-full sm:w-auto">
        {t('products.newProduct')}
      </AppPrimaryLink>
    </div>
  )
}
