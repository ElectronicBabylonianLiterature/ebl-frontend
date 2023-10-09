import data from 'chronology/domain/dateConverterData.json'
import _ from 'lodash'

export interface CalendarProps {
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
  regnalYear: number
  i: number
  j: number
}

export default class DateConverterBase {
  calendar: CalendarProps = {
    julianYear: 0,
    julianMonth: 0,
    julianDay: 0,
    cjdn: 0,
    weekDay: 0,
    mesopotamianMonth: 0,
    seBabylonianYear: 0,
    lunationNabonassar: 0,
  }

  setFromCjdn(cjdn: number): void {
    const [julianYear, julianMonth, julianDay] = this.computeJulianDateFromCjnd(
      cjdn
    )
    this.applyJulianDate({ julianYear, julianMonth, julianDay })
    this.updateBabylonianDate(cjdn)
  }

  applyJulianDate({
    julianYear,
    julianMonth,
    julianDay,
  }: Pick<CalendarProps, 'julianYear' | 'julianMonth' | 'julianDay'>): void {
    this.calendar = {
      ...this.calendar,
      julianYear,
      julianMonth,
      julianDay,
      bcJulianYear: julianYear < 1 ? 1 - julianYear : undefined,
    }
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

  calculateYearOffset(currentMonth: number, offset: number): number {
    return currentMonth + offset > 12 ? 1 : currentMonth + offset < 1 ? -1 : 0
  }

  calculateNewMonth(currentMonth: number, offset: number): number {
    return ((currentMonth + offset + 11) % 12) + 1
  }

  updateBabylonianDate(
    cjdn: number = this.computeCjdnFromJulianDate(
      this.calendar.julianYear,
      this.calendar.julianMonth,
      this.calendar.julianDay
    )
  ): void {
    const weekDay = this.computeWeekDay(cjdn)
    const [
      i,
      lunationNabonassar,
      seBabylonianYear,
      mesopotamianMonth,
    ] = this.computeBabylonianValues(cjdn)
    const [j, regnalYear] = this.computeRegnalValues(seBabylonianYear)
    this.updateCalendarProperties({
      julianYear: this.calendar.julianYear,
      julianMonth: this.calendar.julianMonth,
      julianDay: this.calendar.julianDay,
      cjdn,
      weekDay,
      lunationNabonassar,
      seBabylonianYear,
      mesopotamianMonth,
      regnalYear,
      i,
      j,
    })
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

  private computeJulianDateFromCjnd(cjdn: number): [number, number, number] {
    const b = cjdn + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const d = Math.floor(365.25 * c)
    const e = Math.floor((b - d) / 30.6001)
    const julianDay = b - d - Math.floor(30.6001 * e)
    const julianMonth = e < 14 ? e - 1 : e - 13
    const julianYear = julianMonth > 2 ? c - 4716 : c - 4715
    return [julianYear, julianMonth, julianDay]
  }

  private computeCjdnFromJulianDate(
    julianYear: number,
    julianMonth: number,
    julianDay: number
  ): number {
    if (julianMonth < 3) {
      julianYear -= 1
      julianMonth += 12
    }
    const cjdn =
      Math.floor(365.25 * (julianYear + 4716)) +
      Math.floor(30.6001 * (julianMonth + 1)) +
      julianDay -
      1524
    console.log('!!', cjdn)
    return cjdn
  }

  private computeCjdnFromGregorianDate(
    gregorianYear: number,
    gregorianMonth: number,
    gregorianDay: number
  ): number {
    //ToDo: Fix? Check.
    if (
      gregorianMonth < 1 ||
      gregorianMonth > 12 ||
      gregorianDay < 1 ||
      gregorianDay > 31
    ) {
      throw new Error('Invalid date')
    }

    const a = Math.floor((14 - gregorianMonth) / 12)
    const y = gregorianYear + 4800 - a
    const m = gregorianMonth + 12 * a - 3
    const jdn =
      gregorianDay +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    return Math.floor(jdn)
  }

  private computeWeekDay(cjdn: number): number {
    return ((cjdn + 1) % 7) + 1
  }

  private computeBabylonianValues(
    cjdn: number
  ): [number, number, number, number] {
    const i = data.babylonianCjdnPeriod.findIndex((cjdnPd) => cjdnPd > cjdn)
    const [
      seBabylonianYear,
      mesopotamianMonth,
    ] = data.seBabylonianYearMonthPeriod[i - 1]
    return [i, 1498 + i, seBabylonianYear, mesopotamianMonth]
  }

  private computeRegnalValues(seBabylonianYear: number): [number, number] {
    const j = data.rulerSeYears.findIndex((year) => year > seBabylonianYear)
    return [j, seBabylonianYear - data.rulerSeYears[j - 1] + 1]
  }

  private updateCalendarProperties(props: CalendarUpdateProps): void {
    const { cjdn, weekDay, julianYear, julianMonth, julianDay } = props
    this.calendar.cjdn = cjdn
    this.calendar.weekDay = weekDay
    this.applyJulianDate({ julianYear, julianMonth, julianDay })
    this.applyBabylonianDate(props)
    this.applySeleucidDate(props)
  }

  private applyBabylonianDate(props: CalendarUpdateProps): void {
    const { cjdn, seBabylonianYear, mesopotamianMonth, i, j } = props
    const mesopotamianDay = cjdn - data.babylonianCjdnPeriod[i - 1] + 1
    const mesopotamianMonthLength =
      data.babylonianCjdnPeriod[i] - data.babylonianCjdnPeriod[i - 1]
    const ruler = seBabylonianYear < 161 ? data.rulerName[j - 1] : undefined
    const regnalYear = seBabylonianYear - data.rulerSeYears[j - 1] + 1
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
}
