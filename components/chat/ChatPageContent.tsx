'use client'

import { ChatMainTabs } from '@/components/chat/ChatMainTabs'
import { ChatMessageInput } from '@/components/chat/ChatMessageInput'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatOnlineUsersDrawer } from '@/components/chat/ChatOnlineUsersDrawer'
import { ChatOnlineUsersSidebar } from '@/components/chat/ChatOnlineUsersSidebar'
import { ChatProductTabs } from '@/components/chat/ChatProductTabs'
import { ChatProductionWarning } from '@/components/chat/ChatProductionWarning'
import { useChatPage } from '@/lib/use-chat-page'

export default function ChatPageContent() {
  const chat = useChatPage()

  const messagePlaceholder = chat.activePrivateChat
    ? chat.activePrivateTab !== null
      ? chat.t('chat.writePrivateMessage')
      : chat.t('chat.selectProduct')
    : chat.t('chat.writeMessage')

  const handleMobileUserSelect = (user: string) => {
    chat.startPrivateChat(user)
    chat.setIsOnlineUsersDrawerOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden h-[calc(100vh-12rem)] sm:h-[calc(100vh-7rem)] flex flex-col">
        {chat.showSocketWarning && (
          <ChatProductionWarning
            message={
              chat.t('chat.disabledProduction') ||
              'El xat requereix configuració. Configura NEXT_PUBLIC_SOCKET_URL per activar-lo.'
            }
          />
        )}

        <ChatMainTabs
          generalLabel={chat.t('chat.general')}
          privateWithLabel={(nickname) => chat.t('chat.privateWith', { nickname })}
          closeChatLabel={chat.t('chat.closeChat')}
          activePrivateChat={chat.activePrivateChat}
          openPrivateChats={chat.openPrivateChats}
          hasUnread={chat.hasUnreadForUser}
          onSelectGeneral={chat.switchToGeneralChat}
          onSelectPrivate={chat.selectPrivateChatTab}
          onClosePrivate={chat.closePrivateChat}
        />

        {chat.activePrivateChat && (
          <ChatProductTabs
            activePrivateChat={chat.activePrivateChat}
            activePrivateTab={chat.activePrivateTab}
            generalDmLabel={chat.t('chat.generalDm') || 'General'}
            loadingLabel={chat.t('common.loading') || 'Carregant...'}
            products={chat.activePrivateProducts}
            isLoading={chat.isPrivateProductsLoading}
            getUnread={(productId) => chat.getUnreadForProduct(chat.activePrivateChat!, productId)}
            onSelectGeneral={chat.selectGeneralProductTab}
            onSelectProduct={chat.selectProductTab}
          />
        )}

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatMessageList
              messages={chat.currentMessages}
              nickname={chat.nickname}
              locale={chat.locale}
              activePrivateChat={chat.activePrivateChat}
              activePrivateTab={chat.activePrivateTab}
              activePrivateProducts={chat.activePrivateProducts}
              messagesEndRef={chat.messagesEndRef}
              todayLabel={chat.t('chat.today')}
              yesterdayLabel={chat.t('chat.yesterday')}
              noMessagesLabel={chat.t('chat.noMessages')}
              selectProductLabel={chat.t('chat.selectProduct') || 'Selecciona un producte per començar el xat.'}
              reservedByYouLabel={chat.t('products.reservedByYou')}
              reservedLabel={chat.t('products.reserved')}
              startPrivateChatLabel={(nickname) =>
                chat.t('chat.startPrivateChat', { nickname })
              }
              onStartPrivateChat={chat.startPrivateChat}
            />

            <ChatMessageInput
              value={chat.newMessage}
              onChange={chat.setNewMessage}
              onSubmit={chat.sendMessage}
              placeholder={messagePlaceholder}
              sendLabel={chat.t('chat.send')}
              connectingLabel={chat.t('chat.connecting')}
              canSend={chat.canSendMessage}
              showConnectingHint={!chat.connected && !!chat.socketUrl}
            />
          </div>

          <ChatOnlineUsersSidebar
            title={chat.t('chat.onlineUsers')}
            users={chat.onlineUsers}
            nickname={chat.nickname}
            activePrivateChat={chat.activePrivateChat}
            onSelectUser={chat.startPrivateChat}
          />
        </div>
      </div>

      <ChatOnlineUsersDrawer
        title={chat.t('chat.onlineUsers')}
        noOnlineUsersLabel={chat.t('chat.noOnlineUsers')}
        users={chat.onlineUsers}
        nickname={chat.nickname}
        activePrivateChat={chat.activePrivateChat}
        isOpen={chat.isOnlineUsersDrawerOpen}
        onOpen={() => chat.setIsOnlineUsersDrawerOpen(true)}
        onClose={() => chat.setIsOnlineUsersDrawerOpen(false)}
        onSelectUser={handleMobileUserSelect}
      />
    </div>
  )
}
