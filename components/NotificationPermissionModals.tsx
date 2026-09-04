'use client'

import { useEffect, useRef } from 'react'

type Mode = 'enable' | 'disable'

type Props = {
  open: boolean
  mode: Mode
  isPWA: boolean
  onClose: () => void
}

type Instruction = { title: string; body: string }

const ACTION: Record<Mode, { verb: string; title: string; intro: string }> = {
  enable: {
    verb: 'Activar',
    title: 'Activar notificacions',
    intro: "Per activar les notificacions, has d'anar a la configuració del teu navegador:",
  },
  disable: {
    verb: 'Desactivar',
    title: 'Desactivar notificacions',
    intro: "Per desactivar les notificacions, has d'anar a la configuració del teu navegador:",
  },
}

function browserInstructions(mode: Mode): Instruction[] {
  const end = mode === 'enable' ? 'Permetre' : 'Bloquejar'
  return [
    {
      title: 'Chrome/Edge:',
      body: `Clica a l'icona del cadenat (🔒) a l'esquerra de la barra d'adreces → Notificacions → ${end}`,
    },
    {
      title: 'Firefox:',
      body: `Clica a l'icona del cadenat (🔒) → Més informació → Permisos → Notificacions → ${end}`,
    },
    {
      title: 'Safari:',
      body: `Safari → Configuració → Pàgines web → Notificacions → ${end}`,
    },
  ]
}

function pwaInstructions(mode: Mode): Instruction[] {
  const end = mode === 'enable' ? 'Activar' : 'Desactivar'
  const iosEnd = mode === 'enable' ? 'Permetre' : 'Desactivar'
  return [
    {
      title: 'Android (Chrome):',
      body: `Configuració de l'Android → Aplicacions → Xarxa Anglesola → Notificacions → ${end}`,
    },
    {
      title: 'iOS (Safari):',
      body: `Configuració de l'iPhone → Safari → Pàgines web → Notificacions → Xarxa Anglesola → ${iosEnd}`,
    },
    {
      title: 'Desktop (Chrome/Edge):',
      body: `Clica amb el botó dret a la icona de l'aplicació a la barra de tasques → Configuració → Notificacions → ${end}`,
    },
  ]
}

const DIALOG_CLASS =
  'fixed inset-0 z-50 m-auto max-h-[90vh] w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 backdrop:bg-black/50'

export function NotificationPermissionDialog({ open, mode, isPWA, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const copy = ACTION[mode]
  const steps = isPWA ? pwaInstructions(mode) : browserInstructions(mode)
  const titleId = mode === 'enable' ? 'notif-enable-title' : 'notif-disable-title'

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
      className={DIALOG_CLASS}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <h3 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {copy.title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{copy.intro}</p>
      <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
        {steps.map((step) => (
          <div key={step.title}>
            <strong className="text-gray-900 dark:text-white">{step.title}</strong>
            <p className="mt-1">{step.body}</p>
          </div>
        ))}
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
    </dialog>
  )
}
