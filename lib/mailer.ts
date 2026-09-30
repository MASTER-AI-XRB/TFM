import nodemailer from 'nodemailer'
import { logError, logInfo } from '@/lib/logger'

function getEmailTransporter() {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass',
    },
  })
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  )
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendVerificationEmail(
  to: string,
  nickname: string,
  rawToken: string
): Promise<void> {
  const verifyUrl = `${appBaseUrl()}/verify-email/${rawToken}`

  try {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await getEmailTransporter().sendMail({
        from: process.env.EMAIL_FROM || 'noreply@xarxanglesola.com',
        to,
        subject: 'Verifica el teu email - Xarxa Anglesola',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verifica el teu email</h2>
            <p>Hola ${escapeHtml(nickname)},</p>
            <p>Confirma la teva adreça per completar el registre. Fes clic a l'enllaç:</p>
            <p style="margin: 20px 0;">
              <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verificar email
              </a>
            </p>
            <p>O copia i enganxa aquest enllaç al teu navegador:</p>
            <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Aquest enllaç expira en 24 hores. Si no t'has registrat, ignora aquest email.
            </p>
          </div>
        `,
        text: `Verifica el teu email - Xarxa Anglesola

Hola ${nickname},

Confirma la teva adreça: ${verifyUrl}

Aquest enllaç expira en 24 hores.`,
      })
    } else if (process.env.NODE_ENV === 'development') {
      logInfo('🔗 Enllaç de verificació d\'email:', verifyUrl)
    } else {
      logError('EMAIL_HOST/USER/PASS no configurats: no s\'ha enviat la verificació')
    }
  } catch (emailError) {
    logError('Error enviant email de verificació:', emailError)
    if (process.env.NODE_ENV === 'development') {
      logInfo('⚠️  Mode desenvolupament: Email de verificació no enviat. URL:', verifyUrl)
      return
    }
    throw emailError
  }
}
