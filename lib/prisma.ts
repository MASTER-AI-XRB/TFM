import { PrismaClient } from '@prisma/client'
import { withPrismaConnectionLimit } from '@/lib/prisma-url'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient

function getPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance
  }

  if (globalThis.prisma) {
    prismaInstance = globalThis.prisma
    return prismaInstance
  }

  try {
    const url = process.env.DATABASE_URL
      ? withPrismaConnectionLimit(
          process.env.DATABASE_URL,
          process.env.NODE_ENV === 'production' ? 1 : 5
        )
      : undefined
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      ...(url ? { datasources: { db: { url } } } : {}),
    })

    if (process.env.NODE_ENV !== 'production') {
      globalThis.prisma = prismaInstance
    }

    return prismaInstance
  } catch (error) {
    console.error('Error creant PrismaClient:', error)
    throw error
  }
}

export const prisma = getPrismaClient()
