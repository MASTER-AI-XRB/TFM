'use client'

import { useI18n } from '@/lib/i18n'
import { logError } from '@/lib/client-logger'

type Props = {
  open: boolean
  onClose: () => void
  prefsLoading: boolean
  receiveAll: boolean
  setReceiveAll: (v: boolean) => void
  allowedNicknamesInput: string
  setAllowedNicknamesInput: (v: string) => void
  allowedKeywordsInput: string
  setAllowedKeywordsInput: (v: string) => void
  prefsError: string | null
  prefsSaved: boolean
  prefsSaving: boolean
  setPrefsSaving: (v: boolean) => void
  setPrefsError: (v: string | null) => void
  setPrefsSaved: (v: boolean) => void
  onSaveErrorToast: (title: string, message: string) => void
}

export function NotificationPreferencesModal({
  open,
  onClose,
  prefsLoading,
  receiveAll,
  setReceiveAll,
  allowedNicknamesInput,
  setAllowedNicknamesInput,
  allowedKeywordsInput,
  setAllowedKeywordsInput,
  prefsError,
  prefsSaved,
  prefsSaving,
  setPrefsSaving,
  setPrefsError,
  setPrefsSaved,
  onSaveErrorToast,
}: Props) {
  const { t } = useI18n()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-prefs-title"
      >
        <h3 id="notif-prefs-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('notifications.preferencesTitle') || 'Preferències de notificacions'}
        </h3>

        {prefsLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('notifications.preferencesLoading') || 'Carregant preferències...'}
          </p>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={receiveAll}
                onChange={(e) => setReceiveAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              {t('notifications.receiveAll') || 'Rebre totes les notificacions'}
            </label>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                htmlFor="notif-allowed-users"
              >
                {t('notifications.allowedUsersLabel') || 'Usuaris permesos'}
              </label>
              <input
                id="notif-allowed-users"
                type="text"
                value={allowedNicknamesInput}
                onChange={(e) => setAllowedNicknamesInput(e.target.value)}
                disabled={receiveAll}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                placeholder={t('notifications.allowedUsersHint') || 'nick1, nick2'}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                htmlFor="notif-allowed-products"
              >
                {t('notifications.allowedProductsLabel') || 'Tipus de producte'}
              </label>
              <input
                id="notif-allowed-products"
                type="text"
                value={allowedKeywordsInput}
                onChange={(e) => setAllowedKeywordsInput(e.target.value)}
                disabled={receiveAll}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                placeholder={t('notifications.allowedProductsHint') || 'bici, taula'}
              />
            </div>

            {prefsError && (
              <div className="text-sm text-red-600 dark:text-red-400">{prefsError}</div>
            )}
            {prefsSaved && (
              <div className="text-sm text-green-600 dark:text-green-400">
                {t('notifications.preferencesSaved') || 'Preferències desades'}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
          >
            {t('common.close')}
          </button>
          <button
            type="button"
            onClick={async () => {
              setPrefsSaving(true)
              setPrefsError(null)
              setPrefsSaved(false)
              try {
                const response = await fetch('/api/notification-preferences', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    receiveAll,
                    allowedNicknames: allowedNicknamesInput,
                    allowedProductKeywords: allowedKeywordsInput,
                    enabledTypes: [],
                  }),
                })
                if (!response.ok) {
                  throw new Error('Error guardant preferències')
                }
                setPrefsSaved(true)
              } catch (error) {
                logError('Error guardant preferències:', error)
                const msg =
                  t('notifications.preferencesError') ||
                  "No s'han pogut desar les preferències"
                setPrefsError(msg)
                onSaveErrorToast(t('common.error') || 'Error', msg)
              } finally {
                setPrefsSaving(false)
              }
            }}
            disabled={prefsSaving || prefsLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {prefsSaving
              ? t('common.loading')
              : t('notifications.savePreferences') || 'Desar preferències'}
          </button>
        </div>
      </div>
    </div>
  )
}
