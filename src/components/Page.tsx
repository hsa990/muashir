import { Fragment, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Trans, useTranslation } from 'react-i18next'
import { thermalAt } from '../lib/thermal'
import { INTRO_DELAY_S } from './Intro'

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.2, 0.7, 0.2, 1] } },
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.main id="main" tabIndex={-1} variants={pageVariants} initial="hidden" animate="show" exit="exit" className="outline-none">
      {children}
    </motion.main>
  )
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={riseVariants} className={className}>
      {children}
    </motion.div>
  )
}

/** Renders a locale string where <g> marks the one gradient word. */
export function Thermal({ i18nKey }: { i18nKey: string }) {
  return <Trans i18nKey={i18nKey} components={{ g: <span className="thermal-text" /> }} />
}

interface Word {
  text: string
  hot: boolean
  /** Punctuation that sits right after a gradient word and must not wrap away from it. */
  tail: string
}

function parseWords(raw: string) {
  const words: Word[] = []
  for (const part of raw.split(/(<g>.*?<\/g>)/).filter(Boolean)) {
    const hot = part.startsWith('<g>')
    let text = part.replace(/<\/?g>/g, '')
    const glued = !hot && words.length > 0 ? text.match(/^\S+/) : null
    if (glued) {
      words[words.length - 1].tail = glued[0]
      text = text.slice(glued[0].length)
    }
    for (const word of text.trim().split(/\s+/).filter(Boolean)) words.push({ text: word, hot, tail: '' })
  }
  return words
}

/** Headline that arrives word by word. Whole words only, so Arabic letters stay joined. */
export function Kinetic({ i18nKey, scribble = false }: { i18nKey: string; scribble?: boolean }) {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  // Only the first screen waits for the intro. Later pages start straight away.
  const wait = useRef(Math.max(0, INTRO_DELAY_S - performance.now() / 1000)).current
  const words = parseWords(t(i18nKey))
  const hotTotal = words.filter((w) => w.hot).length
  let hotIndex = 0
  return (
    <>
      {words.map((word, index) => {
        const from = hotIndex / hotTotal
        const to = (hotIndex + 1) / hotTotal
        if (word.hot) hotIndex += 1
        // The stroke sits under the first gradient word: burnout, or الاحتراق.
        const underline = scribble && word.hot && hotIndex === 1
        return (
          <Fragment key={`${i18n.language}-${index}`}>
            <motion.span
              className="relative inline-block"
              initial={reduce ? false : { opacity: 0, y: '0.35em', filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: wait + 0.1 + index * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {word.hot ? (
                <span
                  className="thermal-text"
                  style={{ backgroundImage: `linear-gradient(var(--thermal-dir), ${thermalAt(from)}, ${thermalAt(to)})` }}
                >
                  {word.text}
                </span>
              ) : (
                word.text
              )}
              {word.tail}
              {underline && (
                <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="scribble">
                  <path pathLength="1" d="M3 8C42 3 92 2 197 6" style={{ animationDelay: `${wait + 0.95}s` }} />
                </svg>
              )}
            </motion.span>{' '}
          </Fragment>
        )
      })}
    </>
  )
}

export function PageHeader({ section, children }: { section: string; children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <Reveal className="pt-7 pb-6 md:pt-10 md:pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="kicker">{t(`${section}.eyebrow`)}</p>
          <h1 className="mt-3 text-[2.1rem] sm:text-5xl">
            <Kinetic i18nKey={`${section}.heading`} />
          </h1>
          <p className="mt-3 text-muted sm:text-lg">{t(`${section}.intro`)}</p>
        </div>
        {children}
      </div>
      <div aria-hidden="true" className="sadu mt-6 opacity-70" />
    </Reveal>
  )
}
