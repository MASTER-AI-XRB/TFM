'use client'

import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { ChatProductSummary } from '@/lib/chat-types'

export function useChatPrivateStorage(
  nickname: string | null,
  openPrivateChats: string[],
  activePrivateChat: string | null,
  activePrivateTab: string | null,
  hasRestoredChats: boolean
) {
  useEffect(() => {
    if (!nickname || !hasRestoredChats) return

    const openChatsKey = `chat:${nickname}:openPrivateChats`
    const activeChatKey = `chat:${nickname}:activePrivateChat`
    const activeProductKey = `chat:${nickname}:activePrivateProduct`

    window.localStorage.setItem(openChatsKey, JSON.stringify(openPrivateChats))
    if (activePrivateChat) {
      window.localStorage.setItem(activeChatKey, activePrivateChat)
    } else {
      window.localStorage.removeItem(activeChatKey)
    }

    if (activePrivateTab) {
      window.localStorage.setItem(activeProductKey, activePrivateTab)
    } else {
      window.localStorage.removeItem(activeProductKey)
    }
  }, [nickname, openPrivateChats, activePrivateChat, activePrivateTab, hasRestoredChats])
}

export function useChatOpenChatsSync(
  activePrivateChat: string | null,
  openPrivateChats: string[],
  hasRestoredChats: boolean,
  setActivePrivateChat: Dispatch<SetStateAction<string | null>>,
  setActivePrivateTab: Dispatch<SetStateAction<string | null>>
) {
  useEffect(() => {
    if (!hasRestoredChats) return
    if (activePrivateChat && !openPrivateChats.includes(activePrivateChat)) {
      setActivePrivateChat(null)
      setActivePrivateTab(null)
    }
  }, [
    activePrivateChat,
    openPrivateChats,
    hasRestoredChats,
    setActivePrivateChat,
    setActivePrivateTab,
  ])
}

export function useActivePrivateRefs(
  activePrivateTab: string | null,
  activePrivateChat: string | null,
  activePrivateProductIdRef: React.MutableRefObject<string | null>,
  activePrivateChatRef: React.MutableRefObject<string | null>
) {
  useEffect(() => {
    activePrivateProductIdRef.current =
      activePrivateTab === null ? null : activePrivateTab === 'general' ? null : activePrivateTab
  }, [activePrivateTab, activePrivateProductIdRef])

  useEffect(() => {
    activePrivateChatRef.current = activePrivateChat
  }, [activePrivateChat, activePrivateChatRef])
}

export function useProductStateListener(
  setPrivateChatProducts: Dispatch<SetStateAction<Record<string, ChatProductSummary[]>>>
) {
  useEffect(() => {
    const onProductState = (e: Event) => {
      const { productId: id, reserved, reservedBy } = (e as CustomEvent).detail || {}
      if (!id || typeof reserved !== 'boolean') return
      setPrivateChatProducts((prev) => {
        const next = { ...prev }
        for (const chatNickname of Object.keys(next)) {
          const list = next[chatNickname]
          if (!Array.isArray(list)) continue
          const idx = list.findIndex((p) => p.id === id)
          if (idx === -1) continue
          next[chatNickname] = list.map((p, i) =>
            i !== idx ? p : { ...p, reserved, reservedBy: reservedBy ?? null }
          )
        }
        return next
      })
    }
    window.addEventListener('product-state', onProductState)
    return () => window.removeEventListener('product-state', onProductState)
  }, [setPrivateChatProducts])
}

export function useRefetchProductsFromUrl(
  activePrivateChat: string | null,
  activePrivateTab: string | null,
  privateChatProductsFetched: Record<string, boolean>,
  productIdFromUrlRef: React.MutableRefObject<string | null>,
  refetchForProductUrlDoneRef: React.MutableRefObject<string | null>,
  mutateActiveChatProducts: () => void
) {
  useEffect(() => {
    const productIdFromUrl = productIdFromUrlRef.current
    if (
      !productIdFromUrl ||
      activePrivateTab !== productIdFromUrl ||
      !activePrivateChat ||
      refetchForProductUrlDoneRef.current === productIdFromUrl
    ) {
      return
    }
    if (!privateChatProductsFetched[activePrivateChat]) return
    const timer = setTimeout(() => {
      refetchForProductUrlDoneRef.current = productIdFromUrl
      void mutateActiveChatProducts()
    }, 700)
    return () => clearTimeout(timer)
  }, [
    activePrivateChat,
    activePrivateTab,
    privateChatProductsFetched,
    productIdFromUrlRef,
    refetchForProductUrlDoneRef,
    mutateActiveChatProducts,
  ])
}
