import { describe, expect, it } from 'vitest'
import {
  ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING,
  isGoogleProfileAllowed,
} from '@/lib/google-signin-policy'

describe('Google sign-in policy', () => {
  it('no permet el linking per email sense verificació', () => {
    expect(ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING).toBe(false)
  })

  it('rebutja un perfil de Google amb email no verificat', () => {
    expect(isGoogleProfileAllowed({ email_verified: false })).toBe(false)
  })

  it('accepta un perfil de Google verificat', () => {
    expect(isGoogleProfileAllowed({ email_verified: true })).toBe(true)
  })
})
