import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import { formatMonth } from '../lib/format'
import { thermalAt } from '../lib/thermal'
import { LEVELS, STATUS_ZONE, levelScore, riseStart, statusOf } from '../lib/trend'
import { Page, PageHeader, Reveal } from '../components/Page'

const MONTHS = 6
const ENOUGH = 3
const SCALE = [...LEVELS].reverse()

function lastMonths() {
  const now = new Date()
  const base = now.getFullYear() * 12 + now.getMonth()
  return Array.from({ length: MONTHS }, (_, i) => {
    const total = base - (MONTHS - 1 - i)
    const y = Math.floor(total / 12)
    const m = total % 12
    return { y, m, key: `${y}-${m}` }
  })
}

/** Tapping a dot in each month draws the person's own line. Time runs left to right in both languages. */
function MonthGrid({ months, rated }: { months: ReturnType<typeof lastMonths>; rated: (number | null)[] }) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const rateMonth = useStore((s) => s.rateMonth)
  const short = (y: number, m: number) => formatMonth(y, m, i18n.language, 'short').replace(/\s*\d{4}\s*/, '')
  const x = (index: number) => ((index + 0.5) / MONTHS) * 100
  const y = (level: number) => ((5 - level + 0.5) / 5) * 100
  const points = rated.flatMap((level, index) => (level === null ? [] : [`${x(index)} ${y(level)}`]))

  return (
    <div dir="ltr" className="flex gap-2">
      <div className="month-labels" aria-hidden="true">
        {SCALE.map((level) => (
          <span key={level} className="grid items-center text-start" dir="auto">
            {t(`trend.levels.${level}`)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        {/* Layers, bottom to top: this month's band, the dots, the line, the chosen marks. */}
        <div className="relative">
          <div className="month-now" aria-hidden="true" />
          <div className="relative grid grid-cols-6">
            {months.map((month, index) => (
              <div key={month.key} role="radiogroup" aria-label={formatMonth(month.y, month.m, i18n.language, 'long')} className="grid">
                {SCALE.map((level) => (
                  <label key={level} className="month-dot">
                    <input
                      type="radio"
                      name={`${id}-${month.key}`}
                      className="sr-only"
                      checked={rated[index] === level}
                      aria-label={t(`trend.levels.${level}`)}
                      onChange={() => rateMonth(month.key, level)}
                    />
                    <span />
                  </label>
                ))}
              </div>
            ))}
          </div>
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="0">
                <stop offset="0" stopColor="var(--teal)" />
                <stop offset=".55" stopColor="var(--amber)" />
                <stop offset="1" stopColor="var(--ember)" />
              </linearGradient>
            </defs>
            {points.length > 1 && (
              <path d={`M ${points.join(' L ')}`} fill="none" stroke={`url(#${id})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            )}
          </svg>
          {rated.map(
            (level, index) =>
              level !== null && (
                <span
                  key={`${months[index].key}-${level}`}
                  aria-hidden="true"
                  className="month-mark"
                  style={{ left: `${x(index)}%`, top: `${y(level)}%`, color: thermalAt((level - 1) / 4) }}
                />
              ),
          )}
        </div>
        <div className="mt-1 grid grid-cols-6 text-center text-xs font-semibold text-muted">
          {months.map((month, index) => (
            <span key={month.key} className={`min-w-0 truncate ${index === MONTHS - 1 ? 'text-ink' : ''}`} dir="auto">
              {short(month.y, month.m)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Trend() {
  const { t, i18n } = useTranslation()
  const ratings = useStore((s) => s.months)
  const clearMonths = useStore((s) => s.clearMonths)
  const clearAll = useStore((s) => s.clearAll)
  const answers = useStore((s) => s.answers)
  const months = useMemo(lastMonths, [])
  const [confirming, setConfirming] = useState(false)

  const rated = months.map((m) => ratings[m.key] ?? null)
  const chosen = months.filter((_, i) => rated[i] !== null)
  const scores = rated.flatMap((level) => (level === null ? [] : [levelScore(level)]))
  const done = scores.length
  const status = done >= ENOUGH ? statusOf(scores) : null
  const zone = status ? STATUS_ZONE[status] : null
  const start = riseStart(scores)
  const checkDone = answers.every((a) => a !== null)

  return (
    <Page>
      <div className="wrap">
        <PageHeader section="trend" />

        <div className="grid items-start gap-5 lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-8">
            <section className="card min-w-0 p-4 sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl sm:text-2xl">{t('trend.gridTitle')}</h2>
                <p className="text-sm font-medium text-muted" aria-live="polite">
                  {t('trend.progress', { done, total: MONTHS })}
                </p>
              </div>
              <p className="mt-1 mb-4 text-sm text-muted">{t('trend.gridHint')}</p>
              <MonthGrid months={months} rated={rated} />
            </section>
          </Reveal>

          <Reveal className="min-w-0 space-y-3 lg:sticky lg:top-[5.25rem] lg:col-span-4">
            <section className={`card p-5 sm:p-6 ${zone ? `tone-${zone}` : ''}`} aria-live="polite">
              <p className="text-sm font-semibold text-muted">{t('trend.insight.title')}</p>
              {status && zone ? (
                <>
                  <h2 className="mt-2 flex items-center gap-2 text-3xl">
                    <span className="dot !h-3 !w-3" aria-hidden="true" />
                    {t(`trend.status.${status}.title`)}
                  </h2>
                  <p className="mt-2 text-lg leading-snug font-semibold">{t(`trend.status.${status}.body`)}</p>
                  {start >= 0 && (
                    <p className="mt-3 rounded-2xl bg-surface-2 px-3 py-2 font-semibold">
                      {t('trend.started', { month: formatMonth(chosen[start].y, chosen[start].m, i18n.language, 'long') })}
                    </p>
                  )}
                  <p className="mt-3 text-muted">{t(`trend.zones.${zone}.do`)}</p>
                </>
              ) : (
                <p className="mt-2 text-lg leading-snug font-semibold">{t(done === 0 ? 'trend.insight.start' : 'trend.insight.more')}</p>
              )}
            </section>
            {!checkDone && (
              <Link to="/check" className="btn btn-primary w-full">
                {t('trend.checkAgain')}
                <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
              </Link>
            )}
            {done > 0 && (
              <button type="button" className="btn btn-ghost w-full" onClick={clearMonths}>
                <RotateCcw size={15} aria-hidden="true" />
                {t('trend.reset')}
              </button>
            )}
          </Reveal>
        </div>

        <Reveal className="mt-6">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-muted hover:text-ink"
            onBlur={() => setConfirming(false)}
            onClick={() => {
              if (confirming) clearAll()
              setConfirming(!confirming)
            }}
          >
            <Trash2 size={15} aria-hidden="true" />
            {t(confirming ? 'trend.clearConfirm' : 'trend.clear')}
          </button>
        </Reveal>
      </div>
    </Page>
  )
}
