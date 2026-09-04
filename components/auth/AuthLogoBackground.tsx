'use client'

import type { LogoPosition } from '@/lib/useLogoAmbientAnimation'

type AuthLogoBackgroundProps = {
  backgroundSize: string
  scrollY: number
  isScrolling: boolean
  logoPosition: LogoPosition
  logoRotation: number
  logoScale: number
  isTransitioning: boolean
}

export default function AuthLogoBackground({
  backgroundSize,
  scrollY,
  isScrolling,
  logoPosition,
  logoRotation,
  logoScale,
  isTransitioning,
}: AuthLogoBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 bg-cover bg-top bg-no-repeat blur-2xl md:blur-3xl transition-transform duration-75 ease-out ${
        isTransitioning ? 'opacity-100' : 'opacity-60 md:opacity-50'
      } ${isTransitioning ? 'z-50' : ''}`}
      style={{
        backgroundImage: 'url(/logo_O.png)',
        backgroundSize,
        transform: isScrolling
          ? `translateY(${scrollY * 2}px) scale(${logoScale}) rotate(${logoRotation}deg)`
          : `translate(${logoPosition.x}px, ${logoPosition.y}px) scale(${logoScale}) rotate(${logoRotation}deg)`,
      }}
    />
  )
}
