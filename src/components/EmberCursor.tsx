import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const EASE = 0.16
const INTERACTIVE = 'a, button, input, select, [role="option"]'

/** A soft ember that trails the mouse and swells over anything clickable. The normal cursor stays. */
export function EmberCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    const target = { x: 0, y: 0 }
    const now = { x: 0, y: 0 }

    const step = () => {
      now.x += (target.x - now.x) * EASE
      now.y += (target.y - now.y) * EASE
      el.style.transform = `translate3d(${now.x}px, ${now.y}px, 0)`
      const moving = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > 0.2
      frame = moving ? requestAnimationFrame(step) : 0
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      if (el.dataset.on !== 'true') {
        now.x = event.clientX
        now.y = event.clientY
        el.dataset.on = 'true'
      }
      target.x = event.clientX
      target.y = event.clientY
      el.dataset.big = String(Boolean((event.target as HTMLElement).closest?.(INTERACTIVE)))
      if (!frame) frame = requestAnimationFrame(step)
    }
    const onLeave = () => {
      el.dataset.on = 'false'
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])

  return (
    <div ref={ref} aria-hidden="true" className="ember-cursor">
      <span />
    </div>
  )
}
