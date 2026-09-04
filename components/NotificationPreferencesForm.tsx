'use client'

type PrefsFormProps = {
  receiveAll: boolean
  setReceiveAll: (v: boolean) => void
  allowedNicknamesInput: string
  setAllowedNicknamesInput: (v: string) => void
  allowedKeywordsInput: string
  setAllowedKeywordsInput: (v: string) => void
  prefsError: string | null
  prefsSaved: boolean
  labels: {
    receiveAll: string
    usersLabel: string
    usersHint: string
    productsLabel: string
    productsHint: string
    saved: string
  }
}

export function NotificationPreferencesForm({
  receiveAll,
  setReceiveAll,
  allowedNicknamesInput,
  setAllowedNicknamesInput,
  allowedKeywordsInput,
  setAllowedKeywordsInput,
  prefsError,
  prefsSaved,
  labels,
}: PrefsFormProps) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={receiveAll}
          onChange={(e) => setReceiveAll(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        {labels.receiveAll}
      </label>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          htmlFor="notif-allowed-users"
        >
          {labels.usersLabel}
        </label>
        <input
          id="notif-allowed-users"
          type="text"
          value={allowedNicknamesInput}
          onChange={(e) => setAllowedNicknamesInput(e.target.value)}
          disabled={receiveAll}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          placeholder={labels.usersHint}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          htmlFor="notif-allowed-products"
        >
          {labels.productsLabel}
        </label>
        <input
          id="notif-allowed-products"
          type="text"
          value={allowedKeywordsInput}
          onChange={(e) => setAllowedKeywordsInput(e.target.value)}
          disabled={receiveAll}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          placeholder={labels.productsHint}
        />
      </div>

      {prefsError ? <div className="text-sm text-red-600 dark:text-red-400">{prefsError}</div> : null}
      {prefsSaved ? (
        <div className="text-sm text-green-600 dark:text-green-400">{labels.saved}</div>
      ) : null}
    </div>
  )
}
