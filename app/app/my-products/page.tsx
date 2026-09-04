'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import { useStoredNickname } from '@/lib/use-stored-nickname'
import { useStoredViewMode } from '@/lib/use-stored-view-mode'
import { useProductStateSync } from '@/lib/use-product-state-sync'
import { formatDateShortCa } from '@/lib/format-date'
import { logError } from '@/lib/client-logger'
import {
  canReserveProduct,
  canUnreserveProduct,
} from '@/lib/product-fillets'
import type { ListProduct } from '@/lib/product-list-types'
import { ViewModeToggle } from '@/components/products/ViewModeToggle'
import { RefreshSpinButton } from '@/components/products/RefreshSpinButton'
import { ProductCardsView } from '@/components/products/ProductCardsView'
import { ProductOwnerActions } from '@/components/products/ProductOwnerActions'

export default function MyProductsPage() {
  const [viewMode, setViewMode] = useStoredViewMode()
  const nickname = useStoredNickname()
  const { t } = useI18n()

  const {
    data: products = [],
    isLoading: loading,
    mutate,
  } = useSWR<ListProduct[]>(nickname ? '/api/products/my' : null, {
    revalidateOnFocus: true,
  })

  useProductStateSync(mutate)

  const refreshMyProducts = () => mutate(undefined, { revalidate: true })

  const toggleReserved = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const product = products.find((p) => p.id === productId)
    if (
      !product ||
      (!canReserveProduct(product, nickname) && !canUnreserveProduct(product, nickname))
    ) {
      return
    }
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
      const response = await fetch(`/api/products/${productId}/reserve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserved: nextReserved }),
      })
      if (!response.ok) {
        void mutate(
          (prev) =>
            prev?.map((p) =>
              p.id === productId
                ? { ...p, reserved: product.reserved, reservedBy: product.reservedBy }
                : p
            ),
          { revalidate: false }
        )
        logError('Error actualitzant reserva:', await response.json().catch(() => ({})))
      }
    } catch (error) {
      void mutate(
        (prev) =>
          prev?.map((p) =>
            p.id === productId
              ? { ...p, reserved: product.reserved, reservedBy: product.reservedBy }
              : p
          ),
        { revalidate: false }
      )
      logError('Error actualitzant reserva:', error)
    }
  }

  const togglePrestec = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const product = products.find((p) => p.id === productId)
    if (!product) return

    try {
      const response = await fetch(`/api/products/${productId}/loan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestec: !product.prestec }),
      })
      if (response.ok) {
        await refreshMyProducts()
      }
    } catch (error) {
      logError('Error actualitzant préstec:', error)
    }
  }

  const deleteProduct = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(t('products.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await refreshMyProducts()
      }
    } catch (error) {
      logError('Error eliminant producte:', error)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('myProducts.title')}
          </h1>
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          <RefreshSpinButton onRefresh={() => void refreshMyProducts()} />
        </div>
        <Link
          href="/app/products/new"
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm sm:text-base"
        >
          {t('products.newProduct')}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('myProducts.noProducts')}</p>
          <Link
            href="/app/products/new"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            {t('myProducts.publishFirst')}
          </Link>
        </div>
      ) : (
        <ProductCardsView
          products={products}
          viewMode={viewMode}
          nickname={nickname}
          renderMeta={(product) => (
            <>
              {t('products.publishedOn')} {formatDateShortCa(product.createdAt)}
            </>
          )}
          renderActions={(product) => (
            <ProductOwnerActions
              product={product}
              nickname={nickname}
              onToggleReserved={(e) => void toggleReserved(product.id, e)}
              onToggleLoan={(e) => void togglePrestec(product.id, e)}
              onDelete={(e) => void deleteProduct(product.id, e)}
            />
          )}
        />
      )}
    </div>
  )
}
