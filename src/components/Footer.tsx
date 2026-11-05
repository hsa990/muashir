import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="wrap mt-14 pb-28 lg:pb-6">
      <div className="night">
        <div aria-hidden="true" className="sadu" />
        <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Logo size={46} />
            <p className="text-sm font-semibold">{t('brand.tagline')}</p>
          </div>
          <div className="max-w-md text-sm leading-relaxed text-white/75 md:text-end">
            <p className="text-base font-semibold text-white">{t('footer.prepared')}</p>
            <p>{t('footer.course')}</p>
            <p>{t('footer.instructor')}</p>
            <p className="mt-1">{t('footer.dept')}</p>
          </div>
        </div>
        <p aria-hidden="true" className="giant-word">
          {t('brand.footerWord')}
        </p>
        <p className="border-t border-white/10 px-6 py-3 text-xs text-white/60 sm:px-8">{t('footer.privacy')}</p>
      </div>
    </footer>
  )
}
