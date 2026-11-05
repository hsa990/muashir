import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion'
import { useScore } from '../store/useStore'
import { LogoMark } from './Logo'

const KEY = 'muashir-intro'
const HOLD_MS = 1150

function alreadySeen() {
  try {
    if (sessionStorage.getItem(KEY)) return true
    sessionStorage.setItem(KEY, '1')
  } catch {
    return true
  }
  return false
}

/** Decided once at load, so the headline can wait for the intro to lift. */
const firstVisit = !alreadySeen()
export const INTRO_DELAY_S = firstVisit ? 1.15 : 0

/** A short brand moment, once per visit. */
export function Intro() {
  const reduce = useReducedMotion()
  const score = useScore()
  const [show, setShow] = useState(firstVisit && !reduce)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!show) return
    const controls = animate(0, score ?? 0, { duration: 0.95, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setCount(Math.round(v)) })
    const timer = setTimeout(() => setShow(false), HOLD_MS)
    return () => {
      controls.stop()
      clearTimeout(timer)
    }
  }, [show, score])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-[var(--night)] text-[#f8efe3]"
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
        >
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <LogoMark size={84} />
            {score !== null && <span className="font-mono text-2xl font-semibold">{count}</span>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
