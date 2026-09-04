'use client'

import { useRef, useState } from 'react'
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

function validateEditProductForm(
  name: string,
  totalImages: number,
  productId: string | null,
  t: (key: string) => string,
): string | null {
  if (!name.trim()) return t('newProduct.nameRequired')
  if (totalImages === 0) return t('newProduct.addImage')
  if (totalImages > 4) return t('newProduct.maxImages')
  if (!productId) return t('newProduct.userNotAuth')
  return null
}

type EditProductFormProps = {
  productId: string
  name: string
  description: string
  existingImages: string[]
  newPreviews: string[]
  formError: string
  loading: boolean
  t: (key: string) => string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveExistingImage: (index: number) => void
  onRemoveNewImage: (index: number) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

function EditProductForm({
  name,
  description,
  existingImages,
  newPreviews,
  formError,
  loading,
  t,
  onNameChange,
  onDescriptionChange,
  onImageChange,
  onRemoveExistingImage,
  onRemoveNewImage,
  onSubmit,
  onCancel,
}: EditProductFormProps) {
  const hasImages = existingImages.length > 0 || newPreviews.length > 0

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        {t('common.edit')} {t('newProduct.title')}
      </h1>

      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md dark:shadow-gray-900">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('newProduct.name')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
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
              onChange={(e) => onDescriptionChange(e.target.value)}
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
              onChange={onImageChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {hasImages ? (
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
                      onClick={() => onRemoveExistingImage(index)}
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
                      onClick={() => onRemoveNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {formError ? (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {formError}
            </div>
          ) : null}

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
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

function EditProductLoading({ t }: { t: (key: string) => string }) {
  return <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
}

function EditProductNotFound({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700 dark:text-gray-300">{t('productDetail.notFound')}</p>
      <Link href="/app" className="text-blue-600 dark:text-blue-400 hover:underline">
        {t('productDetail.backToProducts')}
      </Link>
    </div>
  )
}

function useEditProductForm(
  product: Product,
  productId: string,
  t: (key: string) => string,
  router: ReturnType<typeof useRouter>,
) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || '')
  const [existingImages, setExistingImages] = useState<string[]>(() =>
    Array.isArray(product.images) ? product.images : []
  )
  const newImagesRef = useRef<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

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
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    newImagesRef.current = newImagesRef.current.filter((_, i) => i !== index)
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const validationError = validateEditProductForm(
      name,
      existingImages.length + newPreviews.length,
      productId,
      t,
    )
    if (validationError) {
      setFormError(validationError)
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
    } catch {
      setFormError(t('newProduct.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  return {
    name,
    description,
    existingImages,
    newPreviews,
    formError,
    loading,
    setName,
    setDescription,
    handleImageChange,
    removeExistingImage,
    removeNewImage,
    handleSubmit,
  }
}

function EditProductEditor({
  product,
  productId,
  t,
  router,
}: {
  product: Product
  productId: string
  t: (key: string) => string
  router: ReturnType<typeof useRouter>
}) {
  const form = useEditProductForm(product, productId, t, router)
  return (
    <EditProductForm
      productId={productId}
      name={form.name}
      description={form.description}
      existingImages={form.existingImages}
      newPreviews={form.newPreviews}
      formError={form.formError}
      loading={form.loading}
      t={t}
      onNameChange={form.setName}
      onDescriptionChange={form.setDescription}
      onImageChange={form.handleImageChange}
      onRemoveExistingImage={form.removeExistingImage}
      onRemoveNewImage={form.removeNewImage}
      onSubmit={form.handleSubmit}
      onCancel={() => router.back()}
    />
  )
}

export default function EditProductPage() {
  const routeParams = useParams<{ id: string }>()
  const productId = typeof routeParams?.id === 'string' ? routeParams.id : null
  const router = useRouter()
  const { t } = useI18n()
  const nickname = useStoredNickname()

  const { data: product, error: loadError, isLoading } = useSWR<Product>(
    productId && nickname ? `/api/products/${productId}` : null
  )

  const unauthorized =
    Boolean(loadError) ||
    Boolean(product && nickname && product.user?.nickname !== nickname)

  let content: React.ReactNode
  if (isLoading || nickname === null) {
    content = <EditProductLoading t={t} />
  } else if (unauthorized || !product || !productId) {
    content = <EditProductNotFound t={t} />
  } else {
    content = (
      <EditProductEditor
        key={product.id}
        product={product}
        productId={productId}
        t={t}
        router={router}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {content}
    </div>
  )
}
