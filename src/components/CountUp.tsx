import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { formatNumber } from '../lib/format'

interface CountUpProps {
  value: number
  decimals?: number
  duration?: number
  className?: string
}

export function CountUp({ value, decimals = 0, duration = 0.9, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const from = useRef(0)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    const start = from.current
    from.current = value
    if (reduce) {
      el.textContent = formatNumber(value, decimals)
      return
    }
    const controls = animate(start, value, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = formatNumber(v, decimals)
      },
    })
    return () => controls.stop()
  }, [value, decimals, duration, inView, reduce])

  return (
    <span ref={ref} className={className}>
      {formatNumber(value, decimals)}
    </span>
  )
}
