'use client'

import { useEffect } from 'react'
import type { KeyedMutator } from 'swr'
import type { ListProduct } from '@/lib/product-list-types'

type ProductStateDetail = {
  productId?: string
  reserved?: boolean
  reservedBy?: { nickname: string } | null
  prestec?: boolean
}

/**
 * Sincronitza llista SWR amb esdeveniments `product-state` del socket.
 */
export function useProductStateSync(mutate: KeyedMutator<ListProduct[]>) {
  useEffect(() => {
    const onProductState = (e: Event) => {
      const { productId, reserved, reservedBy, prestec } =
        (e as CustomEvent<ProductStateDetail>).detail || {}
      if (!productId) return
      void mutate(
        (current) =>
          current?.map((p) =>
            p.id !== productId
              ? p
              : {
                  ...p,
                  ...(typeof reserved === 'boolean' && {
                    reserved,
                    reservedBy: reservedBy ?? null,
                  }),
                  ...(typeof prestec === 'boolean' && { prestec }),
                }
          ),
        { revalidate: false }
      )
    }
    window.addEventListener('product-state', onProductState)
    return () => window.removeEventListener('product-state', onProductState)
  }, [mutate])
}
