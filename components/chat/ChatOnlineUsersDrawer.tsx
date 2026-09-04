'use client'

interface ChatOnlineUsersDrawerProps {
  title: string
  noOnlineUsersLabel: string
  users: string[]
  nickname: string | null
  activePrivateChat: string | null
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onSelectUser: (user: string) => void
}

export function ChatOnlineUsersDrawer({
  title,
  noOnlineUsersLabel,
  users,
  nickname,
  activePrivateChat,
  isOpen,
  onOpen,
  onClose,
  onSelectUser,
}: ChatOnlineUsersDrawerProps) {
  const filteredUsers = users.filter((user) => user !== nickname)

  return (
    <>
      <div
        className={`sm:hidden fixed right-0 z-50 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen
            ? 'top-[calc(4rem+1rem)] bottom-[calc(4rem+1rem)] w-64 rounded-l-lg bg-white dark:bg-gray-800 border-l-4 border-blue-600 dark:border-blue-700'
            : 'top-[calc(4rem+1rem)] h-auto w-auto rounded-l-lg bg-blue-600 dark:bg-blue-700'
        }`}
      >
        {!isOpen && (
          <button
            onClick={onOpen}
            className="px-3 py-2 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition w-full h-full flex items-center justify-center"
            title={title}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>
        )}

        {isOpen && (
          <div className="h-full bg-white dark:bg-gray-800 flex flex-col animate-slide-in-right">
            <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button
              type="button"
              onClick={onClose}
              aria-label={title}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user}
                    onClick={() => onSelectUser(user)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      activePrivateChat === user
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    👤 {user}
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    {noOnlineUsersLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isOpen ? (
        <button
          type="button"
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in border-0 p-0 cursor-default"
          aria-label={title}
          onClick={onClose}
        />
      ) : null}
    </>
  )
}
