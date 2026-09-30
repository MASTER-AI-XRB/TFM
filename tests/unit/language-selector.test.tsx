import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '@/components/LanguageSelector'
import { I18nProvider } from '@/lib/i18n'
import { ThemeProvider } from '@/lib/theme'

vi.mock('next/image', () => ({
  default: function MockImage(props: { alt?: string }) {
    return <img alt={props.alt || ''} />
  },
}))

function renderLoginSelector() {
  return render(
    <I18nProvider>
      <ThemeProvider>
        <LanguageSelector forceMobile />
      </ThemeProvider>
    </I18nProvider>
  )
}

describe('LanguageSelector al login (forceMobile)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('max-width: 768px') ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }),
    })
    localStorage.clear()
  })

  it('obre el menú al cos de la pàgina i deixa canviar d’idioma en escriptori', async () => {
    const user = userEvent.setup()
    renderLoginSelector()

    await user.click(screen.getByTitle('Català'))

    const menu = await screen.findByRole('menu')
    expect(menu.parentElement).toBe(document.body)

    await user.click(screen.getByRole('menuitem', { name: 'Español' }))
    expect(localStorage.getItem('locale')).toBe('es')
  })
})
