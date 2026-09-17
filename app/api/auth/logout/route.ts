import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { expireAuthCookies, nextAuthSessionTokenFromRequest } from '@/lib/auth-cookies'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true })
  expireAuthCookies(response)
  const sessionToken = nextAuthSessionTokenFromRequest(request)
  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    })
  }
  return response
}
