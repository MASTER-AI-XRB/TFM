'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'

function ReserveIcon({
  className = 'w-5 h-5',
  fill = 'none',
}: {
  className?: string
  fill?: 'none' | 'currentColor'
}) {
  return (
    <svg
      className={className}
      fill={fill}
      stroke="currentColor"
      viewBox={fill === 'currentColor' ? '0 0 20 20' : '0 0 24 24'}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {fill === 'currentColor' ? (
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      )}
    </svg>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export function ReserveDetailDialog({ open, onClose }: Props) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[80] m-auto max-h-[85vh] w-full max-w-md rounded-lg border border-gray-200 bg-white p-0 shadow-xl dark:border-gray-700 dark:bg-gray-800 open:flex open:flex-col backdrop:bg-black/50"
      aria-labelledby="reserve-detail-title"
      onClose={onClose}
    >
      <div className="flex max-h-[85vh] w-full flex-col overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 shrink-0">
          <h3 id="reserve-detail-title" className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('info.reserveDetailTitle')}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{t('info.reserveDetailIntro')}</p>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 px-4 py-3 space-y-3">
          <div className="text-sm border-l-2 border-blue-200 dark:border-blue-700 pl-3 py-0.5">
            <p className="font-medium text-gray-900 dark:text-white inline-flex items-center gap-1 flex-wrap">
              {t('info.reserveType1Title')}
              <span
                className="inline-flex items-center justify-center rounded-full p-1 bg-blue-500 text-white shrink-0 ml-1"
                aria-hidden
              >
                <ReserveIcon className="w-4 h-4" fill="currentColor" />
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs leading-relaxed">
              {t('info.reserveType1DescBefore')}
              <span
                className="inline-flex align-middle rounded-full p-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 shrink-0 mx-0.5"
                aria-hidden
              >
                <ReserveIcon className="w-3.5 h-3.5" />
              </span>
              {t('info.reserveType1DescAfter')}
            </p>
          </div>
          <div className="text-sm border-l-2 border-blue-200 dark:border-blue-700 pl-3 py-0.5">
            <p className="font-medium text-gray-900 dark:text-white inline-flex items-center gap-1 flex-wrap">
              {t('info.reserveType2Title')}
              <span
                className="inline-flex items-center justify-center rounded-full p-1 bg-yellow-500 text-white shrink-0 ml-1"
                aria-hidden
              >
                <ReserveIcon className="w-4 h-4" fill="currentColor" />
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs leading-relaxed">
              {t('info.reserveType2Desc')}
            </p>
          </div>
        </div>
        <div className="px-4 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </dialog>
  )
}
