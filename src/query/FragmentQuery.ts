import { Periods, PeriodModifiers } from 'common/period'

export const QueryTypes = ['and', 'or', 'line', 'phrase'] as const
export type QueryType = typeof QueryTypes[number]

export type FragmentQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
  limit: number
  number: string
  pages: string
  transliteration: string
  bibId: string
  title: string
  author: string
  bibYear: string
  scriptPeriod: keyof typeof Periods
  scriptPeriodModifier: keyof typeof PeriodModifiers
}>
