'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import TranslateButton from '@/components/TranslateButton'
import type { ListProduct } from '@/lib/product-list-types'
import { getFilletBoxShadow } from '@/lib/product-fillets'
import { useI18n } from '@/lib/i18n'

type Props = {
  product: ListProduct
  nickname: string | null
  actions: ReactNode
  /** Contingut sota el títol (data, etc.). Per defecte: nickname del propietari. */
  meta?: ReactNode
  showFavoritesCount?: boolean
}

export function ProductListCard({
  product,
  nickname,
  actions,
  meta,
  showFavoritesCount = false,
}: Props) {
  const { t } = useI18n()
  const filletShadow = getFilletBoxShadow(product, nickname)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-800 transition flex flex-col">
      {product.images && product.images.length > 0 && (
        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative flex-shrink-0">
          <Link href={`/app/products/${product.id}`} className="relative block w-full h-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {filletShadow ? (
              <span
                className="absolute inset-0 pointer-events-none block"
                style={{ boxShadow: filletShadow }}
                aria-hidden
              />
            ) : null}
          </Link>
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">{actions}</div>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            <TranslateButton text={product.name} />
          </h3>
          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              <TranslateButton text={product.description} />
            </p>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 sm:mt-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {meta ?? product.user.nickname}
          </span>
          <div className="flex items-center gap-2">
            {showFavoritesCount && typeof product.favoritesCount === 'number' ? (
              <span
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                title={t('products.favoritesCount', { count: product.favoritesCount })}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                {product.favoritesCount}
              </span>
            ) : null}
            <Link
              href={`/app/products/${product.id}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              title={t('products.seeMoreDetails')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
