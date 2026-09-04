'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { NAV_ITEMS, NAV_ICON_PATHS } from '@/components/nav-items'

const ITEM_WIDTH = 48

function getCurrentIndex(pathname: string): number {
  const idx = NAV_ITEMS.findIndex((item) => {
    if (item.href === '/app') return pathname === '/app'
    return pathname.startsWith(item.href)
  })
  return idx >= 0 ? idx : 0
}

const SCROLL_THRESHOLD = 2

export function MobileNavCarousel({
  pathname,
  t,
}: {
  pathname: string
  t: (key: string) => string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentIndex = getCurrentIndex(pathname)
  const [canScrollPrev, setCanScrollPrev] = useState(true)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollPrev(scrollLeft > SCROLL_THRESHOLD)
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const targetScroll = currentIndex * ITEM_WIDTH
    el.scrollTo({ left: targetScroll, behavior: 'smooth' })
    const timeoutId = setTimeout(updateScrollState, 400)
    return () => clearTimeout(timeoutId)
  }, [currentIndex, updateScrollState])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  const scrollPrev = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: -ITEM_WIDTH, behavior: 'smooth' })
  }

  const scrollNext = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: ITEM_WIDTH, behavior: 'smooth' })
  }

  return (
    <nav
      className="flex md:hidden flex-1 min-w-0 items-center gap-0 px-0 max-md:landscape:hidden min-w-[88px] w-[88px]"
      aria-label="Navegació mòbil"
    >
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        title={canScrollPrev ? t('common.previous') : undefined}
        className="relative z-30 shrink-0 rounded-lg px-0 py-1.5 sm:py-2 w-[20px] min-h-[44px] flex items-center justify-center overflow-visible touch-manipulation text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:dark:hover:text-gray-400 transition"
        aria-label="Anterior"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="relative z-0 flex shrink-0 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] scrollbar-hide touch-pan-x"
        style={{ width: ITEM_WIDTH, minWidth: ITEM_WIDTH, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/app'
                ? pathname === '/app'
                : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 snap-center items-center justify-center rounded-lg p-2 sm:p-3 transition w-11 h-11 sm:w-12 sm:h-12 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-current={isActive ? 'page' : undefined}
                title={t(item.titleKey)}
                aria-label={t(item.titleKey)}
                style={{ minWidth: ITEM_WIDTH }}
              >
                <svg
                  className={`h-6 w-6 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {NAV_ICON_PATHS[item.icon]}
                </svg>
              </Link>
            )
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        title={canScrollNext ? t('common.next') : undefined}
        className="relative z-20 shrink-0 rounded-lg px-0 py-1.5 sm:py-2 w-[20px] min-h-[44px] flex items-center justify-center overflow-visible touch-manipulation text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:dark:hover:text-gray-400 transition"
        aria-label="Següent"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}
