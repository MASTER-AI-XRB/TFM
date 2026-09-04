'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import { useStoredNickname } from '@/lib/use-stored-nickname'
import { useStoredViewMode } from '@/lib/use-stored-view-mode'
import { useProductStateSync } from '@/lib/use-product-state-sync'
import { canUnreserveProduct } from '@/lib/product-fillets'
import { logError } from '@/lib/client-logger'
import type { ListProduct } from '@/lib/product-list-types'
import { ViewModeToggle } from '@/components/products/ViewModeToggle'
import { RefreshSpinButton } from '@/components/products/RefreshSpinButton'
import { ProductCardsView } from '@/components/products/ProductCardsView'
import { ProductReserveControl } from '@/components/products/ProductReserveControl'
import { ProductLoanBadge } from '@/components/products/ProductLoanBadge'

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useStoredViewMode()
  const nickname = useStoredNickname()
  const { t } = useI18n()

  const {
    data: products = [],
    isLoading: loading,
    mutate,
  } = useSWR<ListProduct[]>(nickname ? '/api/favorites' : null, {
    revalidateOnFocus: true,
  })

  useProductStateSync(mutate)

  const toggleReserved = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const product = products.find((p) => p.id === productId)
    if (!product || !canUnreserveProduct(product, nickname)) return
    const nextReserved = !product.reserved

    void mutate(
      (prev) =>
        prev?.map((p) =>
          p.id === productId
            ? {
                ...p,
                reserved: nextReserved,
                reservedBy: nextReserved && nickname ? { nickname } : null,
              }
            : p
        ),
      { revalidate: false }
    )

    try {
      const res = await fetch(`/api/products/${productId}/reserve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserved: nextReserved }),
      })
      if (!res.ok) {
        void mutate(
          (prev) =>
            prev?.map((p) =>
              p.id === productId
                ? { ...p, reserved: product.reserved, reservedBy: product.reservedBy }
                : p
            ),
          { revalidate: false }
        )
        logError('Error actualitzant reserva:', await res.json().catch(() => ({})))
      }
    } catch (err) {
      void mutate(
        (prev) =>
          prev?.map((p) =>
            p.id === productId
              ? { ...p, reserved: product.reserved, reservedBy: product.reservedBy }
              : p
          ),
        { revalidate: false }
      )
      logError('Error actualitzant reserva:', err)
    }
  }

  const removeFavorite = async (productId: string) => {
    try {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      void mutate(
        (prev) => prev?.filter((p) => p.id !== productId),
        { revalidate: false }
      )
    } catch (error) {
      logError('Error eliminant preferit:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t('favorites.title')}
        </h1>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
        <RefreshSpinButton onRefresh={() => void mutate(undefined, { revalidate: true })} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('favorites.noFavorites')}</p>
          <Link
            href="/app"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            {t('favorites.explore')}
          </Link>
        </div>
      ) : (
        <ProductCardsView
          products={products}
          viewMode={viewMode}
          nickname={nickname}
          renderActions={(product) => (
            <>
              <ProductReserveControl
                product={product}
                nickname={nickname}
                onUnreserve={(e) => void toggleReserved(product.id, e)}
              />
              {product.prestec ? <ProductLoanBadge /> : null}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  void removeFavorite(product.id)
                }}
                className="bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-md transition"
                aria-label={t('products.removeFromFavorites')}
              >
                <svg
                  className="w-5 h-5 text-white fill-current"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </>
          )}
        />
      )}
    </div>
  )
}
