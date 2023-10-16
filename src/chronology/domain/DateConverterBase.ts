import data from 'chronology/domain/dateConverterData.json'
import _ from 'lodash'

export interface CalendarProps {
  gregorianYear: number
  bcGregorianYear?: number
  gregorianMonth: number
  gregorianDay: number
  julianYear: number
  bcJulianYear?: number
  julianMonth: number
  julianDay: number
  weekDay: number
  cjdn: number
  lunationNabonassar: number
  seBabylonianYear: number
  seMacedonianYear?: number
  seArsacidYear?: number
  mesopotamianMonth: number
  mesopotamianDay?: number
  mesopotamianMonthLength?: number
  ruler?: string
  regnalYear?: number
}

interface CalendarUpdateProps {
  julianYear: number
  julianMonth: number
  julianDay: number
  weekDay: number
  cjdn: number
  seBabylonianYear: number
  lunationNabonassar: number
  mesopotamianMonth: number
  ruler?: string
  regnalYear?: number
  i: number
}

function divmod(
  numerator: number,
  denominator: number
): { quotient: number; remainder: number } {
  const quotient = Math.floor(numerator / denominator)
  const remainder = numerator % denominator
  return { quotient, remainder }
}

export default class DateConverterBase {
  calendar: CalendarProps = {
    gregorianYear: 0,
    gregorianMonth: 0,
    gregorianDay: 0,
    julianYear: 0,
    julianMonth: 0,
    julianDay: 0,
    cjdn: 0,
    weekDay: 0,
    mesopotamianMonth: 0,
    seBabylonianYear: 0,
    lunationNabonassar: 0,
  }

  getBcYear(year: number): number | undefined {
    return year < 1 ? 1 - year : undefined
  }

  applyDate(
    { year, month, day }: { year: number; month: number; day: number },
    dateType: 'gregorian' | 'julian'
  ): void {
    const keyPrefix = dateType === 'gregorian' ? 'gregorian' : 'julian'
    const bcYearKey =
      dateType === 'gregorian' ? 'bcGregorianYear' : 'bcJulianYear'

    this.calendar = {
      ...this.calendar,
      [`${keyPrefix}Year`]: year,
      [`${keyPrefix}Month`]: month,
      [`${keyPrefix}Day`]: day,
      [bcYearKey]: this.getBcYear(year),
    }
  }

  applyGregorianDateWhenJulian(): void {
    const cjdn = this.computeCjdnFromJulianDate({ ...this.calendar })
    this.applyDate(this.computeGregorianDateFromCjdn(cjdn), 'gregorian')
  }

  computeCjdnFromSeBabylonian(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): number {
    const i = this.findIndexInSeBabylonianYearMonthPeriod([
      seBabylonianYear,
      mesopotamianMonth,
    ])
    return data.babylonianCjdnPeriod[i] + mesopotamianDay - 1
  }

  updateBabylonianDate(
    cjdn: number = this.computeCjdnFromJulianDate({ ...this.calendar })
  ): void {
    const weekDay = this.computeWeekDay(cjdn)
    const bablonianValues = this.computeBabylonianValues(cjdn)
    const { ruler, regnalYear } = this.computeRegnalValues(
      bablonianValues.seBabylonianYear
    )
    this.updateCalendarProperties({
      julianYear: this.calendar.julianYear,
      julianMonth: this.calendar.julianMonth,
      julianDay: this.calendar.julianDay,
      cjdn,
      weekDay,
      ruler,
      regnalYear,
      ...bablonianValues,
    })
  }

  computeJulianDateFromCjnd(
    cjdn: number
  ): { year: number; month: number; day: number } {
    const b = cjdn + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const d = Math.floor(365.25 * c)
    const e = Math.floor((b - d) / 30.6001)
    const day = b - d - Math.floor(30.6001 * e)
    const month = e < 14 ? e - 1 : e - 13
    const year = month > 2 ? c - 4716 : c - 4715
    return { year, month, day }
  }

  computeGregorianDateFromCjdn(
    cjdn: number
  ): { year: number; month: number; day: number } {
    const J0 = 1721120
    const s = cjdn - J0
    const alpha1 = Math.floor((400 * s + 799) / 146097)
    const sTmp =
      s -
      365 * alpha1 -
      Math.floor(alpha1 / 4) +
      Math.floor(alpha1 / 100) -
      Math.floor(alpha1 / 400)
    const alpha2 = Math.floor(sTmp / 367)
    const a1 = alpha1 + alpha2
    const { quotient: m1, remainder: epsilon1 } = divmod(
      5 *
        (s -
          365 * a1 -
          Math.floor(a1 / 4) +
          Math.floor(a1 / 100) -
          Math.floor(a1 / 400)) +
        2,
      153
    )
    const { quotient: alpha2b, remainder: m0 } = divmod(m1 + 2, 12)
    return {
      year: a1 + alpha2b < 1 ? a1 + alpha2b + 1 : a1 + alpha2b,
      month: m0 + 1,
      day: Math.floor(epsilon1 / 5) + 1,
    }
  }

