import {
  CalendarProps,
  GregorianProps,
  JulianProps,
  SeBabylonianProps,
} from 'chronology/domain/DateConverterBase'

interface RangeParams {
  year: number
  month: number
  day: number
  yearLimit: number
  monthLimit: number
  dayLimit: number
}

function compareToLimit({
  year,
  month,
  day,
  yearLimit,
  monthLimit,
  dayLimit,
}: RangeParams): number {
  return (
    4 * Math.sign(year - yearLimit) +
    2 * Math.sign(month - monthLimit) +
    Math.sign(day - dayLimit)
  )
}

export default class DateConverterChecks {
  isDateWithinValidRange(
    params: GregorianProps | JulianProps | SeBabylonianProps,
    earliestDate: CalendarProps,
    latestDate: CalendarProps,
  ): [boolean, boolean] {
    const [leftLimits, rightLimits] = [earliestDate, latestDate].map(
      (limitDate) => this.paramsToLimits(params, limitDate),
    )
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

  private paramsToYearMonthDay(
    params:
      | GregorianProps
      | JulianProps
      | SeBabylonianProps
      | { [k: string]: number },
  ): { year: number; month: number; day: number } {
    const result = { year: 0, month: 0, day: 0 }
    Object.keys(params).forEach((fieldName: string) => {
      if (fieldName.includes('Year')) {
        result.year = params[fieldName]
      } else if (fieldName.includes('Month')) {
        result.month = params[fieldName]
      } else {
        result.day = params[fieldName]
      }
    })
    return result
  }

  private paramsToLimits(
    params: GregorianProps | JulianProps | SeBabylonianProps,
    limitDate: CalendarProps,
  ): {
    yearLimit: number
    monthLimit: number
    dayLimit: number
  } {
    const filteredLimitDate = Object.fromEntries(
      Object.entries(limitDate).filter(([key]) =>
        Object.keys(params).includes(key),
      ),
    )
    const limitsYMD = this.paramsToYearMonthDay(filteredLimitDate)
    return {
      yearLimit: limitsYMD.year,
      monthLimit: limitsYMD.month,
      dayLimit: limitsYMD.day,
    }
  }

  private isDateBeforeValidRange(params: RangeParams): boolean {
    return compareToLimit(params) < 0
  }

  private isDateAfterValidRange(params: RangeParams): boolean {
    return compareToLimit(params) > 0
  }
}
