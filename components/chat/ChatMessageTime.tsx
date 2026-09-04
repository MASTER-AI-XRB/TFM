'use client'

interface ChatMessageTimeProps {
  createdAt: string
  locale: string
}

export function ChatMessageTime({ createdAt, locale }: ChatMessageTimeProps) {
  const timeLocale = locale === 'ca' ? 'ca-ES' : locale === 'es' ? 'es-ES' : 'en-US'

  return (
    <span className="text-xs" suppressHydrationWarning>
      {new Date(createdAt).toLocaleTimeString(timeLocale, {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  )
}
