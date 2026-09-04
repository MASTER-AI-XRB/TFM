'use client'

interface ChatReservedBannerProps {
  reservedByYou: boolean
  reservedByYouLabel: string
  reservedLabel: string
}

export function ChatReservedBanner({
  reservedByYou,
  reservedByYouLabel,
  reservedLabel,
}: ChatReservedBannerProps) {
  return (
    <div className="flex-shrink-0 mb-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <p className="text-sm text-amber-800 dark:text-amber-200">
        {reservedByYou ? reservedByYouLabel : reservedLabel}
      </p>
    </div>
  )
}
