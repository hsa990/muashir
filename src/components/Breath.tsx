import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PHASES = [
  { key: 'in', ms: 4000, scale: 1 },
  { key: 'hold', ms: 2000, scale: 1 },
  { key: 'out', ms: 6000, scale: 0.62 },
]
/** Five rounds of 12 seconds make the one minute promised on the tile. */
const ROUNDS = 5

/** A glowing ember that grows and shrinks with a slow breath. */
export function Breath() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [step, setStep] = useState<number | null>(null)

  useEffect(() => {
    if (step === null) return
    const timer = setTimeout(() => {
      setStep(step + 1 >= ROUNDS * PHASES.length ? null : step + 1)
    }, PHASES[step % PHASES.length].ms)
    return () => clearTimeout(timer)
  }, [step])

  const phase = step === null ? null : PHASES[step % PHASES.length]
  return (
    <div className="night flex h-full flex-col items-center !rounded-[24px] p-5 text-center sm:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 55% at 50% 58%, color-mix(in srgb, var(--heat-colour) 30%, transparent), transparent 75%)' }}
      />
      <h2 className="text-xl">{t('breath.title')}</h2>
      <p className="text-sm text-white/70">{t('breath.sub')}</p>
      <div className="relative my-4 grid h-36 w-36 flex-none place-items-center" aria-hidden="true">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, #fbe7c0 0%, var(--amber) 34%, var(--ember) 62%, transparent 74%)' }}
          initial={false}
          animate={{ scale: reduce ? 0.8 : (phase?.scale ?? 0.72) }}
          transition={{ duration: phase ? phase.ms / 1000 : 0.8, ease: 'easeInOut' }}
        />
      </div>
      <p className="min-h-6 font-semibold" aria-live="polite">
        {phase ? t(`breath.${phase.key}`) : t('breath.idle')}
      </p>
      <button
        type="button"
        onClick={() => setStep(step === null ? 0 : null)}
        className="btn btn-outline-light relative mt-3 w-full"
      >
        {step === null ? <Play size={15} aria-hidden="true" className="rtl:-scale-x-100" /> : <Pause size={15} aria-hidden="true" />}
        {t(step === null ? 'breath.start' : 'breath.stop')}
      </button>
    </div>
  )
}
