'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import type { ListProduct } from '@/lib/product-list-types'
import { getFilletClass } from '@/lib/product-fillets'
import { useI18n } from '@/lib/i18n'

type Props = {
  product: ListProduct
  nickname: string | null
  actions: ReactNode
  showFavoritesCount?: boolean
}

export function ProductGridCard({
  product,
  nickname,
  actions,
  showFavoritesCount = false,
}: Props) {
  const { t } = useI18n()
  const favoritesCount = product.favoritesCount

  return (
    <Link
      href={`/app/products/${product.id}`}
      className={`relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden group ${getFilletClass(product, nickname)}`}
    >
      {product.images && product.images.length > 0 ? (
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-xs">No image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center px-2">
          <p className="font-semibold line-clamp-2">{product.name}</p>
        </div>
      </div>
      {showFavoritesCount && typeof favoritesCount === 'number' ? (
        <div
          className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-black/50 dark:bg-black/60 text-white px-2 py-0.5 text-xs"
          title={t('products.favoritesCount', { count: favoritesCount })}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span>{favoritesCount}</span>
        </div>
      ) : null}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">{actions}</div>
    </Link>
  )
}