  private computeCjdnFromJulianDate({
    julianYear,
    julianMonth,
    julianDay,
  }: {
    julianYear: number
    julianMonth: number
    julianDay: number
  }): number {
    if (julianMonth < 3) {
      julianYear -= 1
      julianMonth += 12
      this.calendar = { ...this.calendar, julianMonth }
    }
    const cjdn =
      Math.floor(365.25 * (julianYear + 4716)) +
      Math.floor(30.6001 * (julianMonth + 1)) +
      julianDay -
      1524
    return cjdn
  }

  //ToDo: Check, (update), use!
  computeCjdnFromGregorianDate({
    gregorianYear,
    gregorianMonth,
    gregorianDay,
  }: {
    gregorianYear: number
    gregorianMonth: number
    gregorianDay: number
  }): number {
    const alpha1 = Math.floor((gregorianMonth - 3) / 12)
    const m1 = gregorianMonth + alpha1
    const a1 = gregorianYear + alpha1
    return (
      365 * a1 +
      Math.floor(a1 / 4) -
      Math.floor(a1 / 100) +
      Math.floor(a1 / 400) +
      Math.floor((153 * m1 + 2) / 5) +
      gregorianDay +
      1721119
    )
  }

  private computeWeekDay(cjdn: number): number {
    return ((cjdn + 1) % 7) + 1
  }

  private computeBabylonianValues(
    cjdn: number
  ): {
    i: number
    lunationNabonassar: number
    seBabylonianYear: number
    mesopotamianMonth: number
  } {
    const i = data.babylonianCjdnPeriod.findIndex((cjdnPd) => cjdnPd > cjdn)
    const [
      seBabylonianYear,
      mesopotamianMonth,
    ] = data.seBabylonianYearMonthPeriod[i - 1]
    return {
      i,
      lunationNabonassar: 1498 + i,
      seBabylonianYear,
      mesopotamianMonth,
    }
  }

  private computeRegnalValues(
    seBabylonianYear: number
  ): { ruler?: string; regnalYear: number } {
    const j = data.rulerSeYears.findIndex((year) => year > seBabylonianYear)
    const ruler = seBabylonianYear < 161 ? data.rulerName[j - 1] : undefined
    const regnalYear = seBabylonianYear - data.rulerSeYears[j - 1] + 1
    return { ruler, regnalYear }
  }

  private updateCalendarProperties(props: CalendarUpdateProps): void {
    const { cjdn, weekDay, julianYear, julianMonth, julianDay } = props
    this.calendar.cjdn = cjdn
    this.calendar.weekDay = weekDay
    this.applyDate(
      { year: julianYear, month: julianMonth, day: julianDay },
      'julian'
    )
    this.applyBabylonianDate(props)
    this.applySeleucidDate(props)
  }

  private applyBabylonianDate(props: CalendarUpdateProps): void {
    const { cjdn, mesopotamianMonth, i, ruler, regnalYear } = props
    const mesopotamianDay = cjdn - data.babylonianCjdnPeriod[i - 1] + 1
    const mesopotamianMonthLength =
      data.babylonianCjdnPeriod[i] - data.babylonianCjdnPeriod[i - 1]
    const lunationNabonassar = 1498 + i
    this.calendar = {
      ...this.calendar,
      mesopotamianDay,
      mesopotamianMonthLength,
      mesopotamianMonth,
      ruler,
      regnalYear,
      lunationNabonassar,
    }
  }

  private applySeleucidDate(props: CalendarUpdateProps): void {
    const { seBabylonianYear, mesopotamianMonth } = props
    const seMacedonianYear = this.calculateSeMacedonianYear(
      seBabylonianYear,
      mesopotamianMonth
    )
    const seArsacidYear = this.calculateSeArsacidYear(seBabylonianYear)
    this.calendar = {
      ...this.calendar,
      seBabylonianYear,
      seMacedonianYear,
      seArsacidYear,
    }
  }

  private calculateSeMacedonianYear(
    seBabylonianYear: number,
    mesopotamianMonth: number
  ): number | undefined {
    if (seBabylonianYear > 0 && mesopotamianMonth < 7) {
      return seBabylonianYear
    }
    if (seBabylonianYear > -1 && mesopotamianMonth > 6) {
      return seBabylonianYear + 1
    }
    return undefined
  }

  private calculateSeArsacidYear(seBabylonianYear: number): number | undefined {
    return seBabylonianYear >= 65 ? seBabylonianYear - 64 : undefined
  }

  private findIndexInSeBabylonianYearMonthPeriod(
    yearMonth: [number, number]
  ): number {
    const i = data.seBabylonianYearMonthPeriod.findIndex((ym) =>
      _.isEqual(ym, yearMonth)
    )
    if (i === -1)
      throw new Error('Could not find matching Babylonian date in data.')
    return i
  }
}
