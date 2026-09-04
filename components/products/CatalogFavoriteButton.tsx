'use client'

import { useI18n } from '@/lib/i18n'

type CatalogFavoriteButtonProps = {
  productId: string
  isFavorite: boolean
  onToggle: (e: React.MouseEvent) => void
}

export function CatalogFavoriteButton({
  productId,
  isFavorite,
  onToggle,
}: CatalogFavoriteButtonProps) {
  const { t } = useI18n()

  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid={`favorite-toggle-${productId}`}
      className={`rounded-full p-2 shadow-md transition ${
        isFavorite
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      aria-label={
        isFavorite ? t('products.removeFromFavorites') : t('products.addToFavorites')
      }
      title={isFavorite ? t('products.removeFromFavorites') : t('products.addToFavorites')}
    >
      {isFavorite ? (
        <svg className="w-5 h-5 text-white fill-current" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  )
}
