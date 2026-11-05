import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import type { Lang } from '../i18n'

export function LanguageSwitch() {
  const { t } = useTranslation()
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)

  const option = (code: Lang, label: string, aria: string) => (
    <button
      type="button"
      lang={code}
      aria-label={aria}
      aria-pressed={lang === code}
      onClick={() => lang !== code && setLang(code)}
      className={`min-h-9 min-w-9 rounded-lg px-1.5 text-sm font-semibold transition-colors ${
        lang === code ? 'text-ink' : 'text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div dir="ltr" className="flex items-center">
      {option('en', t('lang.en'), t('lang.switchToEn'))}
      <span aria-hidden="true" className="text-line">
        |
      </span>
      {option('ar', t('lang.ar'), t('lang.switchToAr'))}
    </div>
  )
}
