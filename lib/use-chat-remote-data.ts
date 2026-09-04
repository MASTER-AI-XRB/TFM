'use client'

import useSWR from 'swr'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { fetchPrivateChatProducts } from '@/lib/private-chat-products'
import { useIsVercelProduction } from '@/lib/use-vercel-production'
import { useSocketUrlClient } from '@/lib/use-socket-url-client'
import { logError, logInfo } from '@/lib/client-logger'
import type { ChatProductSummary } from '@/lib/chat-types'

export function useActiveChatProducts(
  activePrivateChat: string | null,
  activePrivateTab: string | null
) {
  const wantedProductId =
    activePrivateTab && activePrivateTab !== 'general' ? activePrivateTab : null

  return useSWR(
    activePrivateChat
      ? (['private-chat-products', activePrivateChat, wantedProductId] as const)
      : null,
    ([, chat, productId]) => fetchPrivateChatProducts(chat, productId),
    { revalidateOnFocus: true }
  )
}

export function useReserveOnDmOpen(
  nickname: string | null,
  searchParams: ReadonlyURLSearchParams
) {
  const urlNickname = searchParams.get('nickname')
  const urlProductId = searchParams.get('productId')
  useSWR(
    urlNickname && urlProductId && nickname && nickname !== urlNickname
      ? (['reserve-on-dm-open', urlProductId] as const)
      : null,
    ([, productId]) =>
      fetch(`/api/products/${productId}/reserve-on-dm-open`, { method: 'POST' }).then((r) => r.ok),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )
}

export function useSocketHttpTest(nickname: string | null) {
  const socketUrl = useSocketUrlClient()
  useSWR(
    nickname && process.env.NODE_ENV !== 'production' && socketUrl
      ? (['socket-http-test', socketUrl] as const)
      : null,
    async ([, url]) => {
      const response = await fetch(`${url}/socket.io/?EIO=4&transport=polling`, {
        method: 'GET',
        mode: 'cors',
      })
      return { status: response.status }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => logInfo('✅ Test de connexió HTTP exitós:', data),
      onError: (err) => logError('❌ Test de connexió HTTP fallat:', err),
    }
  )
  return socketUrl
}

export function useChatUiFlags(
  connected: boolean,
  activePrivateChat: string | null,
  activePrivateTab: string | null,
  privateChatProducts: Record<string, ChatProductSummary[]>,
  loadingPrivateProducts: Record<string, boolean>
) {
  const isProduction = useIsVercelProduction()
  const publicSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
  return {
    showSocketWarning: isProduction && !publicSocketUrl && !connected,
    activePrivateProducts: activePrivateChat
      ? privateChatProducts[activePrivateChat] || []
      : [],
    isPrivateProductsLoading: activePrivateChat
      ? !!loadingPrivateProducts[activePrivateChat]
      : false,
    canSendMessage: connected && (!activePrivateChat || activePrivateTab !== null),
  }
}
