import { Periods, PeriodModifiers } from 'common/period'

export const QueryTypes = ['and', 'or', 'line', 'phrase'] as const
export type QueryType = typeof QueryTypes[number]
export type PeriodString = keyof typeof Periods | ''
export type PeriodModifierString = keyof typeof PeriodModifiers | ''

export type FragmentQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
  limit: number
  number: string
  pages: string
  transliteration: string
  bibId: string
  bibLabel: string
  scriptPeriod: PeriodString
  scriptPeriodModifier: PeriodModifierString
  genre: string
  traditionalReferences: string
}>
