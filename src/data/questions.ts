export type ScaleKey = 'frequency' | 'degree'
export type SectionKey = 'personal' | 'work'

export interface Question {
  n: number
  section: SectionKey
  scale: ScaleKey
  reverse?: boolean
}

/** Copenhagen Burnout Inventory. Wording lives in the locale files under check.questions. */
export const QUESTIONS: Question[] = [
  { n: 1, section: 'personal', scale: 'frequency' },
  { n: 2, section: 'personal', scale: 'frequency' },
  { n: 3, section: 'personal', scale: 'frequency' },
  { n: 4, section: 'personal', scale: 'frequency' },
  { n: 5, section: 'personal', scale: 'frequency' },
  { n: 6, section: 'personal', scale: 'frequency' },
  { n: 7, section: 'work', scale: 'degree' },
  { n: 8, section: 'work', scale: 'degree' },
  { n: 9, section: 'work', scale: 'degree' },
  { n: 10, section: 'work', scale: 'frequency' },
  { n: 11, section: 'work', scale: 'frequency' },
  { n: 12, section: 'work', scale: 'frequency' },
  { n: 13, section: 'work', scale: 'frequency', reverse: true },
]

/** Answer values in display order, highest first. Labels live under check.scales. */
export const ANSWER_VALUES = [100, 75, 50, 25, 0]
