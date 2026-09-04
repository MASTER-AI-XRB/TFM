'use client'

import type { ReactNode } from 'react'
import type { ViewMode } from '@/lib/client-session'
import type { ListProduct } from '@/lib/product-list-types'
import { ProductGridCard } from '@/components/products/ProductGridCard'
import { ProductListCard } from '@/components/products/ProductListCard'

type Props = {
  products: ListProduct[]
  viewMode: ViewMode
  nickname: string | null
  renderActions: (product: ListProduct) => ReactNode
  renderMeta?: (product: ListProduct) => ReactNode
  showFavoritesCount?: boolean
}

export function ProductCardsView({
  products,
  viewMode,
  nickname,
  renderActions,
  renderMeta,
  showFavoritesCount = false,
}: Props) {
  return (
    <>
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
          {products.map((product) => (
            <ProductGridCard
              key={product.id}
              product={product}
              nickname={nickname}
              actions={renderActions(product)}
              showFavoritesCount={showFavoritesCount}
            />
          ))}
        </div>
      )}
      <div
        className={`${
          viewMode === 'list' ? 'grid' : 'hidden'
        } grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`}
      >
        {products.map((product) => (
          <ProductListCard
            key={product.id}
            product={product}
            nickname={nickname}
            actions={renderActions(product)}
            meta={renderMeta?.(product)}
            showFavoritesCount={showFavoritesCount}
          />
        ))}
      </div>
    </>
  )
}
