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

function ReservedBookmarkIcon({ reserved }: { reserved: boolean }) {
  return reserved ? <BookmarkFilled /> : <BookmarkOutline />
}

function getReservedInteractiveClasses(reserved: boolean, ownerReserved: boolean): string {
  if (!reserved) {
    return 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
  }
  if (ownerReserved) {
    return 'bg-blue-500 text-white hover:bg-blue-600'
  }
  return 'bg-yellow-500 text-white hover:bg-yellow-600'
}

function getReservedStaticClasses(reserved: boolean, ownerReserved: boolean): string {
  if (!reserved) {
    return 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
  }
  if (ownerReserved) {
    return 'bg-blue-500 text-white'
  }
  return 'bg-yellow-500 text-white'
}

function getPrestecImageSrc(prestec: boolean, theme: string): string {
  if (prestec) return '/prestec_on.png'
  return theme === 'dark' ? '/prestec_off_dark.png' : '/prestec_off.png'
}

type BookmarkSectionProps = {
  product: FilletProduct
  nickname: string | null
  ownerReserved: boolean
  onToggleReserved: (e: React.MouseEvent) => void
  t: (key: string) => string
}

function OwnerBookmarkSection({
  product,
  nickname,
  ownerReserved,
  onToggleReserved,
  t,
}: BookmarkSectionProps) {
  const canUnreserve = canUnreserveProduct(product, nickname)
  const canReserve = canReserveProduct(product, nickname)
  const isOwner = nickname === product.user.nickname

  if (canUnreserve) {
    return (
      <button
        type="button"
        onClick={onToggleReserved}
        className={`rounded-full p-2 shadow-md transition ${getReservedInteractiveClasses(product.reserved, ownerReserved)}`}
        title={product.reserved ? t('products.unreserveTitle') : t('products.reserved')}
      >
        <ReservedBookmarkIcon reserved={product.reserved} />
      </button>
    )
  }

  const showReadonlyBadge = !(isOwner && canReserve)

  return (
    <>
      {showReadonlyBadge ? (
        <div
          className={`rounded-full p-2 shadow-md ${getReservedStaticClasses(product.reserved, ownerReserved)}`}
          title={product.reserved ? t('products.reserved') : t('products.notReserved')}
        >
          <ReservedBookmarkIcon reserved={product.reserved} />
        </div>
      ) : null}
      {canReserve ? (
        <button
          type="button"
          onClick={onToggleReserved}
          className="rounded-full p-2 shadow-md transition bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={t('products.reserveTitle')}
        >
          <BookmarkOutline />
        </button>
      ) : null}
    </>
  )
}

type OwnerLoanButtonProps = {
  prestec: boolean
  theme: string
  onToggleLoan: (e: React.MouseEvent) => void
  t: (key: string) => string
}

function OwnerLoanButton({ prestec, theme, onToggleLoan, t }: OwnerLoanButtonProps) {
  const loanClass = prestec
    ? 'bg-green-500 text-white hover:bg-green-600'
    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'

  return (
    <button
      type="button"
      onClick={onToggleLoan}
      className={`rounded-full p-2 shadow-md transition ${loanClass}`}
      title={prestec ? t('products.endPrestec') : t('products.startPrestec')}
    >
      <Image
        src={getPrestecImageSrc(prestec, theme)}
        alt={t('products.prestec')}
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
    </button>
  )
}

type OwnerDeleteButtonProps = {
  onDelete: (e: React.MouseEvent) => void
  t: (key: string) => string
}

function OwnerDeleteButton({ onDelete, t }: OwnerDeleteButtonProps) {
  return (
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
  const isOwner = nickname === product.user.nickname
  const canToggle =
    canReserveProduct(product, nickname) || canUnreserveProduct(product, nickname)
  const ownerReserved = isReservedByOwner(product)

  return (
    <>
      <OwnerBookmarkSection
        product={product}
        nickname={nickname}
        ownerReserved={ownerReserved}
        onToggleReserved={onToggleReserved}
        t={t}
      />
      {canToggle && isOwner ? (
        <OwnerLoanButton
          prestec={!!product.prestec}
          theme={theme}
          onToggleLoan={onToggleLoan}
          t={t}
        />
      ) : null}
      {isOwner ? <OwnerDeleteButton onDelete={onDelete} t={t} /> : null}
    </>
  )
}
