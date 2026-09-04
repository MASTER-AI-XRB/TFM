export type FilletProduct = {
  reserved: boolean
  reservedBy: { nickname: string } | null
  prestec?: boolean
  user: { nickname: string }
}

export function isReservedByOwner(p: FilletProduct): boolean {
  return !!p.reserved && p.reservedBy?.nickname === p.user.nickname
}

/** Filet blau del titular: mateix criteri que isReservedByOwner. */
export const showOwnerReservedFillet = isReservedByOwner

export function isProductOwner(
  p: FilletProduct,
  nickname: string | null | undefined
): boolean {
  return !!nickname && nickname === p.user.nickname
}

export function showDmFillet(
  p: FilletProduct,
  nickname: string | null | undefined
): boolean {
  return (
    !!nickname &&
    !!p.reserved &&
    p.reservedBy?.nickname === nickname &&
    p.reservedBy?.nickname !== p.user.nickname
  )
}

export function getFilletClass(
  p: FilletProduct,
  nickname: string | null | undefined
): string {
  const owner = isProductOwner(p, nickname)
  if (p.prestec && owner) return 'border-[6px] border-green-500'
  if (isReservedByOwner(p) && owner) return 'border-[6px] border-blue-500'
  if (showDmFillet(p, nickname)) return 'border-[6px] border-yellow-500'
  return ''
}

export function getFilletBoxShadow(
  p: FilletProduct,
  nickname: string | null | undefined
): string {
  const owner = isProductOwner(p, nickname)
  if (p.prestec && owner) return 'inset 0 0 0 6px #22c55e'
  if (isReservedByOwner(p) && owner) return 'inset 0 0 0 6px #3b82f6'
  if (showDmFillet(p, nickname)) return 'inset 0 0 0 6px #eab308'
  return ''
}

export function canReserveProduct(
  p: FilletProduct,
  nickname: string | null | undefined
): boolean {
  return nickname === p.user.nickname && !p.reserved
}

export function canUnreserveProduct(
  p: FilletProduct,
  nickname: string | null | undefined
): boolean {
  return (
    !!p.reserved &&
    (nickname === (p.reservedBy?.nickname ?? '') ||
      (nickname === p.user.nickname && !p.reservedBy))
  )
}
