export const ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING = false

export function isGoogleProfileAllowed(
  profile?: { email_verified?: boolean } | null
): boolean {
  if (!profile) return false
  return profile.email_verified !== false
}
