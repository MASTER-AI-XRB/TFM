'use client'

import { useEffect, type Dispatch, type SetStateAction } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { Socket } from 'socket.io-client'
import { logError, logInfo } from '@/lib/client-logger'
import { getSocketUrl } from '@/lib/socket'
import type { ChatMessage } from '@/lib/chat-types'
import { buildPrivateChatKey } from '@/lib/chat-utils'

interface UseChatSocketEventsOptions {
  socket: Socket | null
  connected: boolean
  nickname: string | null
  activePrivateChat: string | null
  activePrivateTab: string | null
  activePrivateChatRef: React.MutableRefObject<string | null>
  activePrivateProductIdRef: React.MutableRefObject<string | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
  setPrivateChats: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>
  setOpenPrivateChats: Dispatch<SetStateAction<string[]>>
  setUnreadPrivateChats: Dispatch<SetStateAction<Record<string, number>>>
  setOnlineUsers: Dispatch<SetStateAction<string[]>>
  router: AppRouterInstance
  showInfo: (
    title: string,
    message: string,
    options?: {
      duration?: number
      action?: { label: string; onClick: () => void }
    }
  ) => void
  t: (key: string, params?: Record<string, string>) => string
}

function scrollToBottom(messagesEndRef: React.RefObject<HTMLDivElement | null>) {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}

