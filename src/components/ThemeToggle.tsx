import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { useStore } from '../store/useStore'

export function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  // Keeps following the system until the visitor makes a choice.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const follow = () => {
      try {
        if (localStorage.getItem('muashir-theme')) return
      } catch {
        // No saved choice can be read, so follow the system.
      }
      setTheme(media.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', follow)
    return () => media.removeEventListener('change', follow)
  }, [setTheme])

  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
      aria-label={t(dark ? 'theme.toLight' : 'theme.toDark')}
      className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
