import data from 'fragmentarium/domain/dateConverterData.json'
import _ from 'lodash'

interface CalendarProps {
  year: number
  bcYear?: number
  month: number
  day: number
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
  year: number
  month: number
  day: number
  weekDay: number
  cjdn: number
  seBabylonianYear: number
  lunationNabonassar: number
  mesopotamianMonth: number
  regnalYear: number
  i: number
  j: number
}

export default class DateConverter {
  calendar: CalendarProps = {
    year: 0,
    month: 0,
    day: 0,
    cjdn: 0,
    weekDay: 0,
    mesopotamianMonth: 0,
    seBabylonianYear: 0,
    lunationNabonassar: 0,
  }

  constructor() {
    this.setToModernDate(-310, 3, 3)
  }

  toModernDateString(): string {
    const { day, month, year, bcYear } = this.calendar
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const suffix = year < 0 ? ' BCE' : ' CE'
    return `${day} ${monthNames[month - 1]} ${
      year < 0 ? bcYear : year
    }${suffix}`
  }

  offsetYear(offset: number): void {
    this.calendar.year += offset
    this.updateBabylonDate()
  }

  offsetMonth(offset: number): void {
    const yearOffset = this.calculateYearOffset(this.calendar.month, offset)
    const month = this.calculateNewMonth(this.calendar.month, offset)
    this.applyModernDate({
      year: this.calendar.year + yearOffset,
      month,
      day: this.calendar.day,
    })
    this.updateBabylonDate()
  }

  offsetDay(offset: number): void {
    this.calendar.day += offset
    this.updateBabylonDate()
  }

  setToModernDate(year: number, month: number, day: number): void {
    this.applyModernDate({ year, month, day })
    this.updateBabylonDate()
  }

  setSeBabylonianDate(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
    const cjdn = this.computeCjdnFromSeBabylonian(
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay
    )
    this.setFromCjdn(cjdn)
  }

  setMesopotamianDate(
    ruler: string,
    regnalYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
    const rulerIndex = data.rulerName.indexOf(ruler)
    if (rulerIndex === -1) throw new Error('Invalid ruler name.')

    const seBabylonianYear = data.rulerSeYears[rulerIndex] + regnalYear - 1
    const cjdn = this.computeCjdnFromSeBabylonian(
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay
    )
    this.setFromCjdn(cjdn)
  }

  private setFromCjdn(cjdn: number): void {
    const [year, month, day] = this.computeModernDateFromCjnd(cjdn)
    this.applyModernDate({ year, month, day })
    this.updateBabylonDate(cjdn)
  }

  private computeCjdnFromSeBabylonian(
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

  private computeModernDateFromCjnd(cjdn: number): [number, number, number] {
    const b = cjdn + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const d = Math.floor(365.25 * c)
    const e = Math.floor((b - d) / 30.6001)
    const day = b - d - Math.floor(30.6001 * e)
    const month = e < 14 ? e - 1 : e - 13
    const year = month > 2 ? c - 4716 : c - 4715
    return [year, month, day]
  }

  updateBabylonDate(
    cjdn: number = this.computeCjdnFromModernDate(
      this.calendar.year,
      this.calendar.month,
      this.calendar.day
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
      year: this.calendar.year,
      month: this.calendar.month,
      day: this.calendar.day,
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

  private computeCjdnFromModernDate(
    year: number,
    month: number,
    day: number
  ): number {
    return (
      Math.floor(365.25 * (month < 3 ? year - 1 : year + 4716)) +
      Math.floor(30.6001 * (month < 3 ? month + 12 : month + 1)) +
      day -
      1524
    )
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

  private calculateYearOffset(currentMonth: number, offset: number): number {
    return currentMonth + offset > 12 ? 1 : currentMonth + offset < 1 ? -1 : 0
  }

  private calculateNewMonth(currentMonth: number, offset: number): number {
    return ((currentMonth + offset + 11) % 12) + 1
  }

  updateCalendarProperties(props: CalendarUpdateProps): void {
    const { cjdn, weekDay, year, month, day } = props
    this.calendar.cjdn = cjdn
    this.calendar.weekDay = weekDay
    this.applyModernDate({ year, month, day })
    this.applyBabylonianDate(props)
    this.applySeleucidDate(props)
  }

  private applyModernDate({
    year,
    month,
    day,
  }: Pick<CalendarProps, 'year' | 'month' | 'day'>): void {
    this.calendar = {
      ...this.calendar,
      year,
      month,
      day,
      bcYear: year < 1 ? 1 - year : undefined,
    }
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
    const seMacedonianYear =
      seBabylonianYear > 0 && mesopotamianMonth < 7
        ? seBabylonianYear
        : seBabylonianYear > -1 && mesopotamianMonth > 6
        ? seBabylonianYear + 1
        : undefined
    const seArsacidYear =
      seBabylonianYear >= 65 ? seBabylonianYear - 64 : undefined
    this.calendar = {
      ...this.calendar,
      seBabylonianYear,
      seMacedonianYear,
      seArsacidYear,
    }
  }
}
