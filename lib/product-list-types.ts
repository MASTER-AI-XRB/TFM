export type ListProduct = {
  id: string
  name: string
  description: string | null
  images: string[]
  reserved: boolean
  reservedBy: { nickname: string } | null
  prestec: boolean
  user: { nickname: string }
  createdAt: string
  favoritesCount?: number
}
