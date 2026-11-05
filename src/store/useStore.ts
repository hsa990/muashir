import { flushSync } from 'react-dom'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { initialLang, type Lang } from '../i18n'
import { QUESTIONS } from '../data/questions'
import { scaleScore } from '../lib/scoring'

export type Theme = 'light' | 'dark'

const emptyAnswers = () => QUESTIONS.map(() => null)
const thisMonth = () => new Date().getFullYear() * 12 + new Date().getMonth()

interface State {
  lang: Lang
  setLang: (lang: Lang) => void

  theme: Theme
  setTheme: (theme: Theme) => void
  /** Spreads the new theme out in a circle from the given point. */
  toggleTheme: (origin?: { x: number; y: number }) => void

  /** How each past month felt, from 1 to 5, keyed by year and month. */
  months: Record<string, number>
  rateMonth: (key: string, level: number) => void
  clearMonths: () => void

  /** Warning signs the person ticked this month. */
  signs: string[]
  /** The month the ticks belong to. They reset when a new month starts. */
  signsMonth: number
  toggleSign: (id: string) => void
  clearSigns: () => void

  /** Deletes everything this site has stored. */
  clearAll: () => void

  answers: (number | null)[]
  answer: (index: number, value: number) => void
  clearAnswers: () => void

  toast: { id: number; text: string } | null
  showToast: (text: string) => void
  hideToast: () => void
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  try {
    localStorage.setItem('muashir-lang', lang)
  } catch {
    // The choice still applies for this visit.
  }
}

const prefersCalm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Quick repeat clicks skip the earlier transition. The change still applies, so that is not an error. */
function startTransition(change: () => void) {
  const transition = document.startViewTransition(change)
  transition.ready.catch(() => {})
  transition.updateCallbackDone.catch(() => {})
  transition.finished.catch(() => {})
  return transition
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: initialLang(),
      setLang: (lang) => {
        const change = () => {
          flushSync(() => {
            i18n.changeLanguage(lang)
            applyLang(lang)
            set({ lang })
          })
        }
        if ('startViewTransition' in document && !prefersCalm()) startTransition(change)
        else change()
      },

      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
      toggleTheme: (origin) => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        try {
          localStorage.setItem('muashir-theme', next)
        } catch {
          // The choice still applies for this visit.
        }
        const root = document.documentElement
        const change = () => flushSync(() => get().setTheme(next))
        if (!document.startViewTransition || prefersCalm()) {
          change()
          return
        }
        const { x, y } = origin ?? { x: window.innerWidth / 2, y: 0 }
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
        root.classList.add('theme-flip')
        const transition = startTransition(change)
        transition.ready
          .then(() => {
            root.animate(
              { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
              { duration: 560, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
            )
          })
          .catch(() => {})
        transition.finished.catch(() => {}).finally(() => root.classList.remove('theme-flip'))
      },

      months: {},
      rateMonth: (key, level) => set((s) => ({ months: { ...s.months, [key]: level } })),
      clearMonths: () => set({ months: {} }),

      signs: [],
      signsMonth: thisMonth(),
      toggleSign: (id) =>
        set((s) => {
          const current = s.signsMonth === thisMonth() ? s.signs : []
          return {
            signsMonth: thisMonth(),
            signs: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
          }
        }),
      clearSigns: () => set({ signs: [] }),

      clearAll: () => set({ months: {}, signs: [], answers: emptyAnswers() }),

      answers: emptyAnswers(),
      answer: (index, value) => set((s) => ({ answers: s.answers.map((a, i) => (i === index ? value : a)) })),
      clearAnswers: () => set({ answers: emptyAnswers() }),

      toast: null,
      showToast: (text) => set({ toast: { id: Date.now(), text } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'muashir-state',
      // Version 5 replaced saved scores with the six-month look back. Older data is dropped.
      version: 5,
      migrate: () => ({}) as never,
      partialize: (s) => ({ months: s.months, signs: s.signs, signsMonth: s.signsMonth, answers: s.answers }),
      merge: (saved, current) => {
        const state = { ...current, ...(saved as Partial<State>) }
        return state.signsMonth === thisMonth() ? state : { ...state, signs: [], signsMonth: thisMonth() }
      },
    },
  ),
)

/** The work burnout score, once all 13 questions are answered. */
export function currentScore(state: Pick<State, 'answers'>) {
  return state.answers.every((a) => a !== null) ? scaleScore(state.answers, 'work') : null
}

export const useScore = () => useStore(currentScore)
