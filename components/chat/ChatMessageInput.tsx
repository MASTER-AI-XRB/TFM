'use client'

interface ChatMessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  placeholder: string
  sendLabel: string
  connectingLabel: string
  canSend: boolean
  showConnectingHint: boolean
}

export function ChatMessageInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  sendLabel,
  connectingLabel,
  canSend,
  showConnectingHint,
}: ChatMessageInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-2 sm:p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
    >
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-2 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!canSend}
        />
        <button
          type="submit"
          disabled={!canSend || !value.trim()}
          className="bg-blue-600 dark:bg-blue-700 text-white px-3 sm:px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 text-sm sm:text-base"
        >
          {sendLabel}
        </button>
      </div>
      {showConnectingHint && (
        <div className="mt-2">
          <p className="text-sm text-red-500 dark:text-red-400">{connectingLabel}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Verifica la consola del navegador per veure errors de connexió
          </p>
        </div>
      )}
    </form>
  )
}
