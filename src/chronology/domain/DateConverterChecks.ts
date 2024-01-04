interface GregorianParams {
  gregorianYear: number
  gregorianMonth: number
  gregorianDay: number
}

interface JulianParams {
  julianYear: number
  julianMonth: number
  julianDay: number
}

interface SeBabylonianParams {
  seBabylonianYear: number
  mesopotamianMonth: number
  mesopotamianDay: number
}

interface RangeParams {
  year: number
  month: number
  day: number
  yearLimit: number
  monthLimit: number
  dayLimit: number
}

export default class DateConverterChecks {
  private paramsToYearMonthDay(
    params: GregorianParams | JulianParams | SeBabylonianParams
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

  isGregorianDateBeforeValidRange(params: GregorianParams): boolean {
    const limits = {
      yearLimit: -624,
      monthLimit: 3,
      dayLimit: 29,
    }
    return this.isDateBeforeValidRange({
      ...this.paramsToYearMonthDay(params),
      ...limits,
    })
  }

  isGregorianDateAfterValidRange(params: GregorianParams): boolean {
    const limits = { yearLimit: 76, monthLimit: 2, dayLimit: 22 }
    return this.isDateAfterValidRange({
      ...this.paramsToYearMonthDay(params),
      ...limits,
    })
  }

  isJulianDateBeforeValidRange(params: JulianParams): boolean {
    const limits = {
      yearLimit: -625,
      monthLimit: 4,
      dayLimit: 5,
    }
    return this.isDateBeforeValidRange({
      ...this.paramsToYearMonthDay(params),
      ...limits,
    })
  }

  isJulianDateAfterValidRange(params: JulianParams): boolean {
    const limits = { yearLimit: 76, monthLimit: 2, dayLimit: 24 }
    return this.isDateAfterValidRange({
      ...this.paramsToYearMonthDay(params),
      ...limits,
    })
  }

  isSeBabylonianDateBeforeValidRange(params: SeBabylonianParams): boolean {
    const limits = { yearLimit: -314, monthLimit: 1, dayLimit: 1 }
    return this.isDateBeforeValidRange({
      ...this.paramsToYearMonthDay(params),
      ...limits,
    })
  }

  isSeBabylonianDateAfterValidRange(params: SeBabylonianParams): boolean {
    const limits = { yearLimit: 386, monthLimit: 2, dayLimit: 30 }
    return this.isDateAfterValidRange({
      ...this.paramsToYearMonthDay(params),
      ...limits,
    })
  }

  isDateBeforeValidRange({
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

  isDateAfterValidRange({
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
