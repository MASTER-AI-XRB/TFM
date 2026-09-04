'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { useNotifications } from '@/lib/notifications'
import { useStoredNickname } from '@/lib/use-stored-nickname'
import { useAppSocket } from '@/components/AppSocketProvider'
import type { ChatMessage, ChatProductSummary } from '@/lib/chat-types'
import { buildPrivateChatKey, resolveActiveProductId } from '@/lib/chat-utils'
import { createChatActions, resolveCurrentMessages } from '@/lib/chat-actions'
import { useChatActiveProductsSync } from '@/lib/use-chat-active-products-sync'
import {
  useActiveChatProducts,
  useChatUiFlags,
  useReserveOnDmOpen,
  useSocketHttpTest,
} from '@/lib/use-chat-remote-data'
import {
  useActivePrivateRefs,
  useChatOpenChatsSync,
  useChatPrivateStorage,
  useProductStateListener,
  useRefetchProductsFromUrl,
} from '@/lib/use-chat-url-restore'
import { useChatConfetti } from '@/lib/use-chat-confetti'
import { useChatSocketDiagnostics, useChatSocketEvents } from '@/lib/use-chat-socket'

function readStoredOpenChats(nickname: string): string[] {
  try {
    const stored = window.localStorage.getItem(`chat:${nickname}:openPrivateChats`)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    window.localStorage.removeItem(`chat:${nickname}:openPrivateChats`)
    return []
  }
}

