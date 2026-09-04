'use client'

import { useI18n } from '@/lib/i18n'
import { ONBOARDING_OVERLAY_Z } from '@/lib/onboarding-constants'

export type HoleCircle = { x: number; y: number; r: number }
export type HoleBox = { left: number; top: number; width: number; height: number }

type OnboardingOverlayProps = {
  onboardingStep: number
  buttonRect: HoleCircle | null
  stepRect: HoleBox | null
  windowSize: { w: number; h: number }
  onAdvance: () => void
}

export function OnboardingOverlay({
  onboardingStep,
  buttonRect,
  stepRect,
  windowSize,
  onAdvance,
}: OnboardingOverlayProps) {
  const { t } = useI18n()
  const overlayZ = ONBOARDING_OVERLAY_Z

  if (onboardingStep === 0 && buttonRect) {
    return (
      <>
        {/* Pas 0: forat circular a la icona (i); z-[70] per sobre del popup */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: overlayZ,
            background: 'rgba(0,0,0,0.6)',
            maskImage: `radial-gradient(circle at ${buttonRect.x}px ${buttonRect.y}px, transparent ${buttonRect.r}px, black ${buttonRect.r + 1}px)`,
            WebkitMaskImage: `radial-gradient(circle at ${buttonRect.x}px ${buttonRect.y}px, transparent ${buttonRect.r}px, black ${buttonRect.r + 1}px)`,
          }}
          aria-hidden
        />
        <div className="fixed inset-0 w-full h-full" style={{ zIndex: overlayZ, pointerEvents: 'none' }} aria-hidden>
          <div className="absolute bg-transparent" style={{ left: 0, top: 0, width: windowSize.w, height: Math.max(0, buttonRect.y - buttonRect.r), pointerEvents: 'auto' }} />
          <div className="absolute bg-transparent" style={{ left: 0, top: buttonRect.y - buttonRect.r, width: Math.max(0, buttonRect.x - buttonRect.r), height: 2 * buttonRect.r, pointerEvents: 'auto' }} />
          <div className="absolute bg-transparent" style={{ left: buttonRect.x + buttonRect.r, top: buttonRect.y - buttonRect.r, width: Math.max(0, windowSize.w - (buttonRect.x + buttonRect.r)), height: 2 * buttonRect.r, pointerEvents: 'auto' }} />
          <div className="absolute bg-transparent" style={{ left: 0, top: buttonRect.y + buttonRect.r, width: windowSize.w, height: Math.max(0, windowSize.h - (buttonRect.y + buttonRect.r)), pointerEvents: 'auto' }} />
        </div>
        {/* Posició explícita (no transform) perquè l'animació pulse-ring no sobreescrigui el centrat; +2px compensa la vora */}
        <div
          className="fixed rounded-full border-8 border-yellow-500 animate-[pulse-ring_1.5s_ease-in-out_infinite] pointer-events-none"
          style={{
            zIndex: overlayZ + 1,
            left: buttonRect.x - (buttonRect.r + 8) / 2,
            top: buttonRect.y - (buttonRect.r + 8) / 2,
            width: buttonRect.r + 8,
            height: buttonRect.r + 8,
          }}
          aria-hidden
        />
      </>
    )
  }

  if (stepRect) {
    return (
      <>
        {/* Pas ≥1: forat rectangular amb mida del contingut; 4 bandes fosques per sobre del popup (z-[70]) */}
        <div className="fixed inset-0 w-full h-full" style={{ zIndex: overlayZ, pointerEvents: 'none' }}>
          <button
            type="button"
            className="absolute bg-black/60 border-0 p-0"
            style={{ left: 0, top: 0, width: windowSize.w, height: Math.max(0, stepRect.top), pointerEvents: 'auto' }}
            onClick={onAdvance}
            aria-label={t('common.next')}
          />
          <button
            type="button"
            className="absolute bg-black/60 border-0 p-0"
            style={{ left: 0, top: stepRect.top, width: Math.max(0, stepRect.left), height: stepRect.height, pointerEvents: 'auto' }}
            onClick={onAdvance}
            aria-label={t('common.next')}
          />
          <button
            type="button"
            className="absolute bg-black/60 border-0 p-0"
            style={{ left: stepRect.left + stepRect.width, top: stepRect.top, width: Math.max(0, windowSize.w - (stepRect.left + stepRect.width)), height: stepRect.height, pointerEvents: 'auto' }}
            onClick={onAdvance}
            aria-label={t('common.next')}
          />
          <button
            type="button"
            className="absolute bg-black/60 border-0 p-0"
            style={{ left: 0, top: stepRect.top + stepRect.height, width: windowSize.w, height: Math.max(0, windowSize.h - (stepRect.top + stepRect.height)), pointerEvents: 'auto' }}
            onClick={onAdvance}
            aria-label={t('common.next')}
          />
        </div>
        {/* Vora de ressalt al voltant del forat */}
        <div
          className="fixed rounded-md border-2 border-yellow-500 pointer-events-none"
          style={{
            zIndex: overlayZ + 1,
            left: stepRect.left,
            top: stepRect.top,
            width: stepRect.width,
            height: stepRect.height,
          }}
          aria-hidden
        />
      </>
    )
  }

  return null
}
