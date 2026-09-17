import { describe, expect, it } from 'vitest'
import {
  blobUrlsFromImagesJson,
  localUploadPathsFromImagesJson,
} from '@/lib/stored-images'

describe('stored image refs', () => {
  it('extreu URLs públiques de Blob i rutes /uploads', () => {
    const images = JSON.stringify([
      'https://abc.public.blob.vercel-storage.com/file.png',
      '/uploads/local.jpg',
      'https://example.com/not-blob.png',
    ])
    expect(blobUrlsFromImagesJson(images)).toEqual([
      'https://abc.public.blob.vercel-storage.com/file.png',
    ])
    expect(localUploadPathsFromImagesJson(images)).toEqual(['/uploads/local.jpg'])
  })

  it('retorna llistes buides si el JSON no és un array', () => {
    expect(blobUrlsFromImagesJson('not-json')).toEqual([])
    expect(localUploadPathsFromImagesJson('{}')).toEqual([])
  })
})
