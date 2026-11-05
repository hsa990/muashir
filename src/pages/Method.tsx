import { useTranslation } from 'react-i18next'
import { REFERENCES } from '../data/references'
import { Page, PageHeader, Reveal } from '../components/Page'

const SECTIONS = ['what', 'focus', 'rule', 'cbi']
const BANDS = [
  { band: 'low', range: '0-49', zone: 'green' },
  { band: 'moderate', range: '50-74', zone: 'amber' },
  { band: 'high', range: '75-99', zone: 'red' },
  { band: 'severe', range: '100', zone: 'red' },
]

export function Method() {
  const { t } = useTranslation()
  return (
    <Page>
      <div className="wrap space-y-8">
        <PageHeader section="method" />

        <Reveal className="grid gap-3 md:grid-cols-2">
          {SECTIONS.map((section, index) => (
            <section key={section} className="card scroll-rise flex gap-4 p-5 sm:p-6">
              <span aria-hidden="true" className="grid h-10 w-10 flex-none place-items-center rounded-full bg-surface-2 font-mono text-sm font-semibold">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h2 className="text-xl">{t(`method.sections.${section}.title`)}</h2>
                <p className="mt-2 text-muted">{t(`method.sections.${section}.body`)}</p>
              </div>
            </section>
          ))}
        </Reveal>

        <Reveal className="card p-3 sm:p-5">
          <h2 className="px-0.5 text-xl">{t('method.bandsTitle')}</h2>
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th scope="col">{t('method.band')}</th>
                <th scope="col">{t('method.range')}</th>
                <th scope="col">{t('method.zone')}</th>
              </tr>
            </thead>
            <tbody>
              {BANDS.map(({ band, range, zone }) => (
                <tr key={band}>
                  <td className="font-medium">{t(`check.bands.${band}`)}</td>
                  <td className="font-mono font-semibold">
                    <span dir="ltr">{range}</span>
                  </td>
                  <td>
                    <span className={`pill tone-${zone}`}>
                      <span className="dot" aria-hidden="true" />
                      {t(`status.${zone}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <Reveal>
          <section className="card p-5">
            <h2 className="text-xl">{t('method.referencesTitle')}</h2>
            <ul dir="ltr" lang="en" className="mt-3 list-none space-y-3 p-0 text-start font-[Figtree_Variable] text-sm">
              {REFERENCES.map((ref) => (
                <li key={ref.url} className="ps-6 -indent-6 break-words">
                  {ref.lead} {ref.journal ? ref.title : <i>{ref.title}</i>}{' '}
                  {ref.journal && (
                    <>
                      <i>{ref.journal}</i>, <i>{ref.volume}</i>
                      {ref.rest}{' '}
                    </>
                  )}
                  <a href={ref.url} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-2">
                    {ref.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>
    </Page>
  )
}
