'use client'

import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { ChatProductSummary } from '@/lib/chat-types'

interface UseChatActiveProductsSyncOptions {
  activePrivateChat: string | null
  activePrivateTab: string | null
  activeChatProducts: ChatProductSummary[] | undefined
  loadingActiveChatProducts: boolean
  productIdFromUrlRef: React.MutableRefObject<string | null>
  setActivePrivateTab: Dispatch<SetStateAction<string | null>>
  setPrivateChatProducts: Dispatch<SetStateAction<Record<string, ChatProductSummary[]>>>
  setPrivateChatProductsFetched: Dispatch<SetStateAction<Record<string, boolean>>>
  setLoadingPrivateProducts: Dispatch<SetStateAction<Record<string, boolean>>>
}

export function useChatActiveProductsSync({
  activePrivateChat,
  activePrivateTab,
  activeChatProducts,
  loadingActiveChatProducts,
  productIdFromUrlRef,
  setActivePrivateTab,
  setPrivateChatProducts,
  setPrivateChatProductsFetched,
  setLoadingPrivateProducts,
}: UseChatActiveProductsSyncOptions) {
  useEffect(() => {
    if (!activePrivateChat) {
      setActivePrivateTab(null)
      return
    }

    if (loadingActiveChatProducts) {
      setLoadingPrivateProducts((prev) => ({ ...prev, [activePrivateChat]: true }))
      return
    }

    if (!activeChatProducts) return

    setPrivateChatProducts((prev) => ({
      ...prev,
      [activePrivateChat]: activeChatProducts,
    }))
    setPrivateChatProductsFetched((prev) => ({
      ...prev,
      [activePrivateChat]: true,
    }))
    setLoadingPrivateProducts((prev) => ({ ...prev, [activePrivateChat]: false }))

    if (activePrivateTab === null) {
      setActivePrivateTab('general')
      return
    }
    if (activePrivateTab !== 'general') {
      const hasActiveProduct = activeChatProducts.some((product) => product.id === activePrivateTab)
      const isFromUrl = productIdFromUrlRef.current === activePrivateTab
      if (!hasActiveProduct && !isFromUrl) {
        setActivePrivateTab('general')
      }
    }
  }, [
    activePrivateChat,
    activePrivateTab,
    activeChatProducts,
    loadingActiveChatProducts,
    productIdFromUrlRef,
    setActivePrivateTab,
    setPrivateChatProducts,
    setPrivateChatProductsFetched,
    setLoadingPrivateProducts,
  ])
}