export function useChatPage() {
  const { socket, connected } = useAppSocket()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [privateChats, setPrivateChats] = useState<Record<string, ChatMessage[]>>({})
  const [activePrivateChat, setActivePrivateChat] = useState<string | null>(null)
  const [activePrivateTab, setActivePrivateTab] = useState<string | null>(null)
  const [openPrivateChats, setOpenPrivateChats] = useState<string[]>([])
  const [unreadPrivateChats, setUnreadPrivateChats] = useState<Record<string, number>>({})
  const [privateChatProducts, setPrivateChatProducts] = useState<
    Record<string, ChatProductSummary[]>
  >({})
  const [privateChatProductsFetched, setPrivateChatProductsFetched] = useState<
    Record<string, boolean>
  >({})
  const [loadingPrivateProducts, setLoadingPrivateProducts] = useState<Record<string, boolean>>({})
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [isOnlineUsersDrawerOpen, setIsOnlineUsersDrawerOpen] = useState(false)
  const [hasRestoredChats, setHasRestoredChats] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activePrivateProductIdRef = useRef<string | null>(null)
  const activePrivateChatRef = useRef<string | null>(null)
  const productIdFromUrlRef = useRef<string | null>(null)
  const refetchForProductUrlDoneRef = useRef<string | null>(null)

  const nickname = useStoredNickname()
  const searchParams = useSearchParams()
  const { t, locale } = useI18n()
  const { showInfo } = useNotifications()
  const router = useRouter()

  const {
    data: activeChatProducts,
    isLoading: loadingActiveChatProducts,
    mutate: mutateActiveChatProducts,
  } = useActiveChatProducts(activePrivateChat, activePrivateTab)

  useReserveOnDmOpen(nickname, searchParams)
  const socketUrl = useSocketHttpTest(nickname)
  const uiFlags = useChatUiFlags(
    connected,
    activePrivateChat,
    activePrivateTab,
    privateChatProducts,
    loadingPrivateProducts
  )

  // Restaura xats des de URL / localStorage (estat local, no setters a fills)
  useEffect(() => {
    if (!nickname) return

    setHasRestoredChats(false)
    productIdFromUrlRef.current = null

    const urlNickname =
      searchParams.get('nickname') ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('nickname')
        : null) ||
      ''
    const urlProductId =
      searchParams.get('productId') ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('productId')
        : null) ||
      ''

    const openList = readStoredOpenChats(nickname)

    if (urlNickname) {
      productIdFromUrlRef.current = urlProductId || null
      setActivePrivateChat(urlNickname)
      setActivePrivateTab(urlProductId ? urlProductId : 'general')
      setOpenPrivateChats((prev) => {
        const next = openList.length ? openList : prev
        return next.includes(urlNickname) ? next : [...next, urlNickname]
      })
      setHasRestoredChats(true)
      return
    }

    if (openList.length) setOpenPrivateChats(openList)

    const storedActive = window.localStorage.getItem(`chat:${nickname}:activePrivateChat`)
    if (storedActive) {
      setActivePrivateChat(storedActive)
      setOpenPrivateChats((prev) =>
        prev.includes(storedActive) ? prev : [...prev, storedActive]
      )
    }

    const storedActiveProduct = window.localStorage.getItem(
      `chat:${nickname}:activePrivateProduct`
    )
    if (storedActiveProduct) {
      setActivePrivateTab(storedActiveProduct)
    }

    setHasRestoredChats(true)
  }, [nickname, searchParams])

  useChatPrivateStorage(nickname, openPrivateChats, activePrivateChat, activePrivateTab, hasRestoredChats)
  useChatOpenChatsSync(
    activePrivateChat,
    openPrivateChats,
    hasRestoredChats,
    setActivePrivateChat,
    setActivePrivateTab
  )
  useActivePrivateRefs(
    activePrivateTab,
    activePrivateChat,
    activePrivateProductIdRef,
    activePrivateChatRef
  )
  useProductStateListener(setPrivateChatProducts)

  useChatActiveProductsSync({
    activePrivateChat,
    activePrivateTab,
    activeChatProducts,
    loadingActiveChatProducts,
    productIdFromUrlRef,
    setActivePrivateTab,
    setPrivateChatProducts,
    setPrivateChatProductsFetched,
    setLoadingPrivateProducts,
  })

  useChatConfetti(activePrivateChat, activePrivateTab, nickname, privateChatProducts)

  useRefetchProductsFromUrl(
    activePrivateChat,
    activePrivateTab,
    privateChatProductsFetched,
    productIdFromUrlRef,
    refetchForProductUrlDoneRef,
    () => void mutateActiveChatProducts()
  )

  useChatSocketDiagnostics(nickname)

  useChatSocketEvents({
    socket,
    connected,
    nickname,
    activePrivateChat,
    activePrivateTab,
    activePrivateChatRef,
    activePrivateProductIdRef,
    messagesEndRef,
    setMessages,
    setPrivateChats,
    setOpenPrivateChats,
    setUnreadPrivateChats,
    setOnlineUsers,
    router,
    showInfo,
    t,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, privateChats, activePrivateChat, activePrivateTab])

  useEffect(() => {
    if (!activePrivateChat) return
    setUnreadPrivateChats((prev) => {
      const chatKey = buildPrivateChatKey(
        activePrivateChat,
        resolveActiveProductId(activePrivateTab)
      )
      if (!prev[chatKey]) return prev
      const next = { ...prev }
      delete next[chatKey]
      return next
    })
  }, [activePrivateChat, activePrivateTab])

  const actions = useMemo(
    () =>
      createChatActions({
        socket,
        connected,
        activePrivateChat,
        activePrivateTab,
        newMessage,
        setNewMessage,
        setActivePrivateChat,
        setActivePrivateTab,
        setOpenPrivateChats,
        setUnreadPrivateChats,
        unreadPrivateChats,
      }),
    [socket, connected, activePrivateChat, activePrivateTab, newMessage, unreadPrivateChats]
  )

  const currentMessages = resolveCurrentMessages(
    activePrivateChat,
    activePrivateTab,
    privateChats,
    messages
  )

  return {
    nickname,
    locale,
    t,
    connected,
    socketUrl,
    showSocketWarning: uiFlags.showSocketWarning,
    activePrivateChat,
    activePrivateTab,
    openPrivateChats,
    onlineUsers,
    isOnlineUsersDrawerOpen,
    setIsOnlineUsersDrawerOpen,
    currentMessages,
    activePrivateProducts: uiFlags.activePrivateProducts,
    isPrivateProductsLoading: uiFlags.isPrivateProductsLoading,
    newMessage,
    setNewMessage,
    canSendMessage: uiFlags.canSendMessage,
    messagesEndRef,
    ...actions,
  }
}
