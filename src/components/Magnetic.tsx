import type { PointerEvent, ReactNode } from 'react'

const PULL = 0.18

/** Leans its child gently toward the mouse. */
export function Magnetic({ children, className = '' }: { children: ReactNode; className?: string }) {
  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'mouse') return
    const el = event.currentTarget
    const box = el.getBoundingClientRect()
    el.style.setProperty('--pull-x', `${(event.clientX - box.left - box.width / 2) * PULL}px`)
    el.style.setProperty('--pull-y', `${(event.clientY - box.top - box.height / 2) * PULL}px`)
  }
  const onLeave = (event: PointerEvent<HTMLSpanElement>) => {
    event.currentTarget.style.setProperty('--pull-x', '0px')
    event.currentTarget.style.setProperty('--pull-y', '0px')
  }
  return (
    <span onPointerMove={onMove} onPointerLeave={onLeave} className={`magnetic ${className}`}>
      {children}
    </span>
  )
}
