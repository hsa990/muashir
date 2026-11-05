import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Pencil, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import { ANSWER_VALUES, QUESTIONS } from '../data/questions'
import { bandOf, scaleScore, sourceOf, type Band, type Source } from '../lib/scoring'
import { thermalAt } from '../lib/thermal'
import { Page, PageHeader, Reveal } from '../components/Page'
import { Embers } from '../components/Embers'
import { Gauge } from '../components/Gauge'
import { CountUp } from '../components/CountUp'

const AUTO_ADVANCE_MS = 250
const LAST = QUESTIONS.length - 1
const BAND_ORDER: Band[] = ['low', 'moderate', 'high', 'severe']

type Step = { title: string; how: string }
/** Bands with a `first` step open with the one that fits where the strain seems to come from. */
type Plan = { first?: Record<Source, Step>; steps: Step[] }

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const { t } = useTranslation()
  return (
    <div className="min-w-0 text-center">
      <Gauge value={score} ticks={[50, 75]} className="mx-auto max-w-56" ariaLabel={`${label}: ${score}`}>
        <CountUp value={score} className="font-mono text-4xl font-bold sm:text-5xl" />
        <span className="text-xs text-white/70">{label}</span>
      </Gauge>
      <p className="-mt-3 font-semibold">{t(`check.bands.${bandOf(score)}`)}</p>
    </div>
  )
}

/** The moment the check pays off. Nothing is shown before this. */
function Result({ onEdit, onRestart }: { onEdit: () => void; onRestart: () => void }) {
  const { t } = useTranslation()
  const answers = useStore((s) => s.answers)
  const personal = scaleScore(answers, 'personal') ?? 0
  const work = scaleScore(answers, 'work') ?? 0
  const worst = [bandOf(personal), bandOf(work)].sort((a, b) => BAND_ORDER.indexOf(b) - BAND_ORDER.indexOf(a))[0]
  const source = sourceOf(personal, work)
  const plan = t(`check.advice.${worst}`, { returnObjects: true }) as Plan
  const steps = plan.first ? [plan.first[source], ...plan.steps] : plan.steps
  const share = useRef(() => work / 100)

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="night !rounded-[28px]"
    >
      <Embers getShare={share.current} stayAwake />
      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl">{t('check.resultsTitle')}</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <ScoreGauge score={personal} label={t('check.gaugePersonal')} />
            <ScoreGauge score={work} label={t('check.gaugeWork')} />
          </div>
          <p className="mt-5 text-lg leading-snug font-semibold">{t(`check.meaning.${worst}`)}</p>
          {worst !== 'low' && <p className="mt-2 text-white/75">{t(`check.sources.${source}`)}</p>}
        </div>
        <div>
          <h3 className="text-xl">{t('check.adviceTitle')}</h3>
          <ol className="mt-3 list-none space-y-3 p-0">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span aria-hidden="true" className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white/12 font-mono text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm leading-relaxed text-white/75">{step.how}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Link to="/trend" className="btn btn-light sm:col-span-2">
              {t('check.seeMonths')}
              <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
            <button type="button" className="btn btn-outline-light" onClick={onEdit}>
              <Pencil size={15} aria-hidden="true" />
              {t('check.change')}
            </button>
            <button type="button" className="btn btn-outline-light" onClick={onRestart}>
              <RotateCcw size={15} aria-hidden="true" />
              {t('check.restart')}
            </button>
          </div>
          <p className="mt-4 text-xs text-white/60">{t('check.disclaimer')}</p>
        </div>
      </div>
    </motion.section>
  )
}

