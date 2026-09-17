import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'
import { apiError, apiOk } from '@/lib/api-response'
import { logError } from '@/lib/logger'
import { mapTruthy } from '@/lib/map-truthy'

export const dynamic = 'force-dynamic'

const parseList = (value?: string | null): string[] =>
  value ? mapTruthy(value.split(','), (item) => item.trim()) : []

const normalizeList = (items: string[], maxItems: number, maxLength: number) => {
  const normalized = mapTruthy(items, (item) => item.trim().slice(0, maxLength))
  return normalized.slice(0, maxItems)
}

export async function GET(request: NextRequest) {
  try {
    const authUserId = await getAuthUserId(request)
    if (!authUserId) {
      return apiError('Usuari no autenticat', 401)
    }

    const existing = await prisma.notificationPreference.findUnique({
      where: { userId: authUserId },
    })

    if (!existing) {
      return apiOk({
        receiveAll: true,
        allowedNicknames: [],
        allowedProductKeywords: [],
        enabledTypes: [],
      })
    }

    return apiOk({
      receiveAll: existing.receiveAll,
      allowedNicknames: existing.allowedNicknames ? JSON.parse(existing.allowedNicknames) : [],
      allowedProductKeywords: existing.allowedProductKeywords
        ? JSON.parse(existing.allowedProductKeywords)
        : [],
      enabledTypes: existing.enabledTypes ? JSON.parse(existing.enabledTypes) : [],
    })
  } catch (error) {
    logError('Error carregant preferències de notificació:', error)
    return apiError('Error carregant preferències de notificació', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { receiveAll, allowedNicknames, allowedProductKeywords, enabledTypes } =
      await request.json()
    const authUserId = await getAuthUserId(request)

    if (!authUserId) {
      return apiError('Usuari no autenticat', 401)
    }

    const nicknamesRaw = Array.isArray(allowedNicknames)
      ? allowedNicknames
      : parseList(allowedNicknames)
    const keywordsRaw = Array.isArray(allowedProductKeywords)
      ? allowedProductKeywords
      : parseList(allowedProductKeywords)
    const typesRaw = Array.isArray(enabledTypes) ? enabledTypes : parseList(enabledTypes)

    const nicknames = normalizeList(nicknamesRaw, 25, 20)
    const keywords = normalizeList(keywordsRaw, 25, 50)
    const types = normalizeList(typesRaw, 25, 30)

    const saved = await prisma.notificationPreference.upsert({
      where: { userId: authUserId },
      create: {
        userId: authUserId,
        receiveAll: receiveAll !== false,
        allowedNicknames: JSON.stringify(nicknames),
        allowedProductKeywords: JSON.stringify(keywords),
        enabledTypes: JSON.stringify(types),
      },
      update: {
        receiveAll: receiveAll !== false,
        allowedNicknames: JSON.stringify(nicknames),
        allowedProductKeywords: JSON.stringify(keywords),
        enabledTypes: JSON.stringify(types),
      },
    })

    return apiOk({
      receiveAll: saved.receiveAll,
      allowedNicknames: nicknames,
      allowedProductKeywords: keywords,
      enabledTypes: types,
    })
  } catch (error) {
    logError('Error guardant preferències de notificació:', error)
    return apiError('Error guardant preferències de notificació', 500)
  }
}
