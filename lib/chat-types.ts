export interface ChatMessage {
  id: string
  content: string
  userNickname: string
  createdAt: string
  productId?: string | null
}

export interface ChatProductSummary {
  id: string
  name: string
  images: string[]
  reserved?: boolean
  reservedBy?: { nickname: string } | null
}
