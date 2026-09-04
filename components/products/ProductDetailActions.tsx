'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'

type ProductDetailActionsProps = {
  product: {
    id: string
    reserved: boolean
    reservedBy: { nickname: string } | null
    prestec: boolean
    user: { nickname: string }
  }
  nickname: string | null
  canReserve: boolean
  canUnreserve: boolean
  isReservedByOwner: boolean
  onToggleReserved: () => void
  onTogglePrestec: () => void
  onDelete: () => void
}

export function ProductDetailActions({
  product,
  nickname,
  canReserve,
  canUnreserve,
  isReservedByOwner,
  onToggleReserved,
  onTogglePrestec,
  onDelete,
}: ProductDetailActionsProps) {
  const { t } = useI18n()
  const { theme } = useTheme()

  if (nickname && nickname === product.user.nickname) {
    return (
      <div className="grid grid-cols-2 gap-2 w-full sm:w-auto justify-items-end sm:justify-items-start ml-auto pr-2">
        {canUnreserve ? (
          <button
            onClick={onToggleReserved}
            aria-label={t('products.unreserveTitle')}
            className={`group relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg font-medium transition flex items-center justify-center text-white ${
              isReservedByOwner
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              {t('products.unreserveTitle')}
            </span>
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        ) : canReserve ? (
          <button
            onClick={onToggleReserved}
            aria-label={t('products.reserveTitle')}
            className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg font-medium transition flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              {t('products.reserveTitle')}
            </span>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        ) : null}
        <button
          onClick={onTogglePrestec}
          aria-label={t('products.prestec')}
          className={`group relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg font-medium transition flex items-center justify-center ${
            product.prestec
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            {t('products.prestec')}
          </span>
          <Image
            src={product.prestec ? '/prestec_on.png' : (theme === 'dark' ? '/prestec_off_dark.png' : '/prestec_off.png')}
            alt={product.prestec ? t('products.prestec') : ''}
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </button>
        <Link
          href={`/app/products/${product.id}/edit`}
          aria-label={t('common.edit')}
          className="group relative w-24 h-24 sm:w-28 sm:h-28 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center"
        >
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            {t('common.edit')}
          </span>
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.9-9.9a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0l-9.9 9.9A1 1 0 004 15.414V20z"
            />
          </svg>
        </Link>
        <button
          onClick={onDelete}
          aria-label={t('productDetail.delete')}
          className="group relative w-24 h-24 sm:w-28 sm:h-28 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 flex items-center justify-center"
        >
          <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            {t('productDetail.delete')}
          </span>
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
            />
          </svg>
        </button>
      </div>
    )
  }

  if (!nickname) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {product.prestec && (
        <div
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 text-white px-3 py-2"
          title={t('products.prestec')}
        >
          <Image
            src="/prestec_on.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
          <span className="text-sm font-medium">{t('products.prestec')}</span>
        </div>
      )}
      <Link
        href={`/app/chat?nickname=${encodeURIComponent(product.user.nickname)}&productId=${product.id}`}
        className="bg-blue-600 dark:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm sm:text-base text-center block sm:inline-block"
      >
        {t('productDetail.contact')}
      </Link>
      {canUnreserve ? (
        <button
          onClick={onToggleReserved}
          className="inline-flex items-center justify-center rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 p-2 sm:p-2.5"
          title={t('products.unreserveTitle')}
          aria-label={t('products.unreserveTitle')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
