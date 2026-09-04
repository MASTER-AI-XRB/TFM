'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { useStoredViewMode } from '@/lib/use-stored-view-mode'
import { useProductCatalog } from '@/lib/use-product-catalog'
import { ProductCatalogHeader } from '@/components/products/ProductCatalogHeader'
import { ProductCardsView } from '@/components/products/ProductCardsView'
import { ProductFiltersPanel } from '@/components/products/ProductFiltersPanel'
import { ProductOwnerActions } from '@/components/products/ProductOwnerActions'
import { ProductReserveControl } from '@/components/products/ProductReserveControl'
import { ProductLoanBadge } from '@/components/products/ProductLoanBadge'
import { CatalogFavoriteButton } from '@/components/products/CatalogFavoriteButton'

export default function ProductsPage() {
  const [viewMode, setViewMode] = useStoredViewMode()
  const { t } = useI18n()
  const {
    products,
    filteredProducts,
    favorites,
    filters,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    nickname,
    loading,
    refreshProducts,
    handleFilterChange,
    clearFilters,
    toggleFavorite,
    toggleReserved,
    togglePrestec,
    deleteProduct,
  } = useProductCatalog()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <ProductCatalogHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={refreshProducts}
      />

      <ProductFiltersPanel
        filters={filters}
        mobileOpen={mobileFiltersOpen}
        onMobileOpenChange={setMobileFiltersOpen}
        onChange={(key, value) => handleFilterChange(key, value)}
        onClear={clearFilters}
        filteredCount={filteredProducts.length}
        totalCount={products.length}
      />

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('products.noProductsPublished')}</p>
          <Link
            href="/app/products/new"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            {t('products.beFirst')}
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('products.noResults')}</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            {t('products.filters.clearFilters')}
          </button>
        </div>
      ) : (
        <ProductCardsView
          products={filteredProducts}
          viewMode={viewMode}
          nickname={nickname}
          showFavoritesCount
          renderActions={(product) =>
            product.user.nickname === nickname ? (
              <ProductOwnerActions
                product={product}
                nickname={nickname}
                onToggleReserved={(e) => void toggleReserved(product.id, e)}
                onToggleLoan={(e) => void togglePrestec(product.id, e)}
                onDelete={(e) => void deleteProduct(product.id, e)}
              />
            ) : (
              <>
                <ProductReserveControl
                  product={product}
                  nickname={nickname}
                  onUnreserve={(e) => void toggleReserved(product.id, e)}
                />
                {product.prestec ? <ProductLoanBadge /> : null}
                <CatalogFavoriteButton
                  productId={product.id}
                  isFavorite={favorites.has(product.id)}
                  onToggle={(e) => void toggleFavorite(product.id, e)}
                />
              </>
            )
          }
        />
      )}
    </div>
  )
}
