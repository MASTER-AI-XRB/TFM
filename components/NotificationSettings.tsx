'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import { useNotifications } from '@/lib/notifications'
import { logError } from '@/lib/client-logger'
import { PUSH_PERMISSION_GRANTED_EVENT } from '@/lib/client-session'

export default function NotificationSettings({ embedded }: { embedded?: boolean } = {}) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isNotificationSupported, setIsNotificationSupported] = useState(false)
  const [nickname, setNickname] = useState<string | null>(null)
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsError, setPrefsError] = useState<string | null>(null)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [receiveAll, setReceiveAll] = useState(true)
  const [allowedNicknamesInput, setAllowedNicknamesInput] = useState('')
  const [allowedKeywordsInput, setAllowedKeywordsInput] = useState('')
  const { t } = useI18n()
  const { showSuccess, showError } = useNotifications()

  const {
    data: prefs,
    isLoading: prefsLoading,
    error: prefsFetchError,
    mutate: mutatePrefs,
  } = useSWR<{
    receiveAll?: boolean
    allowedNicknames?: string[]
    allowedProductKeywords?: string[]
  }>(nickname ? '/api/notification-preferences' : null)

  useEffect(() => {
    if (!prefs) return
    setReceiveAll(prefs.receiveAll !== false)
    setAllowedNicknamesInput((prefs.allowedNicknames || []).join(', '))
    setAllowedKeywordsInput((prefs.allowedProductKeywords || []).join(', '))
  }, [prefs])

  useEffect(() => {
    if (!prefsFetchError) return
    logError('Error carregant preferències:', prefsFetchError)
    setPrefsError(t('notifications.preferencesError') || 'Error carregant preferències')
  }, [prefsFetchError, t])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const supported = 'Notification' in window && !!window.Notification
    setIsNotificationSupported(supported)
    if (supported) {
      setPermission(window.Notification.permission)

      // Detectar si és una PWA/webapp
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
      setIsPWA(isStandalone)
    }
    setNickname(localStorage.getItem('nickname'))
  }, [])

  // Actualitzar l'estat quan canvia el permís (per si canvia des de fora)
  useEffect(() => {
    const checkPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
        const currentPermission = window.Notification.permission
        setPermission(currentPermission)
        // Si el permís ha canviat, tancar els modals
        if (currentPermission === 'denied' && showDisableModal) {
          setShowDisableModal(false)
        }
        if (currentPermission === 'granted' && showEnableModal) {
          setShowEnableModal(false)
        }
      }
    }
    
    // Comprovar cada segon si el permís ha canviat
    const interval = setInterval(checkPermission, 1000)
    return () => clearInterval(interval)
  }, [showDisableModal, showEnableModal])

  const handleToggleNotifications = async () => {
    if (typeof window === 'undefined') {
      return
    }
    if (!('Notification' in window) || !window.Notification) {
      setShowEnableModal(true)
      return
    }

    const NotificationAPI = window.Notification

    try {
      if (permission === 'granted') {
        // Si està activat, no podem canviar-lo programàticament
        // Mostrar modal amb instruccions
        setShowDisableModal(true)
      } else if (permission === 'denied') {
        // Si està bloquejat, alguns navegadors no permeten cridar requestPermission()
        // Mostrar modal amb instruccions per activar manualment
        setShowEnableModal(true)
      } else {
        // Si està en 'default', intentar demanar permís
        try {
          if (!NotificationAPI.requestPermission) {
            setShowEnableModal(true)
            return
          }
          const newPermission = await NotificationAPI.requestPermission()
          setPermission(newPermission)
          
          if (newPermission === 'granted') {
            window.dispatchEvent(new Event(PUSH_PERMISSION_GRANTED_EVENT))
            showSuccess(
              t('notifications.notificationsEnabled') || 'Notificacions activades',
              t('notifications.notificationsEnabledMessage') || 'Ara rebràs notificacions del navegador.'
            )
          }
          // Si continua en 'denied' o 'default', no mostrar cap missatge
        } catch (error) {
          // Si requestPermission llança un error, mostrar modal amb instruccions
          logError('Error demanant permís:', error)
          setShowEnableModal(true)
        }
      }
    } catch (error) {
      logError('Error general gestionant notificacions:', error)
    }
  }

  return (
    <>
      <div
        className={`flex items-center gap-2 ${embedded ? 'px-0 py-0' : 'border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1'}`}
      >
        <button
          onClick={handleToggleNotifications}
          className={`transition ${
            permission === 'granted'
              ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          } ${!isNotificationSupported ? 'opacity-60' : ''}`}
          title={
            permission === 'granted'
              ? t('notifications.disableNotifications') || 'Desactivar notificacions'
              : t('notifications.enableNotifications') || 'Activar notificacions'
          }
        >
          {permission === 'granted' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          )}
        </button>
        {nickname && (
          <button
            onClick={() => {
              setShowPreferencesModal(true)
              setPrefsSaved(false)
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            title={t('notifications.preferencesTitle') || 'Preferències de notificacions'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.983 2.75a1 1 0 011.034.75l.348 1.272a7.47 7.47 0 012.013.834l1.187-.686a1 1 0 011.366.366l1 1.732a1 1 0 01-.366 1.366l-1.187.686c.08.315.137.638.17.967l1.33.23a1 1 0 01.823.985v2a1 1 0 01-.823.985l-1.33.23a7.51 7.51 0 01-.17.967l1.187.686a1 1 0 01.366 1.366l-1 1.732a1 1 0 01-1.366.366l-1.187-.686a7.47 7.47 0 01-2.013.834l-.348 1.272a1 1 0 01-1.034.75h-2a1 1 0 01-1.034-.75l-.348-1.272a7.47 7.47 0 01-2.013-.834l-1.187.686a1 1 0 01-1.366-.366l-1-1.732a1 1 0 01.366-1.366l1.187-.686a7.51 7.51 0 01-.17-.967l-1.33-.23A1 1 0 012.5 13.5v-2a1 1 0 01.823-.985l1.33-.23c.033-.329.09-.652.17-.967L3.636 8.632a1 1 0 01-.366-1.366l1-1.732a1 1 0 011.366-.366l1.187.686a7.47 7.47 0 012.013-.834l.348-1.272a1 1 0 011.034-.75h2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Modal per desactivar notificacions quan estan activades */}
      {showDisableModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDisableModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Desactivar notificacions
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Per desactivar les notificacions, has d&apos;anar a la configuració del teu navegador:
            </p>
            <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
              {isPWA ? (
                <>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Android (Chrome):</strong>
                    <p className="mt-1">Configuració de l&apos;Android → Aplicacions → Xarxa Anglesola → Notificacions → Desactivar</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">iOS (Safari):</strong>
                    <p className="mt-1">Configuració de l&apos;iPhone → Safari → Pàgines web → Notificacions → Xarxa Anglesola → Desactivar</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Desktop (Chrome/Edge):</strong>
                    <p className="mt-1">Clica amb el botó dret a la icona de l&apos;aplicació a la barra de tasques → Configuració → Notificacions → Desactivar</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Chrome/Edge:</strong>
                    <p className="mt-1">Clica a l&apos;icona del cadenat (🔒) a l&apos;esquerra de la barra d&apos;adreces → Notificacions → Bloquejar</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Firefox:</strong>
                    <p className="mt-1">Clica a l&apos;icona del cadenat (🔒) → Més informació → Permisos → Notificacions → Bloquejar</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Safari:</strong>
                    <p className="mt-1">Safari → Configuració → Pàgines web → Notificacions → Bloquejar</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
              >
                Tancar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal per activar notificacions quan estan bloquejades */}
      {showEnableModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEnableModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activar notificacions
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Per activar les notificacions, has d&apos;anar a la configuració del teu navegador:
            </p>
            <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
              {isPWA ? (
                <>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Android (Chrome):</strong>
                    <p className="mt-1">Configuració de l&apos;Android → Aplicacions → Xarxa Anglesola → Notificacions → Activar</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">iOS (Safari):</strong>
                    <p className="mt-1">Configuració de l&apos;iPhone → Safari → Pàgines web → Notificacions → Xarxa Anglesola → Permetre</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Desktop (Chrome/Edge):</strong>
                    <p className="mt-1">Clica amb el botó dret a la icona de l&apos;aplicació a la barra de tasques → Configuració → Notificacions → Activar</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Chrome/Edge:</strong>
                    <p className="mt-1">Clica a l&apos;icona del cadenat (🔒) a l&apos;esquerra de la barra d&apos;adreces → Notificacions → Permetre</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Firefox:</strong>
                    <p className="mt-1">Clica a l&apos;icona del cadenat (🔒) → Més informació → Permisos → Notificacions → Permetre</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Safari:</strong>
                    <p className="mt-1">Safari → Configuració → Pàgines web → Notificacions → Permetre</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEnableModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
              >
                Tancar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreferencesModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreferencesModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                onClick={() => setShowPreferencesModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
              >
                {t('common.close')}
              </button>
              <button
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
                    setPrefsError(
                      t('notifications.preferencesError') || 'No s\'han pogut desar les preferències'
                    )
                    showError(
                      t('common.error') || 'Error',
                      t('notifications.preferencesError') || 'No s\'han pogut desar les preferències'
                    )
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
      )}
    </>
  )
}
