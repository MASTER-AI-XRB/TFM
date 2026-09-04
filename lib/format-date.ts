/** Format de data estable (sense locale del navegador → sense mismatch d’hidratació). */

const MONTHS_CA_SHORT = [
  'gen.',
  'febr.',
  'març',
  'abr.',
  'maig',
  'juny',
  'jul.',
  'ag.',
  'set.',
  'oct.',
  'nov.',
  'des.',
] as const

const MONTHS_CA_LONG = [
  'gener',
  'febrer',
  'març',
  'abril',
  'maig',
  'juny',
  'juliol',
  'agost',
  'setembre',
  'octubre',
  'novembre',
  'desembre',
] as const

function partsFromIso(value: string | Date): { day: number; month: number; year: number } | null {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth(),
    year: d.getUTCFullYear(),
  }
}

/** Ex.: 4 set. 2026 */
export function formatDateShortCa(value: string | Date): string {
  const p = partsFromIso(value)
  if (!p) return ''
  return `${p.day} ${MONTHS_CA_SHORT[p.month]} ${p.year}`
}

/** Ex.: 4 de setembre de 2026 */
export function formatDateLongCa(value: string | Date): string {
  const p = partsFromIso(value)
  if (!p) return ''
  return `${p.day} de ${MONTHS_CA_LONG[p.month]} de ${p.year}`
}

/** Data fixa per a pàgines legals (evita `new Date()` al render). */
export const LEGAL_LAST_UPDATED_LABEL = '4 de setembre de 2026'
