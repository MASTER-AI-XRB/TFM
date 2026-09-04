'use client'

import useSWRMutation from 'swr/mutation'

type SocketTokenResponse = {
  nickname?: string
  socketToken?: string
  needsNickname?: boolean
}

async function fetchSocketTokenWithRetry(): Promise<SocketTokenResponse> {
  const attempt = async (allowRetry: boolean): Promise<SocketTokenResponse> => {
    const response = await fetch('/api/auth/socket-token', { method: 'POST' })
    if (response.status === 401 && allowRetry) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return attempt(false)
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json().catch(() => ({}))
  }
  return attempt(true)
}

export function useSocketTokenMutation() {
  return useSWRMutation('socket-token', fetchSocketTokenWithRetry)
}
