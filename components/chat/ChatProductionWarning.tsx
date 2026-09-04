'use client'

interface ChatProductionWarningProps {
  message: string
}

export function ChatProductionWarning({ message }: ChatProductionWarningProps) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 text-center">
      <p className="text-sm text-yellow-800 dark:text-yellow-200">{message}</p>
    </div>
  )
}
