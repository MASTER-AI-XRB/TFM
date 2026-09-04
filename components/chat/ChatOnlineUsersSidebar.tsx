'use client'

interface ChatOnlineUsersSidebarProps {
  title: string
  users: string[]
  nickname: string | null
  activePrivateChat: string | null
  onSelectUser: (user: string) => void
}

export function ChatOnlineUsersSidebar({
  title,
  users,
  nickname,
  activePrivateChat,
  onSelectUser,
}: ChatOnlineUsersSidebarProps) {
  const filteredUsers = users.filter((user) => user !== nickname)

  return (
    <div className="hidden sm:block sm:w-40 md:w-64 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto flex-shrink-0">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
        {title}
      </h2>
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <button
            key={user}
            onClick={() => onSelectUser(user)}
            className={`w-full text-left px-3 py-2 rounded ${
              activePrivateChat === user
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            👤 {user}
          </button>
        ))}
      </div>
    </div>
  )
}
