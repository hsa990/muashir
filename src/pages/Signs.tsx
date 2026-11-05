import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BatteryLow, Check, Frown, Gauge as GaugeIcon, RotateCcw, UsersRound, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import { DIMENSIONS, SIGNS, type DimensionId } from '../data/signs'
import { formatMonth } from '../lib/format'
import { Page, PageHeader, Reveal } from '../components/Page'

const ICONS: Record<DimensionId, LucideIcon> = { exhaustion: BatteryLow, distance: Frown, efficacy: GaugeIcon }

/** Nothing here is assumed or scored. It only reflects what the person ticks this month. */
export function Signs() {
  const { t, i18n } = useTranslation()
  const ticked = useStore((s) => s.signs)
  const toggleSign = useStore((s) => s.toggleSign)
  const clearSigns = useStore((s) => s.clearSigns)
  const now = new Date()
  const count = ticked.length
  const hit = DIMENSIONS.filter((d) => d.signs.some((s) => ticked.includes(s))).length
  const level = count === 0 ? 'none' : hit === DIMENSIONS.length ? 'all' : count >= 4 ? 'many' : 'few'

  return (
    <Page>
      <div className="wrap">
        <PageHeader section="signs" />

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-7 lg:col-span-8">
            {DIMENSIONS.map(({ id, signs }, index) => {
              const Icon = ICONS[id]
              const inGroup = signs.filter((s) => ticked.includes(s)).length
              return (
                <Reveal key={id}>
                  <section aria-labelledby={`dimension-${id}`}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-surface-2" aria-hidden="true">
                        <Icon size={21} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 id={`dimension-${id}`} className="text-xl sm:text-2xl">
                          <span className="me-2 font-mono text-sm font-medium text-muted">{index + 1}</span>
                          {t(`signs.dimensions.${id}.name`)}
                        </h2>
                        <p className="text-sm text-muted">{t(`signs.dimensions.${id}.desc`)}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {signs.map((sign) => {
                        const on = ticked.includes(sign)
                        return (
                          <button
                            key={sign}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => toggleSign(sign)}
                            className={`sign-tile ${on ? 'sign-tile-on' : ''}`}
                          >
                            <span className="sign-box" aria-hidden="true">
                              <AnimatePresence>
                                {on && (
                                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 24 }}>
                                    <Check size={15} strokeWidth={3.2} />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </span>
                            <span className="font-semibold">{t(`signs.items.${sign}.name`)}</span>
                          </button>
                        )
                      })}
                    </div>
                    <span className="sr-only">
                      {inGroup}/{signs.length}
                    </span>
                  </section>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="min-w-0 lg:sticky lg:top-[5.25rem] lg:col-span-4">
            <section className="card p-5 sm:p-6" aria-live="polite">
              <p className="text-sm font-semibold text-muted">{formatMonth(now.getFullYear(), now.getMonth(), i18n.language, 'long')}</p>
              <p className="mt-1 font-mono text-5xl font-bold">
                {count}
                <span className="text-2xl text-muted">/{SIGNS.length}</span>
              </p>

              <div className="mt-4 space-y-2.5">
                {DIMENSIONS.map(({ id, signs }) => {
                  const inGroup = signs.filter((s) => ticked.includes(s)).length
                  return (
                    <div key={id}>
                      <div className="flex justify-between gap-3 text-xs font-medium text-muted">
                        <span>{t(`signs.dimensions.${id}.name`)}</span>
                        <span className="font-mono" dir="ltr">
                          {inGroup}/{signs.length}
                        </span>
                      </div>
                      <div className="mt-1 grid grid-cols-3 gap-1" aria-hidden="true">
                        {signs.map((_, i) => (
                          <span key={i} className={`sign-meter ${i < inGroup ? 'sign-meter-on' : ''}`} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="mt-4 font-semibold">{t(`signs.summary.${level}`)}</p>

              <AnimatePresence initial={false}>
                {count > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <h3 className="mt-4 border-t border-line pt-4 font-sans text-sm font-semibold text-muted">{t('signs.stepsTitle')}</h3>
                    <ul className="mt-2 list-none space-y-2 p-0">
                      <AnimatePresence initial={false}>
                        {SIGNS.filter((s) => ticked.includes(s)).map((sign) => (
                          <motion.li
                            key={sign}
                            layout="position"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="flex gap-2 text-sm"
                          >
                            <ArrowRight size={15} aria-hidden="true" className="mt-1 flex-none text-[var(--ember)] rtl:-scale-x-100" />
                            {t(`signs.items.${sign}.tip`)}
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                    <div className="mt-4 grid gap-2">
                      <Link to="/check" className="btn btn-primary">
                        {t('signs.takeCheck')}
                      </Link>
                      <button type="button" className="btn btn-ghost" onClick={clearSigns}>
                        <RotateCcw size={15} aria-hidden="true" />
                        {t('signs.clear')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </Reveal>
        </div>

        <Reveal className="mt-8">
          <section className="night flex flex-col gap-4 !rounded-[24px] p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/10" aria-hidden="true">
              <UsersRound size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl">{t('signs.teammate.title')}</h2>
              <p className="mt-1 max-w-3xl text-white/75">{t('signs.teammate.body')}</p>
            </div>
          </section>
        </Reveal>
      </div>
    </Page>
  )
}
