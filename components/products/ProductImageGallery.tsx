'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

type Props = {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useI18n()

  if (!images || images.length === 0) {
    return (
      <div className="w-full md:w-1/2">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500">{t('productDetail.noImage')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-1/2">
      <div className="relative">
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 relative">
          <Image
            src={images[currentImageIndex]}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t('productDetail.prevImage') || 'Imatge anterior'}
              onClick={() =>
                setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={t('productDetail.nextImage') || 'Imatge següent'}
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((imageSrc, index) => (
                <button
                  key={imageSrc}
                  type="button"
                  aria-label={`${t('productDetail.goToImage') || 'Anar a la imatge'} ${index + 1}`}
                  aria-current={index === currentImageIndex ? 'true' : undefined}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
