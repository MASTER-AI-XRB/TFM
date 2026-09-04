import { logInfo, logWarn } from '@/lib/client-logger'
import { swrJsonFetcher } from '@/lib/swr-fetcher'

export type PrivateChatProductSummary = {
  id: string
  name: string
  images: string[]
  reserved?: boolean
  reservedBy?: { nickname: string } | null
}

type ProductWithUser = PrivateChatProductSummary & {
  user?: { nickname?: string }
}

export async function fetchPrivateChatProducts(
  activePrivateChat: string,
  wantedProductId?: string | null
): Promise<PrivateChatProductSummary[]> {
  let list: PrivateChatProductSummary[] = []

  try {
    const data = await swrJsonFetcher<ProductWithUser[]>(
      `/api/users/${encodeURIComponent(activePrivateChat)}/products`,
      { cache: 'no-store' }
    )
    if (Array.isArray(data)) {
      logInfo('Productes del DM carregats', { nickname: activePrivateChat, count: data.length })
      list = data
    } else {
      logWarn('Resposta inesperada de productes del DM', data)
    }
  } catch (error) {
    logWarn('Error carregant productes del DM', {
      nickname: activePrivateChat,
      status: (error as { status?: number }).status,
    })
    try {
      const fallbackData = await swrJsonFetcher<ProductWithUser[]>('/api/products', {
        cache: 'no-store',
      })
      if (Array.isArray(fallbackData)) {
        const targetNickname = activePrivateChat.toLowerCase()
        list = fallbackData.filter(
          (product) => product.user?.nickname?.toLowerCase() === targetNickname
        )
      }
    } catch (fallbackError) {
      logWarn('Error carregant productes (fallback)', {
        status: (fallbackError as { status?: number }).status,
      })
    }
  }

  if (wantedProductId && !list.some((product) => product.id === wantedProductId)) {
    try {
      const one = await swrJsonFetcher<ProductWithUser & { reserved?: boolean }>(
        `/api/products/${wantedProductId}`,
        { cache: 'no-store' }
      )
      if (one?.id && one.user?.nickname?.toLowerCase() === activePrivateChat.toLowerCase()) {
        list = [
          {
            id: one.id,
            name: one.name ?? '',
            images: one.images ?? [],
            reserved: !!one.reserved,
            reservedBy: one.reservedBy ?? null,
          },
          ...list,
        ]
      }
    } catch {
      /* ignora */
    }
  }

  return list.map((product) => ({
    id: product.id,
    name: product.name,
    images: product.images ?? [],
    reserved: !!product.reserved,
    reservedBy: product.reservedBy ?? null,
  }))
}
