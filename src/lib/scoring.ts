import { QUESTIONS, type SectionKey } from '../data/questions'

export type Band = 'low' | 'moderate' | 'high' | 'severe'
export type Source = 'work' | 'personal' | 'both'

/** Points one score must lead by before the advice starts there. A design choice for this project. */
const SOURCE_GAP = 10

export function sourceOf(personal: number, work: number): Source {
  if (work - personal >= SOURCE_GAP) return 'work'
  if (personal - work >= SOURCE_GAP) return 'personal'
  return 'both'
}

/** Average of the answered items in a section, rounded, or null when none are answered. */
export function scaleScore(answers: (number | null)[], section: SectionKey): number | null {
  const scored: number[] = []
  QUESTIONS.forEach((q, index) => {
    const raw = answers[index]
    if (q.section !== section || raw === null) return
    scored.push(q.reverse ? 100 - raw : raw)
  })
  if (scored.length === 0) return null
  return Math.round(scored.reduce((sum, v) => sum + v, 0) / scored.length)
}

export function bandOf(score: number): Band {
  if (score >= 100) return 'severe'
  if (score >= 75) return 'high'
  if (score >= 50) return 'moderate'
  return 'low'
}
