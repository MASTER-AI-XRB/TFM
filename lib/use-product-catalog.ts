'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import { useStoredNickname } from '@/lib/use-stored-nickname'
import { useProductStateSync } from '@/lib/use-product-state-sync'
import { logError, logInfo } from '@/lib/client-logger'
import {
  canReserveProduct,
  canUnreserveProduct,
} from '@/lib/product-fillets'
import type { ListProduct } from '@/lib/product-list-types'

export type ProductFilters = {
  name: string
  user: string
  dateFrom: string
  dateTo: string
}

const emptyFilters: ProductFilters = {
  name: '',
  user: '',
  dateFrom: '',
  dateTo: '',
}

export function useProductCatalog() {
  const [filteredProducts, setFilteredProducts] = useState<ListProduct[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<ProductFilters>(emptyFilters)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const nickname = useStoredNickname()
  const { t } = useI18n()

  const {
    data: products = [],
    isLoading: loading,
    mutate: mutateProducts,
  } = useSWR<ListProduct[]>(nickname ? '/api/products' : null, {
    revalidateOnFocus: true,
  })

  const { data: favoriteProducts = [], mutate: mutateFavorites } = useSWR<ListProduct[]>(
    nickname ? '/api/favorites' : null,
    { revalidateOnFocus: true }
  )

  useEffect(() => {
    setFavorites(new Set(favoriteProducts.map((p) => p.id)))
  }, [favoriteProducts])

  useProductStateSync(mutateProducts)

  const refreshProducts = () => {
    void mutateProducts(undefined, { revalidate: true })
    void mutateFavorites(undefined, { revalidate: true })
  }

  useEffect(() => {
    let filtered = [...products]

    if (filters.name) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.name.toLowerCase())
      )
    }

    if (filters.user) {
      filtered = filtered.filter((product) =>
        product.user.nickname.toLowerCase().includes(filters.user.toLowerCase())
      )
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom)
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.createdAt)
        return productDate >= dateFrom
      })
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.createdAt)
        return productDate <= dateTo
      })
    }

    setFilteredProducts(filtered)
  }, [filters, products])

  const toggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isFavorite = favorites.has(productId)
    logInfo(`Toggle favorite per producte ${productId}, actualment és favorit: ${isFavorite}`)

    const prevFavorites = new Set(favorites)
    setFavorites((prev) => {
      const next = new Set(prev)
      if (isFavorite) next.delete(productId)
      else next.add(productId)
      return next
    })

    try {
      const response = isFavorite
        ? await fetch('/api/favorites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          })
        : await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          })

      const responseData = await response.json()
      if (!response.ok) {
        setFavorites(prevFavorites)
        logError(`Error ${isFavorite ? 'eliminant' : 'afegint'} preferit:`, responseData)
        alert(`Error: ${responseData.error || 'Error desconegut'}`)
      } else {
        void mutateFavorites(undefined, { revalidate: true })
      }
    } catch (error) {
      setFavorites(prevFavorites)
      logError('Error actualitzant preferit:', error)
      alert('Error de connexió. Torna-ho a intentar.')
    }
  }

  const toggleReserved = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const product = products.find((p) => p.id === productId)
    if (!product || (!canReserveProduct(product, nickname) && !canUnreserveProduct(product, nickname)))
      return
    const nextReserved = !product.reserved

    void mutateProducts(
      (prev) =>
        prev?.map((p) =>
          p.id === productId
            ? {
                ...p,
                reserved: nextReserved,
                reservedBy: nextReserved && nickname ? { nickname } : null,
              }
            : p
        ),
      { revalidate: false }
    )

    try {
      const response = await fetch(`/api/products/${productId}/reserve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserved: nextReserved }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        logError('Error actualitzant reserva:', data)
        void mutateProducts(
          (prev) =>
            prev?.map((p) =>
              p.id === productId
                ? { ...p, reserved: product.reserved, reservedBy: product.reservedBy }
                : p
            ),
          { revalidate: false }
        )
      }
    } catch (error) {
      logError('Error actualitzant reserva:', error)
      void mutateProducts(
        (prev) =>
          prev?.map((p) =>
            p.id === productId
              ? { ...p, reserved: product.reserved, reservedBy: product.reservedBy }
              : p
          ),
        { revalidate: false }
      )
    }
  }

  const togglePrestec = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const product = products.find((p) => p.id === productId)
    if (!product || product.user.nickname !== nickname) return

    try {
      const response = await fetch(`/api/products/${productId}/loan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestec: !product.prestec }),
      })
      if (response.ok) {
        await refreshProducts()
      }
    } catch (error) {
      logError('Error actualitzant préstec:', error)
    }
  }

  const deleteProduct = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(t('products.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        void mutateProducts(
          (prev) => prev?.filter((p) => p.id !== productId),
          { revalidate: false }
        )
      }
    } catch (error) {
      logError('Error eliminant producte:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters(emptyFilters)
  }

  return {
    products,
    filteredProducts,
    favorites,
    filters,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    nickname,
    loading,
    refreshProducts,
    handleFilterChange,
    clearFilters,
    toggleFavorite,
    toggleReserved,
    togglePrestec,
    deleteProduct,
  }
}
