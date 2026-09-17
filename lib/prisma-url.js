'use strict'

function withPrismaConnectionLimit(databaseUrl, limit) {
  if (!databaseUrl || typeof databaseUrl !== 'string') return databaseUrl
  if (/[?&]connection_limit=/.test(databaseUrl)) return databaseUrl
  const n = Number(limit)
  const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
  return databaseUrl + (databaseUrl.includes('?') ? '&' : '?') + 'connection_limit=' + safe
}

module.exports = { withPrismaConnectionLimit }
