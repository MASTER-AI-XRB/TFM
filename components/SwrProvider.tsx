'use client'

import { SWRConfig } from 'swr'
import { swrJsonFetcher } from '@/lib/swr-fetcher'

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrJsonFetcher,
        revalidateOnFocus: true,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
