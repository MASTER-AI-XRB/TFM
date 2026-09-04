'use client'

import Image from 'next/image'
import type { ChatProductSummary } from '@/lib/chat-types'

interface ChatProductTabsProps {
  activePrivateChat: string
  activePrivateTab: string | null
  generalDmLabel: string
  loadingLabel: string
  products: ChatProductSummary[]
  isLoading: boolean
  getUnread: (productId: string | null) => number
  onSelectGeneral: () => void
  onSelectProduct: (productId: string) => void
}

export function ChatProductTabs({
  activePrivateChat,
  activePrivateTab,
  generalDmLabel,
  loadingLabel,
  products,
  isLoading,
  getUnread,
  onSelectGeneral,
  onSelectProduct,
}: ChatProductTabsProps) {
  return (
    <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0">
      <button
        type="button"
        onClick={onSelectGeneral}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition ${
          activePrivateTab === 'general'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <span className="text-xs sm:text-sm font-medium">{activePrivateChat || generalDmLabel}</span>
        {getUnread(null) > 0 && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
        )}
      </button>

      {isLoading && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{loadingLabel}</span>
      )}

      {!isLoading &&
        products.map((product) => {
          const isActive = activePrivateTab === product.id
          const unreadCount = getUnread(product.id)
          const thumbnail = product.images?.[0] || '/logo.png'

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelectProduct(product.id)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Image
                src={thumbnail}
                alt={product.name}
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 rounded object-cover"
              />
              <span className="text-xs sm:text-sm font-medium">{product.name}</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
              )}
            </button>
          )
        })}
    </div>
  )
}
