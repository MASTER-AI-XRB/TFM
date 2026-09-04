'use client'

import { useState, useEffect } from 'react'

export type LogoPosition = { x: number; y: number }

/**
 * Ambient logo animation for the landing page:
 * resize background size, scroll parallax, wandering motion + rotation, and random scale pulses.
 * Login expand/shrink transitions stay in the page and override logoScale / logoPosition.
 */
export function useLogoAmbientAnimation() {
  const [backgroundSize, setBackgroundSize] = useState('80%')
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [logoPosition, setLogoPosition] = useState<LogoPosition>({ x: 0, y: 0 })
  const [logoRotation, setLogoRotation] = useState(0)
  const [logoScale, setLogoScale] = useState(1)

  useEffect(() => {
    const updateBackgroundSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setBackgroundSize('90%')
      } else {
        setBackgroundSize('60%')
      }
    }

    updateBackgroundSize()
    window.addEventListener('resize', updateBackgroundSize)
    return () => window.removeEventListener('resize', updateBackgroundSize)
  }, [])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsScrolling(true)

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 1000)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  useEffect(() => {
    if (isScrolling) {
      setLogoPosition({ x: 0, y: 0 })
      return
    }

    let animationFrameId: number
    let currentX = 0
    let currentY = 0
    let currentRotation = 0
    let velocityX = 0
    let velocityY = 0
    let targetVelocityX = 0
    let targetVelocityY = 0
    let lastDirectionChange = Date.now()

    const baseSpeed = 2
    const accelerationRate = 0.03
    const directionChangeInterval = 2000 + Math.random() * 3000
    const maxPosition = 80
    const rotationSpeed = 0.05
    const maxAngleChange = 120

    const getCurrentAngle = () => {
      if (velocityX === 0 && velocityY === 0) return null
      return Math.atan2(velocityY, velocityX)
    }

    const generateNewDirection = (currentAngle: number | null) => {
      let angle: number

      if (currentAngle !== null) {
        const currentAngleDegrees = currentAngle * (180 / Math.PI)
        const angleChange = (Math.random() - 0.5) * 2 * maxAngleChange
        const newAngleDegrees = currentAngleDegrees + angleChange
        angle = newAngleDegrees * (Math.PI / 180)
      } else {
        angle = Math.random() * Math.PI * 2
      }

      const speed = baseSpeed * (0.7 + Math.random() * 0.6)
      return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      }
    }

    const animate = () => {
      const now = Date.now()

      currentRotation += rotationSpeed
      if (currentRotation >= 360) currentRotation -= 360
      setLogoRotation(currentRotation)

      if (now - lastDirectionChange > directionChangeInterval) {
        const currentAngle = getCurrentAngle()
        const newDir = generateNewDirection(currentAngle)
        targetVelocityX = newDir.x
        targetVelocityY = newDir.y
        lastDirectionChange = now
      }

      velocityX += (targetVelocityX - velocityX) * accelerationRate
      velocityY += (targetVelocityY - velocityY) * accelerationRate

      currentX += velocityX
      currentY += velocityY

      if (Math.abs(currentX) > maxPosition) {
        velocityX *= -0.6
        currentX = Math.sign(currentX) * maxPosition
        const currentAngle = getCurrentAngle()
        const newDir = generateNewDirection(currentAngle)
        targetVelocityX = newDir.x
        targetVelocityY = newDir.y
        lastDirectionChange = now
      }

      if (Math.abs(currentY) > maxPosition) {
        velocityY *= -0.6
        currentY = Math.sign(currentY) * maxPosition
        const currentAngle = getCurrentAngle()
        const newDir = generateNewDirection(currentAngle)
        targetVelocityX = newDir.x
        targetVelocityY = newDir.y
        lastDirectionChange = now
      }

      setLogoPosition({ x: currentX, y: currentY })
      animationFrameId = requestAnimationFrame(animate)
    }

    const initialDir = generateNewDirection(null)
    targetVelocityX = initialDir.x
    targetVelocityY = initialDir.y
    velocityX = initialDir.x
    velocityY = initialDir.y

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [isScrolling])

  useEffect(() => {
    if (isScrolling) {
      setLogoScale(1)
      return
    }

    let animationFrameId: number
    let timeoutId: NodeJS.Timeout
    let currentScale = 1
    let isScaling = false
    let startTime = 0

    const scaleUpDuration = 1500
    const scaleDownDuration = 1500
    const holdDuration = 2000
    const minScale = 1.1
    const maxScale = 2.5
    const minDelay = 3000
    const maxDelay = 6000

    const startScaleChange = () => {
      const targetScale = minScale + Math.random() * (maxScale - minScale)
      const startScale = currentScale
      isScaling = true
      startTime = Date.now()

      const animate = () => {
        if (!isScaling) return

        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / scaleUpDuration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 2)

        currentScale = startScale + (targetScale - startScale) * easeOut
        setLogoScale(currentScale)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        } else {
          currentScale = targetScale
          setLogoScale(currentScale)

          timeoutId = setTimeout(() => {
            const returnStartTime = Date.now()
            const returnStartScale = currentScale

            const returnAnimate = () => {
              const returnElapsed = Date.now() - returnStartTime
              const returnProgress = Math.min(returnElapsed / scaleDownDuration, 1)
              const easeIn = returnProgress * returnProgress

              currentScale = returnStartScale + (1 - returnStartScale) * easeIn
              setLogoScale(currentScale)

              if (returnProgress < 1) {
                animationFrameId = requestAnimationFrame(returnAnimate)
              } else {
                isScaling = false
                currentScale = 1
                setLogoScale(1)

                const nextScaleDelay = minDelay + Math.random() * (maxDelay - minDelay)
                timeoutId = setTimeout(() => {
                  startScaleChange()
                }, nextScaleDelay)
              }
            }

            animationFrameId = requestAnimationFrame(returnAnimate)
          }, holdDuration)
        }
      }

      animate()
    }

    timeoutId = setTimeout(() => {
      startScaleChange()
    }, 3000)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isMobile, isScrolling])

  return {
    backgroundSize,
    scrollY,
    isScrolling,
    logoPosition,
    logoRotation,
    logoScale,
    setLogoPosition,
    setLogoScale,
  }
}
