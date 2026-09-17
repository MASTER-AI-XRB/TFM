import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { apiError, apiOk } from '@/lib/api-response'
import { logError } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token) {
      return apiError('Token de recuperació requerit', 400)
    }

    if (!password) {
      return apiError('La contrasenya és obligatòria', 400)
    }

    if (password.length < 6) {
      return apiError('La contrasenya ha de tenir almenys 6 caràcters', 400)
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return apiError('Token invàlid o expirat', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        sessionVersion: { increment: 1 },
      },
    })
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    return apiOk({
      message: 'Contrasenya restablida correctament',
    })
  } catch (error) {
    logError('Error en reset-password:', error)
    return apiError('Error restablint la contrasenya', 500)
  }
}
