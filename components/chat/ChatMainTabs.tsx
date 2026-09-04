'use client'

interface ChatMainTabsProps {
  generalLabel: string
  privateWithLabel: (nickname: string) => string
  closeChatLabel: string
  activePrivateChat: string | null
  openPrivateChats: string[]
  hasUnread: (chatNickname: string) => boolean
  onSelectGeneral: () => void
  onSelectPrivate: (chatNickname: string) => void
  onClosePrivate: (chatNickname: string) => void
}

export function ChatMainTabs({
  generalLabel,
  privateWithLabel,
  closeChatLabel,
  activePrivateChat,
  openPrivateChats,
  hasUnread,
  onSelectGeneral,
  onSelectPrivate,
  onClosePrivate,
}: ChatMainTabsProps) {
  return (
    <div className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onSelectGeneral()
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg whitespace-nowrap transition cursor-pointer ${
          !activePrivateChat
            ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 font-semibold'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <span>{generalLabel}</span>
      </button>

      {openPrivateChats.map((chatNickname) => (
        <div
          key={chatNickname}
          className={`relative flex items-center gap-1 rounded-t-lg whitespace-nowrap transition group ${
            activePrivateChat === chatNickname
              ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 font-semibold'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {hasUnread(chatNickname) ? (
            <span className="absolute -top-1 -right-[0.125rem] h-3 w-3 rounded-full bg-red-500 z-10 ring-2 ring-white dark:ring-gray-800" />
          ) : null}
          <button
            type="button"
            onClick={() => onSelectPrivate(chatNickname)}
            className="flex items-center gap-2 px-4 py-2"
          >
            <span>{privateWithLabel(chatNickname)}</span>
          </button>
          <button
            type="button"
            onClick={() => onClosePrivate(chatNickname)}
            className="mr-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
            title={closeChatLabel}
            aria-label={closeChatLabel}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
