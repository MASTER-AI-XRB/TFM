import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashEmailToken } from '@/lib/email-token'

export type VerifyEmailOutcome = 'ok' | 'taken' | 'invalid'

/**
 * One-shot email confirmation by opaque token (from the verify link).
 * Safe to call from a Route Handler or a Server Component.
 */
export async function verifyEmailToken(rawToken: string): Promise<VerifyEmailOutcome> {
  if (typeof rawToken !== 'string' || !rawToken.trim()) {
    return 'invalid'
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: hashEmailToken(rawToken.trim()),
      emailVerifyTokenExpiry: { gt: new Date() },
    },
  })

  if (!user?.pendingEmail) {
    return 'invalid'
  }

  const occupied = await prisma.user.findUnique({
    where: { email: user.pendingEmail },
  })
  if (occupied && occupied.id !== user.id) {
    return 'taken'
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        emailVerified: new Date(),
        pendingEmail: null,
        emailVerifyToken: null,
        emailVerifyTokenExpiry: null,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'taken'
    }
    throw error
  }

  return 'ok'
}
