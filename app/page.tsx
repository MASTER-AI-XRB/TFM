'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setStoredSession } from '@/lib/client-session'
import { useLogoAmbientAnimation } from '@/lib/useLogoAmbientAnimation'
import AuthLogoBackground from '@/components/auth/AuthLogoBackground'
import AuthLoginForm, { type LoginSuccessData } from '@/components/auth/AuthLoginForm'

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'expanding' | 'complete'>('idle')
  const router = useRouter()

  const {
    backgroundSize,
    scrollY,
    isScrolling,
    logoPosition,
    logoRotation,
    logoScale,
    setLogoPosition,
    setLogoScale,
  } = useLogoAmbientAnimation()

  const handleLoginSuccess = (data: LoginSuccessData) => {
    setIsTransitioning(true)
    setTransitionPhase('expanding')

    const expandDuration = 800
    const expandStartTime = Date.now()
    const startScale = logoScale
    const startX = logoPosition.x
    const startY = logoPosition.y
    const screenDiagonal = Math.sqrt(
      window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight
    )
    const targetScale = screenDiagonal / 300

    const expandAnimate = () => {
      const elapsed = Date.now() - expandStartTime
      const progress = Math.min(elapsed / expandDuration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentScale = startScale + (targetScale - startScale) * easeOut
      const currentX = startX * (1 - easeOut)
      const currentY = startY * (1 - easeOut)

      setLogoScale(currentScale)
      setLogoPosition({ x: currentX, y: currentY })

      if (progress < 1) {
        requestAnimationFrame(expandAnimate)
      } else {
        setStoredSession(data.nickname, data.socketToken)
        router.push('/app')

        setStoredSession(data.nickname, data.socketToken)

        setTimeout(() => {
          setTransitionPhase('complete')

          const shrinkDuration = 600
          const shrinkStartTime = Date.now()
          const shrinkStartScale = currentScale
          const shrinkStartX = currentX
          const shrinkStartY = currentY

          const shrinkAnimate = () => {
            const shrinkElapsed = Date.now() - shrinkStartTime
            const shrinkProgress = Math.min(shrinkElapsed / shrinkDuration, 1)
            const easeIn = shrinkProgress * shrinkProgress

            const shrinkScale = shrinkStartScale * (1 - easeIn)
            const shrinkX = shrinkStartX * (1 - easeIn)
            const shrinkY = shrinkStartY * (1 - easeIn)

            setLogoScale(shrinkScale)
            setLogoPosition({ x: shrinkX, y: shrinkY })

            if (shrinkProgress < 1) {
              requestAnimationFrame(shrinkAnimate)
            } else {
              setIsTransitioning(false)
              router.push('/app')
            }
          }

          requestAnimationFrame(shrinkAnimate)
        }, 300)
      }
    }

    requestAnimationFrame(expandAnimate)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 relative overflow-hidden transition-colors duration-500 ${
        isTransitioning && transitionPhase !== 'complete' ? 'bg-white dark:bg-white' : ''
      }`}
    >
      <AuthLogoBackground
        backgroundSize={backgroundSize}
        scrollY={scrollY}
        isScrolling={isScrolling}
        logoPosition={logoPosition}
        logoRotation={logoRotation}
        logoScale={logoScale}
        isTransitioning={isTransitioning}
      />
      <div
        className={`relative z-10 w-full max-w-md transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <AuthLoginForm onLoginSuccess={handleLoginSuccess} isTransitioning={isTransitioning} />
      </div>
    </div>
  )
}
