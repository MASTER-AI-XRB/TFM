'use client'

import Image from 'next/image'
import {
  canReserveProduct,
  canUnreserveProduct,
  isReservedByOwner,
  type FilletProduct,
} from '@/lib/product-fillets'
import { useI18n } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'

type Props = {
  product: FilletProduct
  nickname: string | null
  onToggleReserved: (e: React.MouseEvent) => void
  onToggleLoan: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

function BookmarkFilled() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" preserveAspectRatio="xMidYMid meet">
      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
    </svg>
  )
}

function BookmarkOutline() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

/** Accions de titular: reserva, préstec i eliminar. */
export function ProductOwnerActions({
  product,
  nickname,
  onToggleReserved,
  onToggleLoan,
  onDelete,
}: Props) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const canToggle =
    canReserveProduct(product, nickname) || canUnreserveProduct(product, nickname)
  const ownerReserved = isReservedByOwner(product)

  const reservedColor = product.reserved
    ? ownerReserved
      ? 'bg-blue-500 text-white hover:bg-blue-600'
      : 'bg-yellow-500 text-white hover:bg-yellow-600'
    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'

  return (
    <>
      {canUnreserveProduct(product, nickname) ? (
        <button
          type="button"
          onClick={onToggleReserved}
          className={`rounded-full p-2 shadow-md transition ${reservedColor}`}
          title={product.reserved ? t('products.unreserveTitle') : t('products.reserved')}
        >
          {product.reserved ? <BookmarkFilled /> : <BookmarkOutline />}
        </button>
      ) : nickname === product.user.nickname && canReserveProduct(product, nickname) ? null : (
        <div
          className={`rounded-full p-2 shadow-md ${
            product.reserved
              ? ownerReserved
                ? 'bg-blue-500 text-white'
                : 'bg-yellow-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
          title={product.reserved ? t('products.reserved') : t('products.notReserved')}
        >
          {product.reserved ? <BookmarkFilled /> : <BookmarkOutline />}
        </div>
      )}
      {canReserveProduct(product, nickname) && (
        <button
          type="button"
          onClick={onToggleReserved}
          className="rounded-full p-2 shadow-md transition bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={t('products.reserveTitle')}
        >
          <BookmarkOutline />
        </button>
      )}
      {canToggle && nickname === product.user.nickname && (
        <button
          type="button"
          onClick={onToggleLoan}
          className={`rounded-full p-2 shadow-md transition ${
            product.prestec
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={product.prestec ? t('products.endPrestec') : t('products.startPrestec')}
        >
          <Image
            src={
              product.prestec
                ? '/prestec_on.png'
                : theme === 'dark'
                  ? '/prestec_off_dark.png'
                  : '/prestec_off.png'
            }
            alt={t('products.prestec')}
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
          />
        </button>
      )}
      {nickname === product.user.nickname && (
        <button
          type="button"
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition"
          title={t('common.delete')}
          aria-label={t('common.delete')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </>
  )
}
