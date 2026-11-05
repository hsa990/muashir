import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { currentScore, useStore } from '../store/useStore'

const COOL = '#19a39a'
const AMBER = '#e2a33b'
const RED = '#e0532f'
const PUSH_RADIUS = 130

interface Ember {
  x: number
  y: number
  vx: number
  vy: number
  rise: number
  size: number
  phase: number
  /** Evenly spaced in 0 to 1. An ember is hot when rank is below the burnout score share. */
  rank: number
}

function glowSprite(color: string) {
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = 64
  const ctx = sprite.getContext('2d')!
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  glow.addColorStop(0, '#fff6e8')
  glow.addColorStop(0.12, color)
  glow.addColorStop(0.42, `${color}55`)
  glow.addColorStop(1, `${color}00`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 64, 64)
  return sprite
}

const scoreShare = () => (currentScore(useStore.getState()) ?? 0) / 100

/** Glowing particles that drift upward. The hot share follows the burnout score live. */
interface EmbersProps {
  /** Share of hot embers, 0 to 1. Defaults to the person's score. */
  getShare?: () => number
  /** Keep burning after the first screen, for scenes further down the page. */
  stayAwake?: boolean
}

export function Embers({ getShare = scoreShare, stayAwake = false }: EmbersProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    const sprites = { cool: glowSprite(COOL), amber: glowSprite(AMBER), red: glowSprite(RED) }
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: -9999, y: -9999 }
    let embers: Ember[] = []
    let width = 0
    let height = 0
    let frame = 0
    let last = 0
    let onScreen = true
    let share = getShare()

    const place = (ember: Ember, anywhere: boolean) => {
      ember.x = Math.random() * width
      ember.y = anywhere ? Math.random() * height : height + 12
      ember.vx = 0
      ember.rise = 0.25 + Math.random() * 0.7
      ember.vy = -ember.rise
      ember.size = 7 + Math.random() * 15
      ember.phase = Math.random() * Math.PI * 2
    }

    const build = () => {
      const count = Math.min(190, Math.max(60, Math.round((width * height) / 6500)))
      embers = Array.from({ length: count }, (_, index) => {
        const ember: Ember = { x: 0, y: 0, vx: 0, vy: 0, rise: 0, size: 0, phase: 0, rank: (index + 0.5) / count }
        place(ember, true)
        return ember
      })
    }

    const draw = (time: number) => {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      for (const ember of embers) {
        const hot = ember.rank < share
        const sprite = !hot ? sprites.cool : ember.rank < share * 0.45 ? sprites.red : sprites.amber
        const flicker = 0.62 + 0.38 * Math.sin(time * 0.003 + ember.phase)
        const fade = Math.min(1, ember.y / (height * 0.28))
        ctx.globalAlpha = Math.max(0, flicker * fade)
        ctx.drawImage(sprite, ember.x - ember.size / 2, ember.y - ember.size / 2, ember.size, ember.size)
      }
    }

    const step = (time: number) => {
      const dt = Math.min(2.5, (time - last) / 16.7 || 1)
      last = time
      for (const ember of embers) {
        const dx = ember.x - pointer.x
        const dy = ember.y - pointer.y
        const distance = Math.hypot(dx, dy)
        if (distance < PUSH_RADIUS && distance > 0.01) {
          const force = (1 - distance / PUSH_RADIUS) ** 2 * 1.5
          ember.vx += (dx / distance) * force
          ember.vy += (dy / distance) * force
        }
        ember.vx *= 0.94
        ember.vy += (-ember.rise - ember.vy) * 0.05
        ember.x += (ember.vx + Math.sin(time * 0.0012 + ember.phase) * 0.22) * dt
        ember.y += ember.vy * dt
        if (ember.y < -14 || ember.x < -30 || ember.x > width + 30) place(ember, false)
      }
      share = getShare()
      draw(time)
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const sync = () => {
      const covered = !stayAwake && window.scrollY >= window.innerHeight * 1.05
      const visible = onScreen && !document.hidden && !reduce && !covered
      if (visible && !frame) {
        last = performance.now()
        frame = requestAnimationFrame(step)
      } else if (!visible) {
        stop()
      }
    }

    const resize = () => {
      width = host.clientWidth
      height = host.clientHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      build()
      draw(0)
    }

    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      pointer.x = event.clientX - box.left
      pointer.y = event.clientY - box.top
    }
    const onLeave = () => {
      pointer.x = pointer.y = -9999
    }

    const unsubscribe = useStore.subscribe(() => {
      share = getShare()
      if (reduce) draw(0)
    })
    const resizer = new ResizeObserver(resize)
    resizer.observe(host)
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    watcher.observe(canvas)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('scroll', sync, { passive: true })
    resize()
    sync()

    return () => {
      stop()
      unsubscribe()
      resizer.disconnect()
      watcher.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('scroll', sync)
    }
  }, [reduce, getShare, stayAwake])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
