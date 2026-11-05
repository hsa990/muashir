import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TopBar } from './components/TopBar'
import { Footer } from './components/Footer'
import { Toast } from './components/Toast'
import { Intro } from './components/Intro'
import { EmberCursor } from './components/EmberCursor'
import { useScore } from './store/useStore'
import { setHeat } from './lib/thermal'
import { Overview } from './pages/Overview'
import { Check } from './pages/Check'
import { Trend } from './pages/Trend'
import { Signs } from './pages/Signs'
import { Method } from './pages/Method'

/** Before there is a score, the site stays cool. */
const CALM_HEAT = 0.08

function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.title = t('meta.title')
  }, [t])

  // The whole page warms up with the burnout score.
  const score = useScore()
  useEffect(() => {
    setHeat(score === null ? CALM_HEAT : score / 100)
  }, [score])

  // One listener lights the edge of whichever card the cursor is over.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const card = (event.target as HTMLElement).closest?.<HTMLElement>('.card')
      if (!card) return
      const box = card.getBoundingClientRect()
      card.style.setProperty('--edge-x', `${event.clientX - box.left}px`)
      card.style.setProperty('--edge-y', `${event.clientY - box.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-bg"
      >
        {t('a11y.skip')}
      </a>
      <div aria-hidden="true" className="scroll-line" />
      <TopBar />
      <div className="flex-1 pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <div key={pathname}>{outlet}</div>
        </AnimatePresence>
      </div>
      <Footer />
      <Toast />
      <Intro />
      <EmberCursor />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/check" element={<Check />} />
          <Route path="/trend" element={<Trend />} />
          <Route path="/signs" element={<Signs />} />
          <Route path="/method" element={<Method />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </MotionConfig>
  )
}
