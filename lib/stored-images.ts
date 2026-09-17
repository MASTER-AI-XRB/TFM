import fs from 'fs/promises'
import path from 'path'
import { del } from '@vercel/blob'

function parseImageRefs(images: string): string[] {
  try {
    const parsed = JSON.parse(images)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
  } catch {
    return []
  }
}

export function blobUrlsFromImagesJson(images: string): string[] {
  return parseImageRefs(images).filter(
    (ref) => ref.startsWith('https://') && ref.includes('.blob.vercel-storage.com/')
  )
}

export function localUploadPathsFromImagesJson(images: string): string[] {
  return parseImageRefs(images).filter((ref) => ref.startsWith('/uploads/'))
}

export async function deleteStoredProductImages(images: string): Promise<void> {
  const blobUrls = blobUrlsFromImagesJson(images)
  if (blobUrls.length > 0) {
    try {
      await del(blobUrls)
    } catch {
      // Best-effort: the row must still be deletable if the object is already gone.
    }
  }

  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads')
  await Promise.all(
    localUploadPathsFromImagesJson(images).map(async (rel) => {
      if (rel.includes('..')) return
      const abs = path.resolve(process.cwd(), 'public', rel.replace(/^\/+/, ''))
      if (abs !== uploadsRoot && !abs.startsWith(uploadsRoot + path.sep)) return
      await fs.unlink(abs).catch(() => undefined)
    })
  )
}