export function Check() {
  const { t, i18n } = useTranslation()
  const answers = useStore((s) => s.answers)
  const answer = useStore((s) => s.answer)
  const clearAnswers = useStore((s) => s.clearAnswers)
  const firstOpen = answers.findIndex((a) => a === null)
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen)
  const [direction, setDirection] = useState(1)
  const [editing, setEditing] = useState(false)
  const advance = useRef<ReturnType<typeof setTimeout>>(undefined)
  const moveFocus = useRef(false)
  const rtl = i18n.dir() === 'rtl'
  const showResult = firstOpen === -1 && !editing

  const go = useCallback((next: number) => {
    clearTimeout(advance.current)
    const target = Math.min(LAST, Math.max(0, next))
    setIndex((current) => {
      setDirection(target >= current ? 1 : -1)
      return target
    })
  }, [])

  const pick = useCallback(
    (value: number) => {
      answer(index, value)
      navigator.vibrate?.(8)
      clearTimeout(advance.current)
      advance.current = setTimeout(() => {
        const next = useStore.getState().answers.findIndex((a, i) => a === null && i !== index)
        moveFocus.current = true
        if (index < LAST) go(index + 1)
        else if (next === -1) setEditing(false)
        else go(next)
      }, AUTO_ADVANCE_MS)
    },
    [answer, go, index],
  )

  useEffect(() => () => clearTimeout(advance.current), [])

  useEffect(() => {
    if (showResult) return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if ((event.target as HTMLElement).closest?.('input, select, textarea, dialog')) return
      const key = Number(event.key)
      if (key >= 1 && key <= 5) {
        pick(ANSWER_VALUES[key - 1])
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const forward = (event.key === 'ArrowRight') !== rtl
        go(index + (forward ? 1 : -1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, pick, rtl, showResult])

  const question = QUESTIONS[index]
  const slide = direction * (rtl ? -1 : 1) * 48

  return (
    <Page>
      <div className="wrap">
        <PageHeader section="check" />

        {showResult ? (
          <Result
            onEdit={() => {
              setIndex(0)
              setEditing(true)
            }}
            onRestart={() => {
              clearAnswers()
              setIndex(0)
              setEditing(false)
            }}
          />
        ) : (
          <Reveal className="mx-auto min-w-0 max-w-3xl">
            <div className="card overflow-hidden p-4 sm:p-8">
              <nav aria-label={t('check.progress')} className="grid grid-cols-13 gap-1">
                {QUESTIONS.map((q, i) => {
                  const answered = answers[i] !== null
                  return (
                    <button
                      key={q.n}
                      type="button"
                      aria-label={t('check.jumpTo', { n: q.n })}
                      aria-current={i === index ? 'step' : undefined}
                      onClick={() => go(i)}
                      className="group grid h-7 place-items-center"
                    >
                      <span
                        style={{ background: answered ? thermalAt(i / LAST) : undefined }}
                        className={`block h-3 w-3 rotate-45 rounded-[3px] transition-all ${
                          answered ? '' : 'bg-line group-hover:bg-muted'
                        } ${i === index ? 'scale-125 ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
                      />
                    </button>
                  )
                })}
              </nav>

              <div className="mt-4 min-h-[27rem] sm:min-h-[26rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: slide }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -slide }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <p className="eyebrow">
                      {t('check.questionOf', { n: question.n, total: QUESTIONS.length })}
                      <span className="mx-2 opacity-50">/</span>
                      {t(`check.sections.${question.section}`)}
                    </p>
                    <h2
                      tabIndex={-1}
                      ref={(el) => {
                        if (el && moveFocus.current) {
                          moveFocus.current = false
                          el.focus({ preventScroll: true })
                        }
                      }}
                      className="mt-2 min-h-[5rem] text-2xl outline-none sm:text-4xl"
                    >
                      {t(`check.questions.${question.n}`)}
                    </h2>
                    {question.reverse && <p className="mt-1 text-xs text-muted">{t('check.reverseHint')}</p>}
                    <div role="group" aria-label={t(`check.questions.${question.n}`)} className="mt-4 grid gap-2">
                      {ANSWER_VALUES.map((value, i) => {
                        const selected = answers[index] === value
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => pick(value)}
                            className={`flex min-h-[3.25rem] items-center gap-3 rounded-2xl border px-3.5 text-start font-medium transition-colors ${
                              selected ? 'border-ink bg-ink text-bg' : 'border-line bg-surface hover:bg-surface-2'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`grid h-7 w-7 flex-none place-items-center rounded-full font-mono text-xs ${
                                selected ? 'bg-bg/15' : 'bg-surface-2 text-muted'
                              }`}
                            >
                              {i + 1}
                            </span>
                            {t(`check.scales.${question.scale}.${value}`)}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button type="button" className="btn btn-ghost" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t('check.prev')}>
                  {rtl ? <ArrowRight size={17} aria-hidden="true" /> : <ArrowLeft size={17} aria-hidden="true" />}
                </button>
                <p className="hidden text-xs text-muted sm:block">{t('check.keyboardHint')}</p>
                <button type="button" className="btn btn-ghost" onClick={() => go(index + 1)} disabled={index === LAST} aria-label={t('check.next')}>
                  {rtl ? <ArrowLeft size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted">{t('check.disclaimer')}</p>
          </Reveal>
        )}
      </div>
    </Page>
  )
}
