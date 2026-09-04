'use client'

import type { CSSProperties, MutableRefObject, Ref } from 'react'
import { useI18n } from '@/lib/i18n'
import { USE_CASE_KEYS } from '@/lib/onboarding-constants'

type AppInfoPanelProps = {
  panelRef: Ref<HTMLDivElement>
  headerRef: Ref<HTMLElement>
  stepRefs: MutableRefObject<(HTMLDivElement | null)[]>
  reserveDetailButtonRef: Ref<HTMLButtonElement>
  showOnboarding: boolean
  isFixed: boolean
  panelZ: string
  maxHeightClass: string
  overflowClass: string
  style?: CSSProperties
  onAdvance: () => void
  onClose: () => void
  onOpenReserveDetail: () => void
}

export function AppInfoPanel({
  panelRef,
  headerRef,
  stepRefs,
  reserveDetailButtonRef,
  showOnboarding,
  isFixed,
  panelZ,
  maxHeightClass,
  overflowClass,
  style,
  onAdvance,
  onClose,
  onOpenReserveDetail,
}: AppInfoPanelProps) {
  const { t } = useI18n()

  return (
    <div
      ref={panelRef}
      className={
        isFixed
          ? `fixed ${panelZ} w-[min(90vw,22rem)] max-w-[calc(100vw-1rem)] ${maxHeightClass} ${overflowClass} rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col`
          : `absolute right-0 top-full mt-2 w-[min(90vw,22rem)] ${maxHeightClass} ${overflowClass} rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 flex flex-col`
      }
      style={style}
    >
      {showOnboarding ? (
        <button
          type="button"
          ref={headerRef as Ref<HTMLButtonElement>}
          className="px-4 py-3 border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 shrink-0 text-left w-full"
          onClick={onAdvance}
          aria-label={t('common.next')}
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('info.title')}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {t('info.intro')}
          </p>
        </button>
      ) : (
        <div
          ref={headerRef as Ref<HTMLDivElement>}
          className="px-4 py-3 border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 shrink-0 cursor-default"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('info.title')}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {t('info.intro')}
          </p>
        </div>
      )}
      <div
        className={`px-3 py-3 space-y-3 ${showOnboarding ? 'flex-none' : 'flex-1 min-h-0 overflow-y-auto'}`}
      >
        {USE_CASE_KEYS.map((key, index) => (
          <div
            key={key}
            ref={(el) => {
              stepRefs.current[index] = el
            }}
            className="text-sm border-l-2 border-blue-200 dark:border-blue-700 pl-3 py-0.5 cursor-default"
            onClick={showOnboarding ? onAdvance : undefined}
            onKeyDown={
              showOnboarding
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onAdvance()
                    }
                  }
                : undefined
            }
            role={showOnboarding ? 'button' : undefined}
            tabIndex={showOnboarding ? 0 : undefined}
            aria-label={showOnboarding ? t('common.next') : undefined}
          >
            <p className="font-medium text-gray-900 dark:text-white">
              {t(`info.${key}Title`)}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs leading-relaxed">
              {t(`info.${key}Desc`)}
            </p>
            {key === 'reserve' && (
              <button
                ref={reserveDetailButtonRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenReserveDetail()
                }}
                className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                {t('info.reserveMoreDetails')}
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
