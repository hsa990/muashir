import { useId } from 'react'
import { useTranslation } from 'react-i18next'

/** Compact mark: a rounded square with a 270-degree gauge and a needle in the amber zone. */
export function LogoMark({ size = 36, label }: { size?: number; label?: string }) {
  const id = useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="flex-none"
    >
      <defs>
        <linearGradient id={id} x1="9" y1="0" x2="39" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#19a39a" />
          <stop offset=".55" stopColor="#e2a33b" />
          <stop offset="1" stopColor="#e0532f" />
        </linearGradient>
      </defs>
      <rect x=".5" y=".5" width="47" height="47" rx="13" fill="#2b1d14" stroke="#fff" strokeOpacity=".1" />
      <path
        d="M13.39 34.61a15 15 0 1 1 21.22 0"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M24 24 27.4 11.6" stroke="#fbf3e6" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3.4" fill="#fbf3e6" />
    </svg>
  )
}

interface LogoProps {
  /** Height of the mark in pixels. The wordmark scales with it. */
  size?: number
  /** Shows only the mark on small screens. */
  responsive?: boolean
}

/** Bilingual lockup. It sits in the normal flex flow, so RTL puts the mark on the right. */
export function Logo({ size = 38, responsive = false }: LogoProps) {
  const { t } = useTranslation()
  const letters = t('brand.wordEn').split('')
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className={`logo-word ${responsive ? 'max-sm:!hidden' : ''}`}
        style={{ fontSize: size * 0.66 }}
      >
        <span className="logo-ar" dir="rtl" lang="ar">
          {t('brand.wordAr')}
        </span>
        <span className="logo-en" dir="ltr" lang="en" aria-label={t('brand.wordEn')}>
          {letters.map((letter, index) => (
            <span key={index} aria-hidden="true">
              {letter}
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}
