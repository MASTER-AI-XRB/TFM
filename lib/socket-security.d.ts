export function isNotifyAuthorized(
  notifySecret?: string | null,
  requestToken?: string | string[] | null
): boolean

export function resolveHandshakePrincipal(input: {
  tokenUserId?: string | null
  tokenNickname?: string | null
  query?: Record<string, unknown>
  nodeEnv?: string
}): { userId: string | null; nickname: string | null }
