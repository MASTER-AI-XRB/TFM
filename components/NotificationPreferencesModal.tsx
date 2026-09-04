'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { logError } from '@/lib/client-logger'
import { NotificationPreferencesForm } from '@/components/NotificationPreferencesForm'

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

async function saveNotificationPreferences(body: {
  receiveAll: boolean
  allowedNicknames: string
  allowedProductKeywords: string
}) {
  const response = await fetch('/api/notification-preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, enabledTypes: [] }),
  })
  if (!response.ok) {
    throw new Error('Error guardant preferències')
  }
}

const DIALOG_CLASS =
  'fixed inset-0 z-50 m-auto max-h-[90vh] w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 backdrop:bg-black/50'

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

  const handleSave = async () => {
    setPrefsSaving(true)
    setPrefsError(null)
    setPrefsSaved(false)
    try {
      await saveNotificationPreferences({
        receiveAll,
        allowedNicknames: allowedNicknamesInput,
        allowedProductKeywords: allowedKeywordsInput,
      })
      setPrefsSaved(true)
    } catch (error) {
      logError('Error guardant preferències:', error)
      const msg =
        t('notifications.preferencesError') || "No s'han pogut desar les preferències"
      setPrefsError(msg)
      onSaveErrorToast(t('common.error') || 'Error', msg)
    } finally {
      setPrefsSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={DIALOG_CLASS}
      aria-labelledby="notif-prefs-title"
      onClose={onClose}
    >
      <h3 id="notif-prefs-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('notifications.preferencesTitle') || 'Preferències de notificacions'}
      </h3>

      {prefsLoading ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('notifications.preferencesLoading') || 'Carregant preferències...'}
        </p>
      ) : (
        <NotificationPreferencesForm
          receiveAll={receiveAll}
          setReceiveAll={setReceiveAll}
          allowedNicknamesInput={allowedNicknamesInput}
          setAllowedNicknamesInput={setAllowedNicknamesInput}
          allowedKeywordsInput={allowedKeywordsInput}
          setAllowedKeywordsInput={setAllowedKeywordsInput}
          prefsError={prefsError}
          prefsSaved={prefsSaved}
          labels={{
            receiveAll: t('notifications.receiveAll') || 'Rebre totes les notificacions',
            usersLabel: t('notifications.allowedUsersLabel') || 'Usuaris permesos',
            usersHint: t('notifications.allowedUsersHint') || 'nick1, nick2',
            productsLabel: t('notifications.allowedProductsLabel') || 'Tipus de producte',
            productsHint: t('notifications.allowedProductsHint') || 'bici, taula',
            saved: t('notifications.preferencesSaved') || 'Preferències desades',
          }}
        />
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
          onClick={() => void handleSave()}
          disabled={prefsSaving || prefsLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {prefsSaving
            ? t('common.loading')
            : t('notifications.savePreferences') || 'Desar preferències'}
        </button>
      </div>
    </dialog>
  )
}
