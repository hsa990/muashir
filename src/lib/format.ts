/** Western digits in both languages. */
export function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals, useGrouping: false }).format(value)
}

/** Month and year in the active language, always Gregorian with Western digits. */
export function formatMonth(y: number, m: number, lang: string, month: 'short' | 'long' = 'short') {
  const locale = lang === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US'
  return new Intl.DateTimeFormat(locale, { month, year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m, 1)))
}

/** Folds case and Arabic letter variants so search forgives spelling differences. */
export function normalizeSearch(text: string) {
  return text
    .toLowerCase()
    .replace(/[ً-ْ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
}
