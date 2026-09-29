import _ from 'lodash'
import {
  DateField,
  KingDateField,
  ModernCalendar,
  MonthField,
} from 'chronology/domain/DateParameters'
import parseDateFieldNumber, {
  isApproximateDateFieldValue,
} from 'chronology/domain/parseDateFieldNumber'

export const calendarToAbbreviation = (calendar: ModernCalendar): string =>
  ({ Julian: 'PJC', Gregorian: 'PGC' })[calendar]

export function insertDateApproximation(
  dateString: string,
  isApproximate: boolean,
): string {
  return `${isApproximate ? 'ca. ' : ''}${dateString}`
}

export function isApproximateDate(
  year: DateField,
  month: MonthField,
  day: DateField,
): boolean {
  return [
    _.some(
      [
        parseDateFieldNumber(year.value),
        parseDateFieldNumber(month.value),
        parseDateFieldNumber(day.value),
      ],
      _.isNaN,
    ),
    [
      year.isBroken,
      month.isBroken,
      day.isBroken,
      year.isUncertain,
      month.isUncertain,
      day.isUncertain,
    ].includes(true),
    [year.value, month.value, day.value].some(isApproximateDateFieldValue),
  ].includes(true)
}

const parseKingDate = (date: string): string => {
  return date.replace(/[^\d-–]/g, '')
}

export function kingToModernDate(
  king: KingDateField | undefined,
  year: number,
  calendar: ModernCalendar = 'Julian',
): string {
  const firstReignYear = king?.date
    ? parseKingDate(king.date).split(/[-–]/)[0]
    : undefined

  return firstReignYear !== undefined && year > 0
    ? `ca. ${
        parseInt(firstReignYear) - year + 1
      } BCE ${calendarToAbbreviation(calendar)}`
    : king?.date && !['', '?'].includes(king.date)
      ? `ca. ${parseKingDate(king.date)} BCE ${calendarToAbbreviation(
          calendar,
        )}`
      : ''
}
