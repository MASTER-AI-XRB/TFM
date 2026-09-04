'use client'

import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

type Props = {
  title?: string
}

export function ProductLoanBadge({ title }: Props) {
  const { t } = useI18n()
  const label = title ?? t('products.prestec')
  return (
    <div className="bg-green-500 text-white rounded-full p-2 shadow-md" title={label}>
      <Image
        src="/prestec_on.png"
        alt={label}
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
    </div>
  )
}
