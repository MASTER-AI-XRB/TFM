'use client'

import TranslateButton from '@/components/TranslateButton'
import { ChatMessageTime } from '@/components/chat/ChatMessageTime'
import type { ChatMessage, ChatProductSummary } from '@/lib/chat-types'
import { findActiveProduct, getDateLabel, isNewDay } from '@/lib/chat-utils'
import { ChatReservedBanner } from '@/components/chat/ChatReservedBanner'

interface ChatMessageListProps {
  messages: ChatMessage[]
  nickname: string | null
  locale: string
  activePrivateChat: string | null
  activePrivateTab: string | null
  activePrivateProducts: ChatProductSummary[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  todayLabel: string
  yesterdayLabel: string
  noMessagesLabel: string
  selectProductLabel: string
  reservedByYouLabel: string
  reservedLabel: string
  startPrivateChatLabel: (nickname: string) => string
  onStartPrivateChat: (nickname: string) => void
}

export function ChatMessageList({
  messages,
  nickname,
  locale,
  activePrivateChat,
  activePrivateTab,
  activePrivateProducts,
  messagesEndRef,
  todayLabel,
  yesterdayLabel,
  noMessagesLabel,
  selectProductLabel,
  reservedByYouLabel,
  reservedLabel,
  startPrivateChatLabel,
  onStartPrivateChat,
}: ChatMessageListProps) {
  const showReservedBanner =
    activePrivateChat &&
    activePrivateTab !== null &&
    activePrivateTab !== 'general'

  const activeProduct =
    showReservedBanner && activePrivateTab
      ? findActiveProduct(activePrivateProducts, activePrivateTab)
      : undefined

  const reservedBanner =
    activeProduct?.reserved && showReservedBanner ? (
      <ChatReservedBanner
        reservedByYou={!!nickname && activeProduct.reservedBy?.nickname === nickname}
        reservedByYouLabel={reservedByYouLabel}
        reservedLabel={reservedLabel}
      />
    ) : null

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
      {reservedBanner}

      {activePrivateChat && activePrivateTab === null ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">{selectProductLabel}</div>
      ) : messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">{noMessagesLabel}</div>
      ) : (
        messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null
          const showDateSeparator = isNewDay(
            message.createdAt,
            previousMessage?.createdAt || null
          )
          const isOwnMessage = message.userNickname === nickname

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      {getDateLabel(new Date(message.createdAt), locale, todayLabel, yesterdayLabel)}
                    </span>
                  </div>
                </div>
              )}
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {!activePrivateChat && (
                    <div
                      className={`text-xs font-semibold mb-1 ${
                        isOwnMessage ? 'opacity-90' : 'opacity-75'
                      }`}
                    >
                      {message.userNickname}
                    </div>
                  )}
                  {activePrivateChat && !isOwnMessage && (
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {message.userNickname}
                    </div>
                  )}
                  <div>
                    <TranslateButton text={message.content} />
                  </div>
                  <div
                    className={`flex items-center justify-between mt-1 ${
                      isOwnMessage ? 'opacity-90' : 'opacity-75'
                    }`}
                  >
                    <ChatMessageTime createdAt={message.createdAt} locale={locale} />
                    {!activePrivateChat && !isOwnMessage && (
                      <button
                        onClick={() => onStartPrivateChat(message.userNickname)}
                        className="ml-2 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        title={startPrivateChatLabel(message.userNickname)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
