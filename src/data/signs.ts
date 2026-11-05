/** The three dimensions of burnout in the WHO ICD-11 definition, with signs for each. Text lives under signs. */
export const DIMENSIONS = [
  { id: 'exhaustion', signs: ['tired', 'sleep', 'sick'] },
  { id: 'distance', signs: ['dread', 'cynical', 'withdrawn'] },
  { id: 'efficacy', signs: ['focus', 'late', 'achieve'] },
] as const

export type DimensionId = (typeof DIMENSIONS)[number]['id']
export const SIGNS: string[] = DIMENSIONS.flatMap((d) => [...d.signs])
