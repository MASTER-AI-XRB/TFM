'use client'

import {
  canUnreserveProduct,
  isReservedByOwner,
  type FilletProduct,
} from '@/lib/product-fillets'
import { useI18n } from '@/lib/i18n'

type Props = {
  product: FilletProduct
  nickname: string | null
  onUnreserve: (e: React.MouseEvent) => void
  /** Si true, només mostra control quan està reservat (estil favorites). */
  reservedOnly?: boolean
}

function BookmarkFilledIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
    </svg>
  )
}

/** Control de reserva en llista: unreserve clicable o badge readonly. */
export function ProductReserveControl({
  product,
  nickname,
  onUnreserve,
  reservedOnly = true,
}: Props) {
  const { t } = useI18n()
  if (reservedOnly && !product.reserved) return null

  const ownerReserved = isReservedByOwner(product)
  const colorClass = ownerReserved
    ? 'bg-blue-500 text-white'
    : 'bg-yellow-500 text-white'

  if (canUnreserveProduct(product, nickname)) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onUnreserve(e)
        }}
        className={`rounded-full p-2 shadow-md transition hover:opacity-90 ${colorClass}`}
        title={t('products.unreserveTitle')}
      >
        <BookmarkFilledIcon />
      </button>
    )
  }

  if (!product.reserved) return null

  return (
    <div className={`rounded-full p-2 shadow-md ${colorClass}`} title={t('products.reserved')}>
      <BookmarkFilledIcon />
    </div>
  )
}
