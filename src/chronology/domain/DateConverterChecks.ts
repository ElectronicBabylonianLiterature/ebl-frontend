import {
  CalendarProps,
  GregorianProps,
  JulianProps,
  SeBabylonianProps,
} from 'chronology/domain/DateConverterBase'
import DateConverter from './DateConverter'

interface RangeParams {
  year: number
  month: number
  day: number
  yearLimit: number
  monthLimit: number
  dayLimit: number
}

export default class DateConverterChecks {
  isDateWithinValidRange(
    params: GregorianProps | JulianProps | SeBabylonianProps,
    earliestDate: CalendarProps,
    latestDate: CalendarProps
  ): [boolean, boolean] {
    const [leftLimits, rightLimits] = [
      earliestDate,
      latestDate,
    ].map((limitDate) => this.paramsToLimits(params, limitDate))
    return [
      !this.isDateBeforeValidRange({
        ...this.paramsToYearMonthDay(params),
        ...leftLimits,
      }),
      !this.isDateAfterValidRange({
        ...this.paramsToYearMonthDay(params),
        ...rightLimits,
      }),
    ]
  }

  isIncomingDateHasCorrespondingIntercalary(
    mesopotamianMonth: number,
    dateConverter: DateConverter
  ): boolean {
    const mesopotamianMonthsInYear = dateConverter.getMesopotamianMonthsOfSeYear(
      dateConverter.calendar.seBabylonianYear
    )
    return !!mesopotamianMonthsInYear.find(
      (month) => month.value === mesopotamianMonth
    )
  }

  private paramsToYearMonthDay(
    params:
      | GregorianProps
      | JulianProps
      | SeBabylonianProps
      | { [k: string]: number }
  ): { year: number; month: number; day: number } {
    const result = { year: 0, month: 0, day: 0 }
    Object.keys(params).forEach((fieldName: string) => {
      if (fieldName.includes('Year')) {
        result.year = params[fieldName]
      } else if (fieldName.includes('Month')) {
        result.month = params[fieldName]
      } else if (fieldName.includes('Day')) {
        result.day = params[fieldName]
      }
    })
    return result
  }

  private paramsToLimits(
    params: GregorianProps | JulianProps | SeBabylonianProps,
    limitDate: CalendarProps
  ): {
    yearLimit: number
    monthLimit: number
    dayLimit: number
  } {
    const filteredLimitDate = Object.fromEntries(
      Object.entries(limitDate).filter(([key]) =>
        Object.keys(params).includes(key)
      )
    )
    const limitsYMD = this.paramsToYearMonthDay(filteredLimitDate)
    return {
      yearLimit: limitsYMD.year,
      monthLimit: limitsYMD.month,
      dayLimit: limitsYMD.day,
    }
  }

  private isDateBeforeValidRange({
    year,
    month,
    day,
    yearLimit,
    monthLimit,
    dayLimit,
  }: RangeParams): boolean {
    return (
      year < yearLimit ||
      (year === yearLimit &&
        (month < monthLimit || (month === monthLimit && day < dayLimit)))
    )
  }

  private isDateAfterValidRange({
    year,
    month,
    day,
    yearLimit,
    monthLimit,
    dayLimit,
  }: RangeParams): boolean {
    return (
      year > yearLimit ||
      (year === yearLimit &&
        (month > monthLimit || (month === monthLimit && day > dayLimit)))
    )
  }
}
