'use client'

type Props = {
  open: boolean
  isPWA: boolean
  onClose: () => void
}

export function NotificationDisableModal({ open, isPWA, onClose }: Props) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-disable-title"
      >
        <h3 id="notif-disable-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                <p className="mt-1">
                  Configuració de l&apos;Android → Aplicacions → Xarxa Anglesola → Notificacions → Desactivar
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">iOS (Safari):</strong>
                <p className="mt-1">
                  Configuració de l&apos;iPhone → Safari → Pàgines web → Notificacions → Xarxa Anglesola →
                  Desactivar
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">Desktop (Chrome/Edge):</strong>
                <p className="mt-1">
                  Clica amb el botó dret a la icona de l&apos;aplicació a la barra de tasques → Configuració →
                  Notificacions → Desactivar
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong className="text-gray-900 dark:text-white">Chrome/Edge:</strong>
                <p className="mt-1">
                  Clica a l&apos;icona del cadenat (🔒) a l&apos;esquerra de la barra d&apos;adreces →
                  Notificacions → Bloquejar
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">Firefox:</strong>
                <p className="mt-1">
                  Clica a l&apos;icona del cadenat (🔒) → Més informació → Permisos → Notificacions → Bloquejar
                </p>
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
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotificationEnableModal({ open, isPWA, onClose }: Props) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-enable-title"
      >
        <h3 id="notif-enable-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                <p className="mt-1">
                  Configuració de l&apos;Android → Aplicacions → Xarxa Anglesola → Notificacions → Activar
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">iOS (Safari):</strong>
                <p className="mt-1">
                  Configuració de l&apos;iPhone → Safari → Pàgines web → Notificacions → Xarxa Anglesola →
                  Permetre
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">Desktop (Chrome/Edge):</strong>
                <p className="mt-1">
                  Clica amb el botó dret a la icona de l&apos;aplicació a la barra de tasques → Configuració →
                  Notificacions → Activar
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong className="text-gray-900 dark:text-white">Chrome/Edge:</strong>
                <p className="mt-1">
                  Clica a l&apos;icona del cadenat (🔒) a l&apos;esquerra de la barra d&apos;adreces →
                  Notificacions → Permetre
                </p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">Firefox:</strong>
                <p className="mt-1">
                  Clica a l&apos;icona del cadenat (🔒) → Més informació → Permisos → Notificacions → Permetre
                </p>
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
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  )
}
