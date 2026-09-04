'use client'

import type { Socket } from 'socket.io-client'
import {
  buildPrivateChatKey,
  getUnreadForProduct,
  hasUnreadForUser,
  resolveActiveProductId,
} from '@/lib/chat-utils'
import type { ChatMessage } from '@/lib/chat-types'

interface ChatActionsContext {
  socket: Socket | null
  connected: boolean
  activePrivateChat: string | null
  activePrivateTab: string | null
  newMessage: string
  setNewMessage: (value: string) => void
  setActivePrivateChat: React.Dispatch<React.SetStateAction<string | null>>
  setActivePrivateTab: React.Dispatch<React.SetStateAction<string | null>>
  setOpenPrivateChats: React.Dispatch<React.SetStateAction<string[]>>
  setUnreadPrivateChats: React.Dispatch<React.SetStateAction<Record<string, number>>>
  unreadPrivateChats: Record<string, number>
}

export function createChatActions(ctx: ChatActionsContext) {
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctx.newMessage.trim() || !ctx.socket || !ctx.connected) return

    if (ctx.activePrivateChat) {
      if (ctx.activePrivateTab === null) return
      ctx.socket.emit('private-message', {
        content: ctx.newMessage,
        targetNickname: ctx.activePrivateChat,
        productId: resolveActiveProductId(ctx.activePrivateTab),
      })
    } else {
      ctx.socket.emit('general-message', { content: ctx.newMessage })
    }

    ctx.setNewMessage('')
  }

  const startPrivateChat = (targetNickname: string) => {
    if (!ctx.socket) return
    ctx.setActivePrivateChat(targetNickname)
    ctx.setActivePrivateTab('general')
    ctx.setOpenPrivateChats((prev) =>
      prev.includes(targetNickname) ? prev : [...prev, targetNickname]
    )
    ctx.setUnreadPrivateChats((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${targetNickname}::`)) {
          delete next[key]
        }
      })
      return next
    })
    ctx.socket.emit('join-private', { targetNickname, productId: null })
    ctx.socket.emit('load-private-messages', { targetNickname, productId: null })
  }

  const closePrivateChat = (targetNickname: string) => {
    ctx.setOpenPrivateChats((prev) => prev.filter((nick) => nick !== targetNickname))
    ctx.setUnreadPrivateChats((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${targetNickname}::`)) {
          delete next[key]
        }
      })
      return next
    })
    if (ctx.activePrivateChat === targetNickname) {
      ctx.setActivePrivateChat(null)
      ctx.setActivePrivateTab(null)
    }
  }

  const switchToGeneralChat = () => {
    ctx.setActivePrivateChat(null)
    ctx.setActivePrivateTab(null)
    if (ctx.socket && ctx.connected) {
      ctx.socket.emit('join-general')
    }
  }

  const selectPrivateChatTab = (chatNickname: string) => {
    ctx.setActivePrivateChat(chatNickname)
    ctx.setActivePrivateTab('general')
  }

  const clearUnreadForTab = (productId: string | null) => {
    if (!ctx.activePrivateChat) return
    ctx.setUnreadPrivateChats((prev) => {
      const chatKey = buildPrivateChatKey(ctx.activePrivateChat!, productId)
      if (!prev[chatKey]) return prev
      const next = { ...prev }
      delete next[chatKey]
      return next
    })
  }

  const selectProductTab = (productId: string) => {
    ctx.setActivePrivateTab(productId)
    clearUnreadForTab(productId)
  }

  const selectGeneralProductTab = () => {
    ctx.setActivePrivateTab('general')
    clearUnreadForTab(null)
  }

  return {
    sendMessage,
    startPrivateChat,
    closePrivateChat,
    switchToGeneralChat,
    selectPrivateChatTab,
    selectProductTab,
    selectGeneralProductTab,
    hasUnreadForUser: (chatNickname: string) =>
      hasUnreadForUser(chatNickname, ctx.unreadPrivateChats),
    getUnreadForProduct: (chatNickname: string, productId: string | null) =>
      getUnreadForProduct(chatNickname, productId, ctx.unreadPrivateChats),
  }
}

export function resolveCurrentMessages(
  activePrivateChat: string | null,
  activePrivateTab: string | null,
  privateChats: Record<string, ChatMessage[]>,
  messages: ChatMessage[]
): ChatMessage[] {
  if (!activePrivateChat) return messages
  if (activePrivateTab === null) return []
  return (
    privateChats[buildPrivateChatKey(activePrivateChat, resolveActiveProductId(activePrivateTab))] ||
    []
  )
}
