import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useScore, useStore } from '../store/useStore'
import { WORKLIFE_AREAS } from '../data/areas'
import { ANSWER_VALUES, QUESTIONS } from '../data/questions'
import { SIGNS } from '../data/signs'
import { formatNumber } from '../lib/format'
import { levelScore, statusOf, zoneOf } from '../lib/trend'
import { Kinetic, Page, Reveal, Thermal } from '../components/Page'
import { Embers } from '../components/Embers'
import { Gauge } from '../components/Gauge'
import { CountUp } from '../components/CountUp'
import { Aurora } from '../components/Aurora'
import { Breath } from '../components/Breath'
import { Magnetic } from '../components/Magnetic'
import { mulberry32 } from '../lib/rng'

const skyRandom = mulberry32(14)
/** Fixed positions, so the night sky looks the same on every visit. */
const STARS = Array.from({ length: 46 }, (_, index) => ({
  x: skyRandom() * 100,
  y: skyRandom() * 58,
  size: 0.6 + skyRandom() * 1.1,
  delay: (index % 9) * 0.4,
}))

function NightSky() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      {STARS.map((star, index) => (
        <span
          key={index}
          className="star absolute rounded-full bg-[#fbf3e6]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size * 2,
            height: star.size * 2,
            opacity: 0.7,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      <svg viewBox="0 0 64 64" className="parallax-moon absolute top-24 left-[50%] hidden h-14 w-14 lg:block">
        <path fill="#fbe7c0" d="M42 8a26 26 0 1 0 14 44A22 22 0 0 1 42 8Z" />
      </svg>
    </div>
  )
}

const Arrow = ({ size = 17 }: { size?: number }) => <ArrowRight size={size} aria-hidden="true" className="rtl:-scale-x-100" />

/** Only ever shows the person's own saved score. */
function Pulse({ score }: { score: number }) {
  const { t } = useTranslation()
  return (
    <aside className="rounded-[26px] border border-white/14 bg-white/[0.07] p-5 backdrop-blur-md">
      <h2 className="text-xl">{t('overview.pulseTitle')}</h2>
      <Gauge value={score} ticks={[50, 75]} ariaLabel={`${t('overview.pulseTitle')}: ${score}`} className="mx-auto mt-1 w-56">
        <CountUp value={score} className="font-mono text-5xl font-bold" />
        <span className="text-xs text-white/70">{t(`status.${zoneOf(score)}`)}</span>
      </Gauge>
      <p className="-mt-2 border-t border-white/12 pt-3 text-xs text-white/65">
        {t('overview.emberNote', { share: formatNumber(score) })}
      </p>
    </aside>
  )
}

function Hero() {
  const { t } = useTranslation()
  const score = useScore()
  const greeting = t(new Date().getHours() < 12 ? 'overview.greetingMorning' : 'overview.greetingEvening')
  return (
    <section className="night hero-full">
      <Aurora />
      <NightSky />
      {/* Desert dunes at night. The embers rise from behind them. */}
      <svg aria-hidden="true" viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 -z-10 h-[46%] w-full">
        <path className="parallax-far" fill="#2a1a12" d="M0 210C240 140 430 260 730 205s470-80 710-10v125H0Z" />
        <path className="parallax-near" fill="#38231a" d="M0 268c290-58 520 34 860-16s400-22 580 22v46H0Z" />
      </svg>
      <Embers />
      <div className={`wrap relative grid min-h-svh items-center gap-8 pt-24 pb-20 lg:pb-14 ${score !== null ? 'lg:grid-cols-[1.25fr_minmax(0,1fr)] lg:gap-12' : ''}`}>
        <div className="hero-copy max-w-5xl">
          <p className="text-sm font-medium text-white/75">
            {greeting}. {t('overview.greetingSub')}
          </p>
          <h1 className={`mt-3 text-[2.5rem] sm:text-6xl ${score !== null ? 'xl:text-7xl' : 'lg:text-7xl xl:text-8xl'}`}>
            <Kinetic i18nKey="overview.heading" scribble />
          </h1>
          <p className="mt-5 max-w-xl text-white/80 sm:text-lg">{t('overview.intro')}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Magnetic className="max-sm:w-full">
              <Link to="/check" className="btn btn-light max-sm:w-full">
                {t('overview.ctaCheck')}
                <Arrow />
              </Link>
            </Magnetic>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70 max-sm:justify-center">
              <span>{t('overview.facts.questions')}</span>
              <span>{t('overview.facts.time')}</span>
              <span>{t('overview.facts.private')}</span>
            </p>
          </div>
        </div>
        {score !== null && (
          <div className="hero-copy">
            <Pulse score={score} />
          </div>
        )}
      </div>
    </section>
  )
}

/** The real first question, so a visitor can begin right here. */
function StartHere() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const answers = useStore((s) => s.answers)
  const answer = useStore((s) => s.answer)
  const done = answers.filter((a) => a !== null).length
  const total = QUESTIONS.length
  const first = QUESTIONS[0]

  return (
    <section className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <h2 className="text-4xl sm:text-5xl">
          <Thermal i18nKey="overview.start.title" />
        </h2>
        <p className="mt-3 text-muted sm:text-lg">{t('overview.start.sub')}</p>
      </div>
      <div className="card min-w-0 p-5 sm:p-8 lg:col-span-7">
        {done === 0 ? (
          <>
            <p className="eyebrow">{t('check.questionOf', { n: first.n, total })}</p>
            <h3 className="mt-2 text-2xl sm:text-3xl">{t(`check.questions.${first.n}`)}</h3>
            <div role="group" aria-label={t(`check.questions.${first.n}`)} className="mt-5 grid gap-2 sm:grid-cols-5">
              {ANSWER_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="min-h-12 rounded-2xl border border-line px-2 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-surface-2"
                  onClick={() => {
                    answer(0, value)
                    navigate('/check')
                  }}
                >
                  {t(`check.scales.${first.scale}.${value}`)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl sm:text-3xl">{t(done < total ? 'overview.start.continueTitle' : 'overview.start.doneTitle')}</h3>
            <p className="mt-1 text-muted">{t('overview.start.progress', { done, total })}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: 'var(--thermal)' }} />
            </div>
            <Link to="/check" className="btn btn-primary mt-5">
              {t(done < total ? 'overview.start.continue' : 'overview.start.seeResult')}
              <Arrow />
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

/** Appears only after the person has finished the check. */
function Standing() {
  const { t } = useTranslation()
  const score = useScore()
  const months = useStore((s) => s.months)
  const signs = useStore((s) => s.signs)
  if (score === null) return null
  const zone = zoneOf(score)
  const rated = Object.entries(months)
    .sort(([a], [b]) => a.split('-').reduce((n, v) => n * 12 + Number(v), 0) - b.split('-').reduce((n, v) => n * 12 + Number(v), 0))
    .map(([, level]) => levelScore(level))
  const rising = rated.length >= 3 && statusOf(rated) === 'rising'
  return (
    <Reveal>
      <section className={`card beam tone-${zone} grid gap-5 p-5 sm:p-8 lg:grid-cols-12 lg:items-center`}>
        <div className="lg:col-span-7">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Sparkles size={16} aria-hidden="true" />
            {t('overview.status.eyebrow')}
          </p>
          <h2 className="mt-2 flex items-center gap-2.5 text-3xl sm:text-4xl">
            <span className="dot !h-3 !w-3" aria-hidden="true" />
            {t(`status.${zone}`)}
          </h2>
          <p className="mt-2 sm:text-lg">{t(`trend.zones.${zone}.do`)}</p>
          {rising && <p className="mt-2 font-semibold">{t('trend.status.rising.body')}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
          {signs.length > 0 && (
            <Link to="/signs" className="pill">
              {t('overview.status.signs', { count: signs.length, total: SIGNS.length })}
            </Link>
          )}
          <Link to="/trend" className="btn btn-primary">
            {t('overview.status.cta')}
            <Arrow />
          </Link>
        </div>
      </section>
    </Reveal>
  )
}

function Steps() {
  const { t } = useTranslation()
  return (
    <section>
      <h2 className="text-3xl sm:text-4xl">{t('overview.steps.title')}</h2>
      <ol className="mt-5 grid list-none gap-5 p-0 md:grid-cols-3">
        {['one', 'two', 'three'].map((step, index) => (
          <li key={step} className="border-t-2 border-ink pt-3">
            <span className="font-mono text-sm text-muted">{formatNumber(index + 1)}</span>
            <h3 className="mt-1 text-xl sm:text-2xl">{t(`overview.steps.${step}.name`)}</h3>
            <p className="mt-1 text-muted">{t(`overview.steps.${step}.desc`)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function WorklifeAreas() {
  const { t } = useTranslation()
  return (
    <section>
      <h2 className="text-3xl sm:text-5xl">
        <Thermal i18nKey="overview.areas.title" />
      </h2>
      <p className="mt-2 max-w-2xl text-muted sm:text-lg">{t('overview.areas.sub')}</p>
      <ol className="mt-6 list-none border-t border-line p-0">
        {WORKLIFE_AREAS.map((area, index) => (
          <li key={area} className="area-row">
            <span className="font-mono text-sm text-muted">{formatNumber(index + 1)}</span>
            <h3 className="area-name">{t(`areas.${area}.name`)}</h3>
            <p className="text-muted sm:text-lg">{t(`areas.${area}.desc`)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Overview() {
  return (
    <Page>
      <div>
        <Hero />
        <div className="sheet">
          <div className="wrap space-y-12 pt-10 md:space-y-20 md:pt-16">
            <Reveal>
              <StartHere />
            </Reveal>
            <Standing />
            <Reveal className="scroll-rise grid items-stretch gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Steps />
              </div>
              <div className="lg:col-span-4">
                <Breath />
              </div>
            </Reveal>
            <Reveal className="scroll-rise">
              <WorklifeAreas />
            </Reveal>
          </div>
        </div>
      </div>
    </Page>
  )
}
