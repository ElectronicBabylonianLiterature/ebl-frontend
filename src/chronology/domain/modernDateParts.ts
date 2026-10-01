import _ from 'lodash'
import { DateField, ModernCalendar } from 'chronology/domain/DateParameters'
import parseDateFieldNumber, {
  isApproximateDateFieldValue,
} from 'chronology/domain/parseDateFieldNumber'

export const calendarToAbbreviation = (calendar: ModernCalendar): string =>
  ({ Julian: 'PJC', Gregorian: 'PGC' })[calendar]

export function isApproximateDate(fields: readonly DateField[]): boolean {
  return [
    _.some(
      fields.map((field) => parseDateFieldNumber(field.value)),
      _.isNaN,
    ),
    fields.some((field) => [field.isBroken, field.isUncertain].includes(true)),
    fields.map((field) => field.value).some(isApproximateDateFieldValue),
  ].includes(true)
}

export function kingDateToModernDate(kingDate: string, year: number): string {
  const reign = kingDate.replace(/[^\d-–]/g, '')
  const abbreviation = calendarToAbbreviation('Julian')
  return year > 0
    ? `ca. ${parseInt(reign.split(/[-–]/)[0]) - year + 1} BCE ${abbreviation}`
    : !['', '?'].includes(kingDate)
      ? `ca. ${reign} BCE ${abbreviation}`
      : ''
}
