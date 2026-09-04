'use client'

import { useCallback, useEffect, useRef } from 'react'
import { logWarn } from '@/lib/client-logger'
import type { ChatProductSummary } from '@/lib/chat-types'

export function useChatConfetti(
  activePrivateChat: string | null,
  activePrivateTab: string | null,
  nickname: string | null,
  privateChatProducts: Record<string, ChatProductSummary[]>
) {
  const confettiFiredForProductRef = useRef<string | null>(null)
  const confettiModuleRef = useRef<((opts?: object) => void) | null>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const getConfettiCanvas = useCallback(() => {
    if (typeof window === 'undefined') return null
    let canvas = confettiCanvasRef.current
    if (!canvas) {
      canvas = document.createElement('canvas')
      confettiCanvasRef.current = canvas
      canvas.style.position = 'fixed'
      canvas.style.left = '0'
      canvas.style.top = '0'
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '9999'
      document.body.appendChild(canvas)
    }
    const w = window.innerWidth
    const h = window.innerHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    return canvas
  }, [])

  useEffect(() => {
    if (!activePrivateChat || !activePrivateTab || activePrivateTab === 'general' || !nickname) {
      if (!activePrivateTab || activePrivateTab === 'general') {
        confettiFiredForProductRef.current = null
      }
      return
    }
    const products = privateChatProducts[activePrivateChat]
    const product = Array.isArray(products) ? products.find((p) => p.id === activePrivateTab) : null
    const reservedByYou = !!product?.reserved && product.reservedBy?.nickname === nickname
    if (!reservedByYou) return
    if (confettiFiredForProductRef.current === activePrivateTab) return
    confettiFiredForProductRef.current = activePrivateTab

    const opts = {
      spread: 120,
      ticks: 100,
      particleCount: 120,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.5 } as const,
    }
    const confettiTimers: ReturnType<typeof setTimeout>[] = []
    const fireConfetti = (confetti: (o: typeof opts & { angle?: number }) => void) => {
      try {
        confetti(opts)
        confettiTimers.push(setTimeout(() => confetti({ ...opts, angle: 60 }), 80))
        confettiTimers.push(setTimeout(() => confetti({ ...opts, angle: 120 }), 160))
      } catch (e) {
        confettiFiredForProductRef.current = null
        logWarn('Confetti error', e)
      }
    }
    const runAfterPaint = () => {
      if (confettiModuleRef.current) {
        fireConfetti(confettiModuleRef.current)
        return
      }
      import('canvas-confetti')
        .then((mod) => {
          const m = mod as {
            default?: (o?: object) => void
            create?: (c?: HTMLCanvasElement, o?: { useWorker?: boolean }) => (o?: object) => void
          }
          const canvas = getConfettiCanvas()
          const fn =
            typeof m.create === 'function' && canvas
              ? m.create(canvas, { useWorker: false })
              : (m.default ?? (m as unknown as (o?: object) => void))
          fireConfetti(fn)
        })
        .catch((err) => {
          confettiFiredForProductRef.current = null
          logWarn('Confetti no disponible', err)
        })
    }
    const paintTimer = setTimeout(runAfterPaint, 200)
    return () => {
      clearTimeout(paintTimer)
      confettiTimers.forEach(clearTimeout)
    }
  }, [activePrivateChat, activePrivateTab, nickname, privateChatProducts, getConfettiCanvas])

  useEffect(() => {
    if (typeof window === 'undefined') return
    import('canvas-confetti')
      .then((mod) => {
        const m = mod as {
          default?: (o?: object) => void
          create?: (canvas?: HTMLCanvasElement, opts?: { useWorker?: boolean }) => (o?: object) => void
        }
        const create = m.create
        if (typeof create === 'function') {
          const canvas = getConfettiCanvas()
          confettiModuleRef.current = canvas
            ? create(canvas, { useWorker: false })
            : (m.default ?? (m as unknown as (o?: object) => void))
        } else {
          confettiModuleRef.current = m.default ?? (m as unknown as (o?: object) => void)
        }
      })
      .catch(() => {})
  }, [getConfettiCanvas])
}
