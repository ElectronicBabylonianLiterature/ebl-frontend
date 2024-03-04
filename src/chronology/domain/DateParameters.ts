import { King } from 'chronology/ui/Kings/Kings'
import { Eponym } from 'chronology/ui/DateEditor/Eponyms'

export interface DateField {
  value: string
  isBroken?: boolean
  isUncertain?: boolean
}

export interface MonthField extends DateField {
  isIntercalary?: boolean
}

export interface KingDateField extends King {
  isBroken?: boolean
  isUncertain?: boolean
}

export interface EponymDateField extends Eponym {
  isBroken?: boolean
  isUncertain?: boolean
}

export type YearMonthDay = 'year' | 'month' | 'day'
export type ModernCalendar = 'Julian' | 'Gregorian'

export interface DateProps {
  year: number
  month: number
  day: number
  isApproximate: boolean
  calendar: ModernCalendar
}

export enum DateType {
  seleucidDate = 'seleucidDate',
  nabonassarEraDate = 'nabonassarEraDate',
  assyrianDate = 'assyrianDate',
  kingDate = 'kingDate',
}

export enum Ur3Calendar {
  ADAB = 'Adab',
  GIRSU = 'Girsu',
  IRISAGRIG = 'Irisagrig',
  NIPPUR = 'Nippur',
  PUZRISHDAGAN = 'Puzriš-Dagan',
  UMMA = 'Umma',
  UR = 'Ur',
}
