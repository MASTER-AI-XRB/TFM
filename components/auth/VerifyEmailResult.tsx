'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

type VerifyEmailState = 'ok' | 'taken' | 'invalid'

type Props = {
  state: VerifyEmailState
}

export function VerifyEmailResult({ state }: Props) {
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    if (state !== 'ok') return
    const timeoutId = setTimeout(() => {
      router.push('/app')
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [state, router])

  const message =
    state === 'ok'
      ? t('auth.verifyEmailSuccess')
      : state === 'taken'
        ? t('auth.verifyEmailTaken')
        : t('auth.verifyEmailInvalid')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl dark:shadow-gray-900 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          {t('auth.verifyEmailTitle')}
        </h1>
        <div
          className={`px-4 py-3 rounded mb-4 ${
            state === 'ok'
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}
        >
          {message}
        </div>
        {state === 'ok' && (
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            {t('auth.redirectingToLogin')}
          </p>
        )}
        {(state === 'taken' || state === 'invalid') && (
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            {t('auth.backToLogin')}
          </button>
        )}
      </div>
    </div>
  )
}
