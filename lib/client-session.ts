const isBrowser = typeof window !== 'undefined'

export const SESSION_CHANGE_EVENT = 'xarxa-session-change'
export const PUSH_PERMISSION_GRANTED_EVENT = 'xarxa-push-permission-granted'

/** Token de socket només en memòria (no localStorage → XSS no el pot llegir del storage). */
let memorySocketToken: string | null = null

export function notifyStoredSessionChange() {
  if (!isBrowser) return
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT))
}

export const getStoredNickname = () =>
  isBrowser ? window.localStorage.getItem('nickname') : null

export const getStoredSocketToken = () => memorySocketToken

/** El token viu només en memòria: després d’un refresh cal esperar el POST socket-token. */
export function hasSocketCredentials(
  nickname: string | null,
  socketToken: string | null
): socketToken is string {
  return Boolean(nickname && socketToken)
}

export const setStoredSession = (nickname: string, socketToken?: string | null) => {
  if (!isBrowser) return
  window.localStorage.setItem('nickname', nickname)
  if (socketToken !== undefined) {
    memorySocketToken = socketToken
  }
  // Neteja residual d’instal·lacions antigues
  window.localStorage.removeItem('socketToken')
  notifyStoredSessionChange()
}

export const clearStoredSession = () => {
  if (!isBrowser) return
  window.localStorage.removeItem('nickname')
  window.localStorage.removeItem('socketToken')
  memorySocketToken = null
  notifyStoredSessionChange()
}

const VIEW_MODE_KEY = 'xarxa_products_view_mode'

export type ViewMode = 'grid' | 'list'

export const getStoredViewMode = (): ViewMode => {
  if (!isBrowser) return 'list'
  const v = window.localStorage.getItem(VIEW_MODE_KEY)
  return v === 'grid' || v === 'list' ? v : 'list'
}

export const setStoredViewMode = (mode: ViewMode) => {
  if (!isBrowser) return
  window.localStorage.setItem(VIEW_MODE_KEY, mode)
  window.dispatchEvent(new Event('xarxa-view-mode-change'))
}
