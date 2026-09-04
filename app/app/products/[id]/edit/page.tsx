'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import useSWR from 'swr'
import { useI18n } from '@/lib/i18n'
import { useStoredNickname } from '@/lib/use-stored-nickname'

interface Product {
  id: string
  name: string
  description: string | null
  images: string[]
  user: {
    nickname: string
  }
}

export default function EditProductPage() {
  const routeParams = useParams<{ id: string }>()
  const productId = typeof routeParams?.id === 'string' ? routeParams.id : null
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const newImagesRef = useRef<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const router = useRouter()
  const { t } = useI18n()
  const nickname = useStoredNickname()

  const { data: product, error: loadError, isLoading } = useSWR<Product>(
    productId && nickname ? `/api/products/${productId}` : null
  )

  const unauthorized =
    Boolean(loadError) ||
    Boolean(product && nickname && product.user?.nickname !== nickname)

  useEffect(() => {
    if (!product || !nickname || unauthorized) return
    setName(product.name)
    setDescription(product.description || '')
    setExistingImages(Array.isArray(product.images) ? product.images : [])
    newImagesRef.current = []
    setNewPreviews([])
  }, [product, nickname, unauthorized])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    const remaining = 4 - (existingImages.length + newPreviews.length)
    const accepted = files.slice(0, Math.max(0, remaining))

    if (accepted.length < files.length) {
      setFormError(t('newProduct.maxImages'))
    }

    newImagesRef.current = [...newImagesRef.current, ...accepted]

    accepted.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    newImagesRef.current = newImagesRef.current.filter((_, i) => i !== index)
    setNewPreviews(newPreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError(t('newProduct.nameRequired'))
      return
    }

    const totalImages = existingImages.length + newPreviews.length
    if (totalImages === 0) {
      setFormError(t('newProduct.addImage'))
      return
    }

    if (totalImages > 4) {
      setFormError(t('newProduct.maxImages'))
      return
    }

    if (!productId) {
      setFormError(t('newProduct.userNotAuth'))
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('existingImages', JSON.stringify(existingImages))
      newImagesRef.current.forEach((image) => {
        formData.append('images', image)
      })

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        router.push(`/app/products/${productId}`)
      } else {
        setFormError(data.error || t('newProduct.createError'))
      }
    } catch (err) {
      setFormError(t('newProduct.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {isLoading || nickname === null ? (
        <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
      ) : unauthorized || !product ? (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">{t('productDetail.notFound')}</p>
          <Link href="/app" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t('productDetail.backToProducts')}
          </Link>
        </div>
      ) : (
      <>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        {t('common.edit')} {t('newProduct.title')}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md dark:shadow-gray-900">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('newProduct.name')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('newProduct.description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('newProduct.images')}
            </label>
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {existingImages.map((image, index) => (
                  <div key={image} className="relative h-48">
                    <Image
                      src={image}
                      alt={`Existing ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <button
                      type="button"
                      aria-label={t('newProduct.removeImage') || `Eliminar imatge ${index + 1}`}
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newPreviews.map((preview, index) => (
                  <div key={preview} className="relative h-48">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover rounded-lg"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <button
                      type="button"
                      aria-label={t('newProduct.removeImage') || `Eliminar imatge ${index + 1}`}
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {formError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? t('newProduct.publishing') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </form>
      </>
      )}
    </div>
  )
}
