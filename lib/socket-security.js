'use strict'

const crypto = require('crypto')

function firstString(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

function isNotifyAuthorized(notifySecret, requestToken) {
  const secret = typeof notifySecret === 'string' ? notifySecret : ''
  const token = firstString(requestToken) || ''
  if (!secret || !token) return false
  const secretBuf = Buffer.from(secret)
  const tokenBuf = Buffer.from(token)
  if (secretBuf.length !== tokenBuf.length) return false
  return crypto.timingSafeEqual(secretBuf, tokenBuf)
}

function resolveHandshakePrincipal({ tokenUserId, tokenNickname, query, nodeEnv }) {
  let userId = tokenUserId || null
  let nickname = tokenNickname || null
  if ((!userId || !nickname) && nodeEnv === 'development') {
    const q = query || {}
    userId = userId || firstString(q.userId)
    nickname = nickname || firstString(q.nickname)
  }
  return { userId, nickname }
}

function resolvePushActionUrl(rawUrl, appOrigin) {
  const fallbackPath = '/app'
  const raw = typeof rawUrl === 'string' ? rawUrl.trim() : ''
  const origin =
    typeof appOrigin === 'string' && appOrigin ? appOrigin.replace(/\/$/, '') : null
  const fallback = origin ? origin + fallbackPath : fallbackPath

  if (!raw || raw.startsWith('//')) return fallback

  if (raw.startsWith('/')) {
    return origin ? origin + raw : raw
  }

  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback
    if (!origin || parsed.origin !== origin) return fallback
    return parsed.origin + parsed.pathname + parsed.search + parsed.hash
  } catch {
    return fallback
  }
}

module.exports = {
  isNotifyAuthorized,
  resolveHandshakePrincipal,
  resolvePushActionUrl,
}
