import { Periods, PeriodModifiers } from '../../common/period';

export type PeriodString = keyof typeof Periods | ''
export type PeriodModifierString = keyof typeof PeriodModifiers | ''

export type DossierQuery = Partial<{
  searchText: string
  period: PeriodString
  periodModifier: PeriodModifierString
  dateFrom: string
  dateTo: string
  kings: string
  limit: number
  page: number
}>