export const ONBOARDING_KEY = 'xarxa-onboarding-seen'
export const ONBOARDING_CHANGE_EVENT = 'xarxa-onboarding-change'

export const USE_CASE_KEYS = [
  'products',
  'favorites',
  'myProducts',
  'reserve',
  'chat',
  'notifications',
  'settings',
] as const

/** Pas extra entre reserva i xat: obliga a obrir "Més detalls" de reserves */
export const RESERVE_DETAIL_STEP = 6
/** Passos: 0 = icona, 1 = titular, 2..5 = productes..reserva, 6 = Més detalls, 7..9 = xat..configuració */
export const ONBOARDING_STEPS = 1 + 1 + USE_CASE_KEYS.length + 1 // icon + header + 7 seccions + 1 pas "Més detalls"

export const DROPDOWN_GAP = 4
export const MOBILE_LEFT_MARGIN = 8 // 0.5rem, marge mínim per no tallar per l'esquerra
export const INFO_PANEL_MAX_WIDTH_PX = 352 // 22rem
export const ONBOARDING_OVERLAY_Z = 70
