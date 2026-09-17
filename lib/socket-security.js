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

module.exports = {
  isNotifyAuthorized,
  resolveHandshakePrincipal,
}
