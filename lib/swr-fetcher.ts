export class SwrFetchError extends Error {
  status: number

  constructor(status: number, message?: string) {
    super(message ?? `HTTP ${status}`)
    this.status = status
  }
}

export async function swrJsonFetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new SwrFetchError(response.status)
  }
  return response.json() as Promise<T>
}

export async function swrPostJsonFetcher<T>(url: string, body?: unknown): Promise<T> {
  return swrJsonFetcher<T>(url, {
    method: 'POST',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}
