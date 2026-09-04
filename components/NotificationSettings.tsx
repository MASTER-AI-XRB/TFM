'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import { useNotifications } from '@/lib/notifications'
import { logError } from '@/lib/client-logger'
import { PUSH_PERMISSION_GRANTED_EVENT } from '@/lib/client-session'
import {
  NotificationDisableModal,
  NotificationEnableModal,
} from '@/components/NotificationPermissionModals'
import { NotificationPreferencesModal } from '@/components/NotificationPreferencesModal'

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

      <NotificationDisableModal
        open={showDisableModal}
        isPWA={isPWA}
        onClose={() => setShowDisableModal(false)}
      />
      <NotificationEnableModal
        open={showEnableModal}
        isPWA={isPWA}
        onClose={() => setShowEnableModal(false)}
      />
      <NotificationPreferencesModal
        open={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        prefsLoading={prefsLoading}
        receiveAll={receiveAll}
        setReceiveAll={setReceiveAll}
        allowedNicknamesInput={allowedNicknamesInput}
        setAllowedNicknamesInput={setAllowedNicknamesInput}
        allowedKeywordsInput={allowedKeywordsInput}
        setAllowedKeywordsInput={setAllowedKeywordsInput}
        prefsError={prefsError}
        prefsSaved={prefsSaved}
        prefsSaving={prefsSaving}
        setPrefsSaving={setPrefsSaving}
        setPrefsError={setPrefsError}
        setPrefsSaved={setPrefsSaved}
        onSaveErrorToast={showError}
      />
    </>
  )
}
