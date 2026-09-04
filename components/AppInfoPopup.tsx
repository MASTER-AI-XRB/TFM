'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/lib/i18n'
import { useOnboarding } from '@/lib/onboarding-context'
import {
  DROPDOWN_GAP,
  INFO_PANEL_MAX_WIDTH_PX,
  MOBILE_LEFT_MARGIN,
  ONBOARDING_STEPS,
  RESERVE_DETAIL_STEP,
} from '@/lib/onboarding-constants'
import { markOnboardingSeen, useOnboardingSeen } from '@/lib/use-onboarding-seen'
import { AppInfoPanel } from '@/components/AppInfoPanel'
import { OnboardingOverlay, type HoleBox, type HoleCircle } from '@/components/OnboardingOverlay'
import { ReserveDetailDialog } from '@/components/ReserveDetailDialog'

export function AppInfoPopup() {
  const [open, setOpen] = useState(false)
  const onboardingSeen = useOnboardingSeen()
  const showOnboarding = !onboardingSeen
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [reserveDetailOpen, setReserveDetailOpen] = useState(false)
  const reserveDetailViewedRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [anchorRect, setAnchorRect] = useState<{ bottom: number; right: number } | null>(null)
  const [buttonRect, setButtonRect] = useState<HoleCircle | null>(null)
  const [stepRect, setStepRect] = useState<HoleBox | null>(null)
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const reserveDetailButtonRef = useRef<HTMLButtonElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const { t } = useI18n()
  const { setOnboardingActive } = useOnboarding()

  useEffect(() => {
    setOnboardingActive(showOnboarding)
  }, [showOnboarding, setOnboardingActive])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!showOnboarding) return
    const updateSize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [showOnboarding])

  const updateButtonRect = useCallback(() => {
    const el = buttonRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Només mostrar onboarding quan aquesta instància és visible (evita duplicat desktop/mòbil)
    if (rect.width <= 0 || rect.height <= 0) {
      setButtonRect(null)
      return
    }
    const r = Math.max(rect.width, rect.height) / 2 + 12
    setButtonRect({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      r,
    })
  }, [])

  useEffect(() => {
    if (!showOnboarding) return
    updateButtonRect()
    const ro = new ResizeObserver(updateButtonRect)
    if (buttonRef.current) ro.observe(buttonRef.current)
    window.addEventListener('scroll', updateButtonRect, true)
    window.addEventListener('resize', updateButtonRect)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', updateButtonRect, true)
      window.removeEventListener('resize', updateButtonRect)
    }
  }, [showOnboarding, updateButtonRect])

  // Re-mesurar el botó just abans de pintar l'overlay (pas 0) per centrar forat i cercle
  useLayoutEffect(() => {
    if (showOnboarding && onboardingStep === 0) updateButtonRect()
  }, [showOnboarding, onboardingStep, updateButtonRect])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (showOnboarding && onboardingStep > 0) return
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, showOnboarding, onboardingStep])

  const prevOpenRef = useRef(false)
  useEffect(() => {
    if (prevOpenRef.current && !open && showOnboarding) {
      markOnboardingSeen()
    }
    prevOpenRef.current = open
  }, [open, showOnboarding])

  const handleClosePopup = useCallback(() => {
    setOpen(false)
    setOnboardingStep(0)
    if (showOnboarding) {
      markOnboardingSeen()
    }
  }, [showOnboarding])

  const advanceOnboarding = useCallback(() => {
    if (onboardingStep === RESERVE_DETAIL_STEP && !reserveDetailViewedRef.current) return
    if (onboardingStep < ONBOARDING_STEPS - 1) {
      setOnboardingStep((s) => s + 1)
    } else {
      markOnboardingSeen()
      setOpen(false)
      setOnboardingStep(0)
    }
  }, [onboardingStep])

  const prevReserveDetailOpen = useRef(false)
  useEffect(() => {
    if (
      prevReserveDetailOpen.current &&
      !reserveDetailOpen &&
      showOnboarding &&
      onboardingStep === RESERVE_DETAIL_STEP
    ) {
      reserveDetailViewedRef.current = true
    }
    prevReserveDetailOpen.current = reserveDetailOpen
  }, [reserveDetailOpen, showOnboarding, onboardingStep])

  useLayoutEffect(() => {
    if (!showOnboarding || !open || onboardingStep < 1) {
      setStepRect(null)
      return
    }
    const el =
      onboardingStep === 1
        ? headerRef.current
        : onboardingStep === RESERVE_DETAIL_STEP
          ? reserveDetailButtonRef.current
          : onboardingStep <= 5
            ? stepRefs.current[onboardingStep - 2] ?? null
            : stepRefs.current[onboardingStep - 3] ?? null
    if (!el) {
      setStepRect(null)
      return
    }
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      setStepRect(null)
      return
    }
    const pad = 4
    setStepRect({
      left: Math.max(0, rect.left - pad),
      top: Math.max(0, rect.top - pad),
      width: rect.width + 2 * pad,
      height: rect.height + 2 * pad,
    })
  }, [showOnboarding, open, onboardingStep])

  const showOverlay =
    showOnboarding &&
    typeof document !== 'undefined' &&
    windowSize.w > 0 &&
    windowSize.h > 0 &&
    (onboardingStep === 0 ? !!buttonRect : !!stepRect && open)

  const getPanelStyle = () => {
    if (!anchorRect || typeof window === 'undefined') {
      return typeof window !== 'undefined'
        ? { top: '1rem', right: '1rem', left: '1rem', margin: '0 auto', maxWidth: '22rem' }
        : undefined
    }
    const w = Math.min(window.innerWidth * 0.9, INFO_PANEL_MAX_WIDTH_PX)
    const rightAligned = window.innerWidth - anchorRect.right
    const rightSoLeftMargin = window.innerWidth - MOBILE_LEFT_MARGIN - w
    return {
      top: anchorRect.bottom + DROPDOWN_GAP,
      right: Math.min(rightAligned, rightSoLeftMargin),
    }
  }

  return (
    <div className="relative flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (showOnboarding && onboardingStep === 0 && !open) {
            if (buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect()
              setAnchorRect({ bottom: rect.bottom, right: rect.right })
            }
            setOpen(true)
            setOnboardingStep(1)
            return
          }
          if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            if (isMobile) setAnchorRect({ bottom: rect.bottom, right: rect.right })
            else if (showOnboarding) setAnchorRect({ bottom: rect.bottom, right: rect.right })
          }
          if (open) setAnchorRect(null)
          setOpen((prev) => !prev)
        }}
        className="relative z-[50] p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        title={t('info.title')}
        aria-label={t('info.title')}
        aria-expanded={open}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      {open && (() => {
        const portalPanel = (showOnboarding && typeof document !== 'undefined') || (isMobile && typeof document !== 'undefined' && anchorRect)
        const isFixed = !!portalPanel
        const panelZ = showOnboarding ? 'z-[65]' : 'z-[60]'
        const maxHeightClass = showOnboarding ? 'max-h-[90vh]' : 'max-h-[min(80vh,28rem)]'
        const overflowClass = showOnboarding ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
        const panelContent = (
          <AppInfoPanel
            panelRef={panelRef}
            headerRef={headerRef}
            stepRefs={stepRefs}
            reserveDetailButtonRef={reserveDetailButtonRef}
            showOnboarding={showOnboarding}
            isFixed={isFixed}
            panelZ={panelZ}
            maxHeightClass={maxHeightClass}
            overflowClass={overflowClass}
            style={isFixed ? getPanelStyle() : undefined}
            onAdvance={advanceOnboarding}
            onClose={handleClosePopup}
            onOpenReserveDetail={() => setReserveDetailOpen(true)}
          />
        )
        return portalPanel && typeof document !== 'undefined'
          ? createPortal(panelContent, document.body)
          : panelContent
      })()}
      {/* Overlay d'onboarding després del panell per quedar per sobre (z-[70]) */}
      {typeof document !== 'undefined' &&
        showOverlay &&
        createPortal(
          <OnboardingOverlay
            onboardingStep={onboardingStep}
            buttonRect={buttonRect}
            stepRect={stepRect}
            windowSize={windowSize}
            onAdvance={advanceOnboarding}
          />,
          document.body
        )}
      <ReserveDetailDialog
        open={reserveDetailOpen}
        onClose={() => setReserveDetailOpen(false)}
      />
    </div>
  )
}
