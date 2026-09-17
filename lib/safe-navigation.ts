export function sameOriginPath(url: string, origin: string): string {
  if (!url) return '/app'
  if (url.startsWith('/') && !url.startsWith('//')) return url
  try {
    const parsed = new URL(url, origin)
    if (parsed.origin !== origin) return '/app'
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/app'
  } catch {
    return '/app'
  }
}
