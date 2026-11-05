import { useId, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface GaugeProps {
  /** 0 to 100, or null for an empty gauge. */
  value: number | null
  ticks?: number[]
  ariaLabel: string
  className?: string
  children?: ReactNode
}

const SIZE = 200
const STROKE = 14
const R = 76
const C = SIZE / 2

const point = (degrees: number, radius: number) => {
  const a = (degrees * Math.PI) / 180
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) }
}

/** Position on the 270-degree arc: 0 sits at bottom left and 100 at bottom right. */
const angleOf = (value: number) => 135 + (value / 100) * 270

export function Gauge({ value, ticks = [], ariaLabel, className = '', children }: GaugeProps) {
  const id = useId()
  const reduce = useReducedMotion()
  const start = point(135, R)
  const end = point(45, R)
  const arc = `M ${start.x} ${start.y} A ${R} ${R} 0 1 1 ${end.x} ${end.y}`

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={ariaLabel} className="block h-auto w-full">
        <defs>
          <linearGradient id={id} x1={C - R} y1="0" x2={C + R} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--teal)" />
            <stop offset=".55" stopColor="var(--amber)" />
            <stop offset="1" stopColor="var(--ember)" />
          </linearGradient>
        </defs>
        <path d={arc} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth={STROKE} strokeLinecap="round" />
        {value !== null && (
          <motion.path
            d={arc}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? value / 100 : 0 }}
            animate={{ pathLength: value / 100 }}
            transition={{ duration: reduce ? 0 : 1, ease: [0.2, 0.7, 0.2, 1] }}
          />
        )}
        {ticks.map((tick) => {
          const angle = angleOf(tick)
          const inner = point(angle, R - STROKE / 2 - 2)
          const outer = point(angle, R + STROKE / 2 + 2)
          const label = point(angle, R + STROKE / 2 + 11)
          return (
            <g key={tick}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="currentColor" strokeOpacity=".6" strokeWidth="2" />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fillOpacity=".7"
                fontSize="10"
                fontFamily="var(--f-mono)"
              >
                {tick}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
