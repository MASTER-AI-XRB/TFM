'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { io, type Socket } from 'socket.io-client'
import { getSocketUrl } from '@/lib/socket'
import { getStoredNickname, getStoredSocketToken, PUSH_PERMISSION_GRANTED_EVENT } from '@/lib/client-session'
import { useNotifications } from '@/lib/notifications'
import { useI18n } from '@/lib/i18n'
import { formatTranslation, getLocaleNow } from '@/lib/i18n-format'
import { logInfo, logWarn } from '@/lib/client-logger'
import { registerPushSubscription } from '@/lib/push-subscription'

type AppSocketContextValue = {
  socket: Socket | null
  connected: boolean
}

const AppSocketContext = createContext<AppSocketContextValue>({
  socket: null,
  connected: false,
})

export function useAppSocket() {
  return useContext(AppSocketContext)
}

export function AppSocketProvider({ children, ready }: { children: ReactNode; ready?: boolean }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const router = useRouter()
  const { showInfo, addAlert } = useNotifications()
  const { locale } = useI18n()
  const routerRef = useRef(router)
  const showInfoRef = useRef(showInfo)
  const addAlertRef = useRef(addAlert)
  const localeRef = useRef(locale)
  useEffect(() => {
    routerRef.current = router
    showInfoRef.current = showInfo
    addAlertRef.current = addAlert
    localeRef.current = locale
  }, [router, showInfo, addAlert, locale])

  useEffect(() => {
    if (ready === false) {
      setSocket((prev) => {
        if (prev) {
          prev.close()
          return null
        }
        return prev
      })
      setConnected(false)
      return
    }
    const nickname = getStoredNickname()
    const socketToken = getStoredSocketToken()
    const socketUrl = getSocketUrl()
    if (!nickname || !socketToken || !socketUrl) return

    const s = io(socketUrl, {
      auth: { token: socketToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    const onConnect = () => {
      logInfo('AppSocket connectat')
      setConnected(true)
    }
    const onDisconnect = () => setConnected(false)
    const onConnectError = (err: Error) => {
      logWarn('AppSocket connect_error', err?.message)
      setConnected(false)
    }
    const onAppNotification = (data: {
      type?: string
      title?: string
      message?: string
      titleKey?: string
      messageKey?: string
      params?: Record<string, string>
      actorNickname?: string
      productName?: string
      notificationType?: string
      ownerReserve?: boolean
      action?: { label?: string; labelKey?: string; url?: string }
    }) => {
      const r = routerRef.current
      const sh = showInfoRef.current
      const addA = addAlertRef.current
      const locale = localeRef.current ?? getLocaleNow()
      const rawParams = (data.params ?? {}) as Record<string, string | number>
      const params: Record<string, string | number> = {
        ...rawParams,
        nickname: rawParams.nickname ?? rawParams.user ?? data.actorNickname ?? '',
        productName: rawParams.productName ?? rawParams.producte ?? data.productName ?? '',
      }
      let title = ''
      let message = ''
      let actionLabel = ''
      if (data.titleKey) {
        const translated = formatTranslation(locale, data.titleKey)
        title = (translated && translated.trim() && translated !== data.titleKey) ? translated : (data.title ?? '')
      } else {
        title = (typeof data.title === 'string' && data.title.trim()) ? data.title : ''
      }
      if (data.messageKey) {
        const translated = formatTranslation(locale, data.messageKey, params)
        message = (translated && translated.trim() && translated !== data.messageKey) ? translated : (data.message ?? '')
      } else {
        message = (typeof data.message === 'string' && data.message.trim()) ? data.message : ''
      }
      if (data.action?.labelKey) {
        const translated = formatTranslation(locale, data.action.labelKey)
        actionLabel = (translated && translated.trim() && translated !== data.action.labelKey) ? translated : (data.action?.label ?? '')
      } else {
        actionLabel = (typeof data.action?.label === 'string' && data.action.label.trim()) ? data.action.label : ''
      }
      if (!title) title = formatTranslation(locale, 'common.appName')
      if (!message) message = ' '
      sh(title, message, {
        type: (data.type as 'info' | 'success' | 'warning' | 'error') || 'info',
        notificationType: data.notificationType,
        ownerReserve: data.ownerReserve === true,
        action: data.action?.url
          ? {
              label: actionLabel,
              onClick: () => r.push(data.action!.url!),
            }
          : undefined,
      })
      addA({
        title,
        message,
        notificationType: data.notificationType,
        ownerReserve: data.ownerReserve === true,
        titleKey: data.titleKey,
        messageKey: data.messageKey,
        params: Object.keys(params).length ? params : undefined,
        actionLabelKey: data.action?.labelKey,
        action: data.action?.url ? { url: data.action.url, label: actionLabel } : undefined,
      })
    }
    const onProductState = (data: { productId: string; reserved?: boolean; reservedBy?: { nickname: string } | null; prestec?: boolean }) => {
      if (typeof window !== 'undefined' && data?.productId) {
        logInfo('product-state rebut:', { productId: data.productId, reserved: data.reserved, reservedBy: data.reservedBy })
        window.dispatchEvent(new CustomEvent('product-state', { detail: data }))
      }
    }

    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    s.on('connect_error', onConnectError)
    s.on('app-notification', onAppNotification)
    s.on('product-state', onProductState)

    setSocket(s)
    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
      s.off('connect_error', onConnectError)
      s.off('app-notification', onAppNotification)
      s.off('product-state', onProductState)
      s.close()
      setSocket(null)
      setConnected(false)
    }
  }, [ready])

  useEffect(() => {
    if (!ready) return
    if (!getStoredNickname()) return

    const abort = new AbortController()
    let subscription: PushSubscription | null = null

    const register = () => {
      if (typeof window === 'undefined' || window.Notification?.permission !== 'granted') return
      void registerPushSubscription(abort.signal).then((sub) => {
        if (sub) subscription = sub
      })
    }

    register()
    window.addEventListener(PUSH_PERMISSION_GRANTED_EVENT, register)

    return () => {
      abort.abort()
      window.removeEventListener(PUSH_PERMISSION_GRANTED_EVENT, register)
      if (subscription) {
        void subscription.unsubscribe().catch(() => {})
      }
    }
  }, [ready])

  const value = useMemo(() => ({ socket, connected }), [socket, connected])

  return (
    <AppSocketContext.Provider value={value}>
      {children}
    </AppSocketContext.Provider>
  )
}