export function useChatSocketEvents(options: UseChatSocketEventsOptions) {
  const {
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
  } = options

  useEffect(() => {
    const s = socket
    if (!nickname || !s) return

    const onConnect = () => {
      logInfo('Connectat a Socket.io (xat)')
      s.emit('join-general')
    }
    const onConnectError = (error: { message?: string; description?: number; type?: string }) => {
      logError('❌ Error de connexió Socket.io:', error?.message)
      if (error?.description === 404 || error?.message?.includes('404')) {
        logError('Causa probable: 404 - El servidor Socket.io no està disponible a aquesta URL')
      }
    }
    const onReconnectAttempt = (attemptNumber: number) => {
      logInfo(`🔄 Intentant reconnexió (intent ${attemptNumber}/10)...`)
    }
    const onReconnect = () => {
      logInfo('✅ Reconnexió exitosa')
      if (!activePrivateChatRef.current) {
        s.emit('join-general')
      } else {
        s.emit('join-private', {
          targetNickname: activePrivateChatRef.current,
          productId: activePrivateProductIdRef.current,
        })
      }
    }
    const onReconnectError = (error: unknown) => logError('❌ Error en reconnexió:', error)
    const onReconnectFailed = () => {
      logError('❌ Fallida la reconnexió. Verifica NEXT_PUBLIC_SOCKET_URL i NEXT_PUBLIC_ALLOWED_ORIGINS.')
    }
    const onDisconnect = () => logInfo('Desconnectat de Socket.io')
    const onSessionTerminated = (data: { message?: string }) => {
      logInfo('Sessió terminada:', data?.message)
      showInfo(
        t('notifications.sessionTerminated') || 'Sessió tancada',
        data?.message ??
          (t('notifications.sessionTerminatedMessage') ||
            "Una nova sessió s'ha obert des d'un altre dispositiu."),
        {
          duration: 0,
          action: {
            label: t('common.close') || 'Tancar',
            onClick: () => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('nickname')
                localStorage.removeItem('socketToken')
                window.location.href = '/'
              }
            },
          },
        }
      )
    }
    const onGeneralMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/chat')) {
        showInfo(
          t('notifications.newMessage') || 'Nou missatge',
          `${message.userNickname}: ${message.content}`,
          {
            action: {
              label: t('notifications.view') || 'Veure',
              onClick: () => router.push('/app/chat'),
            },
          }
        )
      }
    }
    const onPrivateMessage = (message: ChatMessage) => {
      const otherUserNickname =
        message.userNickname === nickname ? activePrivateChatRef.current : message.userNickname
      const messageProductId = message.productId ?? activePrivateProductIdRef.current ?? null
      if (!otherUserNickname) return
      const chatKey = buildPrivateChatKey(otherUserNickname, messageProductId)
      setOpenPrivateChats((prev) =>
        prev.includes(otherUserNickname) ? prev : [...prev, otherUserNickname]
      )
      setPrivateChats((prev) => ({ ...prev, [chatKey]: [...(prev[chatKey] || []), message] }))
      if (
        activePrivateChatRef.current === otherUserNickname &&
        activePrivateProductIdRef.current === messageProductId
      ) {
        scrollToBottom(messagesEndRef)
      } else {
        setUnreadPrivateChats((prev) => ({ ...prev, [chatKey]: (prev[chatKey] || 0) + 1 }))
        if (
          typeof window !== 'undefined' &&
          (!window.location.pathname.includes('/chat') ||
            activePrivateChatRef.current !== otherUserNickname)
        ) {
          showInfo(
            t('notifications.newPrivateMessage') || 'Nou missatge privat',
            `${message.userNickname}: ${message.content}`,
            {
              action: {
                label: t('notifications.view') || 'Veure',
                onClick: () => router.push(`/app/chat?nickname=${otherUserNickname}`),
              },
            }
          )
        }
      }
    }
    const onOnlineUsers = (users: string[]) => setOnlineUsers(users)
    const onLoadMessages = (loadedMessages: ChatMessage[]) => setMessages(loadedMessages)
    const onLoadPrivateMessages = (data: { messages: ChatMessage[]; productId?: string | null }) => {
      const active = activePrivateChatRef.current
      if (!active) return
      const productIdFromData = data.productId ?? activePrivateProductIdRef.current ?? null
      const chatKey = buildPrivateChatKey(active, productIdFromData)
      setOpenPrivateChats((prev) => (prev.includes(active) ? prev : [...prev, active]))
      setPrivateChats((prev) => ({ ...prev, [chatKey]: data.messages }))
    }

    s.on('connect', onConnect)
    s.on('connect_error', onConnectError)
    s.on('reconnect_attempt', onReconnectAttempt)
    s.on('reconnect', onReconnect)
    s.on('reconnect_error', onReconnectError)
    s.on('reconnect_failed', onReconnectFailed)
    s.on('disconnect', onDisconnect)
    s.on('session-terminated', onSessionTerminated)
    s.on('general-message', onGeneralMessage)
    s.on('private-message', onPrivateMessage)
    s.on('online-users', onOnlineUsers)
    s.on('load-messages', onLoadMessages)
    s.on('load-private-messages', onLoadPrivateMessages)

    if (s.connected) {
      s.emit('join-general')
    }

    return () => {
      s.off('connect', onConnect)
      s.off('connect_error', onConnectError)
      s.off('reconnect_attempt', onReconnectAttempt)
      s.off('reconnect', onReconnect)
      s.off('reconnect_error', onReconnectError)
      s.off('reconnect_failed', onReconnectFailed)
      s.off('disconnect', onDisconnect)
      s.off('session-terminated', onSessionTerminated)
      s.off('general-message', onGeneralMessage)
      s.off('private-message', onPrivateMessage)
      s.off('online-users', onOnlineUsers)
      s.off('load-messages', onLoadMessages)
      s.off('load-private-messages', onLoadPrivateMessages)
    }
  }, [
    nickname,
    socket,
    router,
    showInfo,
    t,
    activePrivateChatRef,
    activePrivateProductIdRef,
    messagesEndRef,
    setMessages,
    setPrivateChats,
    setOpenPrivateChats,
    setUnreadPrivateChats,
    setOnlineUsers,
  ])

  useEffect(() => {
    if (!activePrivateChat && socket && connected) {
      socket.emit('join-general')
    }
  }, [activePrivateChat, socket, connected])

  useEffect(() => {
    if (!socket || !connected) return
    if (!activePrivateChat || activePrivateTab === null) return

    const productId =
      activePrivateTab === null ? null : activePrivateTab === 'general' ? null : activePrivateTab

    socket.emit('join-private', {
      targetNickname: activePrivateChat,
      productId,
    })
    socket.emit('load-private-messages', {
      targetNickname: activePrivateChat,
      productId,
    })
  }, [socket, connected, activePrivateChat, activePrivateTab])

  useEffect(() => {
    if (!socket || !connected) return
    if (activePrivateChat && activePrivateTab !== null) {
      const productId =
        activePrivateTab === null ? null : activePrivateTab === 'general' ? null : activePrivateTab
      socket.emit('join-private', {
        targetNickname: activePrivateChat,
        productId,
      })
      socket.emit('load-private-messages', {
        targetNickname: activePrivateChat,
        productId,
      })
      return
    }

    if (!activePrivateChat) {
      socket.emit('join-general')
    }
  }, [socket, connected, activePrivateChat, activePrivateTab])
}

export function useChatSocketDiagnostics(nickname: string | null) {
  useEffect(() => {
    if (!nickname || typeof window === 'undefined') return
    const diagnosticSocketUrl = getSocketUrl()
    if (!diagnosticSocketUrl) {
      logInfo(
        '⚠️ Socket.io desactivat a producció. Configura NEXT_PUBLIC_SOCKET_URL per activar el xat.'
      )
      logInfo(
        '   Configura a Vercel: NEXT_PUBLIC_SOCKET_URL=https://xarxanglesola-production.up.railway.app'
      )
      return
    }
    logInfo('  → URL final del socket:', diagnosticSocketUrl)
    logInfo('=== DIAGNÒSTIC DE CONNEXIÓ SOCKET.IO ===')
    logInfo('URL del socket:', diagnosticSocketUrl)
    logInfo('Origin actual:', window.location.origin)
    logInfo('Hostname:', window.location.hostname)
    logInfo('========================================')
    if (process.env.NODE_ENV !== 'production') {
      logInfo(
        '🔍 Provant connexió HTTP a:',
        `${diagnosticSocketUrl}/socket.io/?EIO=4&transport=polling`
      )
    }
  }, [nickname])
}
