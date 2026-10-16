import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiOk } from '@/lib/api-response'
import { logError } from '@/lib/logger'
import { hashEmailToken } from '@/lib/email-token'

// Forçar que aquesta ruta sigui dinàmica (no es pot pre-renderitzar)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return apiOk({ valid: false })
    }

    // Buscar usuari amb el token vàlid
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashEmailToken(token.trim()),
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    return apiOk({ valid: !!user })
  } catch (error) {
    logError('Error verificant token:', error)
    return apiOk({ valid: false })
  }
}

