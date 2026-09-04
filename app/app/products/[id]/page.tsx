'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import TranslateButton from '@/components/TranslateButton'
import { ProductImageGallery } from '@/components/products/ProductImageGallery'
import { ProductDetailActions } from '@/components/products/ProductDetailActions'
import { useStoredNickname } from '@/lib/use-stored-nickname'
import { formatDateLongCa } from '@/lib/format-date'
import { logError } from '@/lib/client-logger'

interface Product {
  id: string
  name: string
  description: string | null
  images: string[]
  reserved: boolean
  reservedBy: { nickname: string } | null
  prestec: boolean
  user: { nickname: string }
  createdAt: string
}

export default function ProductDetailPage() {
  const routeParams = useParams<{ id: string }>()
  const productId = typeof routeParams?.id === 'string' ? routeParams.id : null
  const router = useRouter()
  const nickname = useStoredNickname()
  const { t } = useI18n()

  const {
    data: product = null,
    isLoading: loading,
    mutate,
  } = useSWR<Product>(productId ? `/api/products/${productId}` : null, {
    revalidateOnFocus: true,
  })

  useEffect(() => {
    if (!productId) return
    const onProductState = (e: Event) => {
      const { productId: id, reserved, reservedBy, prestec } = (e as CustomEvent).detail || {}
      if (id !== productId) return
      void mutate(
        (prev) =>
          prev
            ? {
                ...prev,
                ...(typeof reserved === 'boolean' && { reserved, reservedBy: reservedBy ?? null }),
                ...(typeof prestec === 'boolean' && { prestec }),
              }
            : undefined,
        { revalidate: false }
      )
    }
    window.addEventListener('product-state', onProductState)
    return () => window.removeEventListener('product-state', onProductState)
  }, [productId, mutate])

  const canReserve = product && nickname === product.user.nickname && !product.reserved
  const canUnreserve =
    product &&
    product.reserved &&
    (nickname === (product.reservedBy?.nickname ?? '') ||
      (nickname === product.user.nickname && !product.reservedBy))
  const isReservedByOwner =
    !!product?.reserved && product.reservedBy?.nickname === product.user.nickname

  const toggleReserved = async () => {
    if (!product || (!canReserve && !canUnreserve)) return
    const nextReserved = !product.reserved
    const prevProduct = product

    // Optimistic: canviar icona al moment
    void mutate(
      {
        ...product,
        reserved: nextReserved,
        reservedBy: nextReserved && nickname ? { nickname } : null,
      },
      { revalidate: false }
    )

    try {
      const response = await fetch(`/api/products/${product.id}/reserve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserved: nextReserved }),
      })
      if (!response.ok) {
        void mutate(prevProduct, { revalidate: false })
        logError('Error actualitzant reserva:', await response.json().catch(() => ({})))
      }
    } catch (error) {
      void mutate(prevProduct, { revalidate: false })
      logError('Error actualitzant reserva:', error)
    }
  }

  const togglePrestec = async () => {
    if (!product || product.user.nickname !== nickname) return

    try {
      const response = await fetch(`/api/products/${product.id}/loan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestec: !product.prestec }),
      })
      if (response.ok) {
        const data = await response.json()
        void mutate({ ...product, prestec: data.prestec }, { revalidate: false })
      }
    } catch (error) {
      logError('Error actualitzant préstec:', error)
    }
  }

  const deleteProduct = async () => {
    if (!product || product.user.nickname !== nickname) return

    if (!confirm(t('products.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/app')
      }
    } catch (error) {
      logError('Error eliminant producte:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('productDetail.loading')}</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('productDetail.notFound')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <Link
        href="/app"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 mb-4 inline-block text-sm sm:text-base"
      >
        {t('productDetail.backToProducts')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <ProductImageGallery images={product.images} productName={product.name} />

          {/* Informació del producte */}
          <div className="w-full md:w-1/2 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                <TranslateButton text={product.name} />
              </h1>
              {product.reserved && (
                <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  {t('productDetail.reserved')}
                </div>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('productDetail.description')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  <TranslateButton text={product.description} />
                </p>
              </div>
            )}

            <div className="border-t dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('productDetail.publishedBy')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.user.nickname}
                  </p>
                </div>
                <ProductDetailActions
                  product={product}
                  nickname={nickname}
                  canReserve={!!canReserve}
                  canUnreserve={!!canUnreserve}
                  isReservedByOwner={isReservedByOwner}
                  onToggleReserved={toggleReserved}
                  onTogglePrestec={togglePrestec}
                  onDelete={deleteProduct}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('productDetail.publishedOn')}{' '}
                {formatDateLongCa(product.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
