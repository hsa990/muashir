export type Zone = 'green' | 'amber' | 'red'
export type TrendStatus = 'steady' | 'rising' | 'amber' | 'red'

/** How a month felt, from 1 (great) to 5 (burnt out). */
export const LEVELS = [1, 2, 3, 4, 5]

/** The warning rule, in one line: worse two months in a row. */
export const WARNING_RISES = 2

/** Puts a month's level on the same 0 to 100 scale as the zones. */
export const levelScore = (level: number) => (level - 1) * 25

export function zoneOf(score: number): Zone {
  if (score >= 75) return 'red'
  return score >= 50 ? 'amber' : 'green'
}

/** How many months in a row things have got worse, counting back from the latest. */
export function risingMonths(scores: number[]) {
  let rises = 0
  for (let i = scores.length - 1; i > 0 && scores[i] > scores[i - 1]; i--) rises += 1
  return rises
}

/** Index of the first worse month in the latest slide, or -1 when things are not getting worse. */
export function riseStart(scores: number[]) {
  const rises = risingMonths(scores)
  return rises === 0 ? -1 : scores.length - rises
}

export function statusOf(scores: number[]): TrendStatus {
  const zone = zoneOf(scores[scores.length - 1])
  if (zone === 'red') return 'red'
  if (risingMonths(scores) >= WARNING_RISES) return 'rising'
  return zone === 'amber' ? 'amber' : 'steady'
}

export const STATUS_ZONE: Record<TrendStatus, Zone> = { steady: 'green', rising: 'amber', amber: 'amber', red: 'red' }
