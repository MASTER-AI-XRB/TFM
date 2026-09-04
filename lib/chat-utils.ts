import type { ChatProductSummary } from '@/lib/chat-types'

export function buildPrivateChatKey(chatNickname: string, productId: string | null): string {
  return `${chatNickname}::${productId || 'general'}`
}

export function resolveActiveProductId(tab: string | null): string | null {
  if (tab === null) return null
  return tab === 'general' ? null : tab
}

export function hasUnreadForUser(
  chatNickname: string,
  unreadPrivateChats: Record<string, number>
): boolean {
  return Object.entries(unreadPrivateChats).some(
    ([key, count]) => key.startsWith(`${chatNickname}::`) && count > 0
  )
}

export function getUnreadForProduct(
  chatNickname: string,
  productId: string | null,
  unreadPrivateChats: Record<string, number>
): number {
  return unreadPrivateChats[buildPrivateChatKey(chatNickname, productId)] || 0
}

export function isNewDay(currentDate: string, previousDate: string | null): boolean {
  if (!previousDate) return true
  const current = new Date(currentDate)
  const previous = new Date(previousDate)
  return (
    current.getDate() !== previous.getDate() ||
    current.getMonth() !== previous.getMonth() ||
    current.getFullYear() !== previous.getFullYear()
  )
}

export function getDateLabel(
  date: Date,
  locale: string,
  todayLabel: string,
  yesterdayLabel: string
): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDate = new Date(date)
  messageDate.setHours(0, 0, 0, 0)

  if (messageDate.getTime() === today.getTime()) {
    return todayLabel
  }
  if (messageDate.getTime() === yesterday.getTime()) {
    return yesterdayLabel
  }

  const localeMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    en: 'en-US',
  }
  return messageDate.toLocaleDateString(localeMap[locale] || 'ca-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function findActiveProduct(
  products: ChatProductSummary[],
  productId: string
): ChatProductSummary | undefined {
  return products.find((p) => p.id === productId)
}
