'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

type ForgotPasswordFormProps = {
  open: boolean
  error: string
  setError: (error: string) => void
  onClose: () => void
}

export default function ForgotPasswordForm({
  open,
  error,
  setError,
  onClose,
}: ForgotPasswordFormProps) {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const { t } = useI18n()

  const handleClose = () => {
    onClose()
    setForgotPasswordEmail('')
    setForgotPasswordSuccess(false)
  }

  const handleCancel = () => {
    handleClose()
    setError('')
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!forgotPasswordEmail.trim()) {
      setError(t('auth.emailRequired'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      setError(t('auth.emailInvalid'))
      return
    }

    setForgotPasswordLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordSuccess(true)
        setError('')
      } else {
        setError(data.error || t('auth.forgotPasswordError'))
      }
    } catch {
      setError(t('auth.connectionError'))
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl dark:shadow-gray-900 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          {t('auth.forgotPasswordTitle')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('auth.forgotPasswordDescription')}
        </p>
        {forgotPasswordSuccess ? (
          <div>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4">
              {t('auth.forgotPasswordSuccess')}
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="forgotPasswordEmail"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.emailPlaceholder')}
                autoFocus
              />
            </div>
            {error && (
              <div
                data-testid="forgot-error"
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded"
              >
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
              >
                {forgotPasswordLoading ? t('common.loading') : t('auth.sendResetLink')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
