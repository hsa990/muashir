import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, BookOpen, Flame, House, TrendingUp, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'
import { LanguageSwitch } from './LanguageSwitch'
import { ThemeToggle } from './ThemeToggle'

const TABS: { to: string; key: string; icon: LucideIcon }[] = [
  { to: '/', key: 'overview', icon: House },
  { to: '/check', key: 'check', icon: Flame },
  { to: '/trend', key: 'trend', icon: TrendingUp },
  { to: '/signs', key: 'signs', icon: Activity },
  { to: '/method', key: 'method', icon: BookOpen },
]

/** Pill tabs in the top bar on wide screens, and an app-style dock on phones. */
function NavTabs({ dock = false }: { dock?: boolean }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState({ x: 0, width: 0 })

  const measure = useCallback(() => {
    const tab = tabRefs.current[pathname]
    if (tab) setPill({ x: tab.offsetLeft, width: tab.offsetWidth })
  }, [pathname])

  useLayoutEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    if (navRef.current) observer.observe(navRef.current)
    document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [measure, i18n.language])

  return (
    <nav ref={navRef} aria-label={t('nav.main')} className={`relative flex items-center ${dock ? 'gap-0' : 'gap-0.5'}`}>
      {/* x comes from offsetLeft, which is measured from the physical left in both directions. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={pill}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        className={`absolute left-0 bg-surface-2 ${dock ? 'inset-y-0 rounded-2xl' : 'inset-y-0 rounded-full'}`}
      />
      {TABS.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          ref={(el) => {
            tabRefs.current[to] = el
          }}
          className={({ isActive }) =>
            `relative z-10 text-center font-semibold whitespace-nowrap transition-colors ${
              dock
                ? 'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 text-[0.68rem] leading-tight'
                : 'rounded-full px-3.5 py-1.5 text-sm'
            } ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`
          }
        >
          {dock && <Icon size={19} aria-hidden="true" />}
          {t(`nav.${key}`)}
        </NavLink>
      ))}
    </nav>
  )
}

export function TopBar() {
  const { t } = useTranslation()
  return (
    <>
      <header className="sticky top-2.5 z-40 sm:top-3">
        <div className="wrap">
          <div className="glass-bar island flex h-14 items-center justify-between gap-3 rounded-full ps-2.5 pe-2 sm:ps-3">
            <Link to="/" aria-label={t('brand.home')} className="rounded-full">
              <Logo size={36} />
            </Link>
            <div className="hidden lg:block">
              <NavTabs />
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <div className="fixed inset-x-0 bottom-3 z-40 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="wrap">
          <div className="glass-bar rounded-3xl p-1.5">
            <NavTabs dock />
          </div>
        </div>
      </div>
    </>
  )
}
