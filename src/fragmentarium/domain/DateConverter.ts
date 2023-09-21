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
    bcYear: 0,
    cjdn: 0,
    weekDay: 0,
    mesopotamianDay: 0,
    mesopotamianMonth: 0,
    ruler: '',
    seBabylonianYear: 0,
    seMacedonianYear: 0,
    seArsacidYear: 0,
    lunationNabonassar: 0,
    mesopotamianMonthLength: 0,
  }

  constructor() {
    this.setToModernDate(-310, 3, 3)
  }

  toModernDateString(): string {
    const { day, month, year, bcYear } = this.calendar
    const monthName = [
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
    ][month - 1]
    return year < 0
      ? `${[day, monthName, bcYear].join(' ')} BCE`
      : `${[day, monthName, year].join(' ')} CE`
  }

  offsetYear(offset: number): void {
    this.calendar.year += offset
    this.updateBabylonDate()
  }

  offsetMonth(offset: number): void {
    const { month: currentMonth } = this.calendar
    const yearOffset = this.calculateYearOffset(currentMonth, offset)
    const month = this.calculateNewMonth(currentMonth, offset)
    const year = this.calendar.year + yearOffset
    this.applyModernDate({ year, month, day: this.calendar.day })
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
    if (isNaN(cjdn)) {
      throw new Error(
        `Could not convert SE Babylonian date ${seBabylonianYear}/${mesopotamianMonth}/${mesopotamianDay} to a Julian date.`
      )
    }
    const [year, month, day] = this.computeModernDateFromCjnd(cjdn)
    if ([year, month, day].some(isNaN)) {
      throw new Error(`Could not convert Julian date ${cjdn} to a modern date.`)
    }
    this.applyModernDate({ year, month, day })
    this.updateBabylonDate()
  }

  setMesopotamianDate(
    ruler: string,
    regnalYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
    const rulerIndex = data.rulerName.indexOf(ruler)
    if (rulerIndex === -1) {
      throw new Error('Invalid ruler name.')
    }
    const rulerSeStartingYear = data.rulerSeYears[rulerIndex]
    const seBabylonainYear = rulerSeStartingYear + regnalYear - 1
    const i = data.seBabylonianYearMonthPeriod.findIndex((seYearMonth) =>
      _.isEqual(seYearMonth, [seBabylonainYear, mesopotamianMonth])
    )
    if (i === -1) {
      throw new Error('Could not find matching Babylonian date in data.')
    }
    const cjdn = data.babylonianCjdnPeriod[i] + mesopotamianDay - 1
    const [year, month, day] = this.computeModernDateFromCjnd(cjdn)
    if ([year, month, day].some(isNaN)) {
      throw new Error(`Could not convert Julian date ${cjdn} to a modern date.`)
    }
    this.applyModernDate({ year, month, day })
    this.updateBabylonDate(cjdn)
  }

  private computeCjdnFromSeBabylonian(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): number {
    const i = data.seBabylonianYearMonthPeriod.findIndex((yearMonth) =>
      _.isEqual(yearMonth, [seBabylonianYear, mesopotamianMonth])
    )
    if (i === -1) {
      throw new Error('Could not find matching Babylonian date in data.')
    }
    return data.babylonianCjdnPeriod[i] + mesopotamianDay - 1
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

  updateBabylonDate(cjdn?: number): void {
    const { month, year, day } = this.calendar
    cjdn = cjdn ?? this.computeCjdnFromModernDate(year, month, day)
    const weekDay = this.computeWeekDay(cjdn)
    const [
      i,
      lunationNabonassar,
      seBabylonianYear,
      mesopotamianMonth,
    ] = this.computeBabylonianValues(cjdn)
    const [j, regnalYear] = this.computeRegnalValues(seBabylonianYear)

    this.updateCalendarProperties({
      year,
      month,
      day,
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
    const babylonianLunation = 1498 + i
    const [
      seBabylonianYear,
      mesopotamianMonth,
    ] = data.seBabylonianYearMonthPeriod[i - 1]
    return [i, babylonianLunation, seBabylonianYear, mesopotamianMonth]
  }

  private computeRegnalValues(seBabylonianYear: number): [number, number] {
    const j = data.rulerSeYears.findIndex((year) => year > seBabylonianYear)
    const regnalYear = seBabylonianYear - data.rulerSeYears[j - 1] + 1
    return [j, regnalYear]
  }

  private calculateYearOffset(currentMonth: number, offset: number): number {
    if (offset > 0 && currentMonth + offset > 12) return 1
    if (offset < 0 && currentMonth + offset < 1) return -1
    return 0
  }

  private calculateNewMonth(currentMonth: number, offset: number): number {
    return (currentMonth + offset + 12) % 12 || 12
  }

  updateCalendarProperties(props: CalendarUpdateProps): void {
    this.calendar.cjdn = props.cjdn
    this.calendar.weekDay = props.weekDay
    this.applyModernDate(props)
    this.applyBabylonianDate(props)
    this.applySeleucidDate(props)
  }

  private applyModernDate({
    year,
    month,
    day,
  }: Pick<CalendarProps, 'year' | 'month' | 'day'>): void {
    this.calendar.year = year
    this.calendar.month = month
    this.calendar.day = day
    this.calendar.bcYear = year < 1 ? 1 - year : undefined
  }

  private applyBabylonianDate({
    cjdn,
    seBabylonianYear,
    lunationNabonassar,
    mesopotamianMonth,
    regnalYear,
    i,
    j,
  }: Pick<
    CalendarUpdateProps,
    | 'cjdn'
    | 'seBabylonianYear'
    | 'lunationNabonassar'
    | 'mesopotamianMonth'
    | 'regnalYear'
    | 'i'
    | 'j'
  >): void {
    const mesopotamianDay = cjdn - data.babylonianCjdnPeriod[i - 1] + 1
    this.calendar.mesopotamianMonthLength =
      data.babylonianCjdnPeriod[i] - data.babylonianCjdnPeriod[i - 1]
    this.calendar.mesopotamianDay = mesopotamianDay
    this.calendar.mesopotamianMonth = mesopotamianMonth
    this.calendar.ruler =
      seBabylonianYear < 161 ? data.rulerName[j - 1] : undefined
    this.calendar.regnalYear = regnalYear
    this.calendar.lunationNabonassar = lunationNabonassar
  }

  private applySeleucidDate({
    seBabylonianYear,
    mesopotamianMonth,
  }: Pick<CalendarProps, 'seBabylonianYear' | 'mesopotamianMonth'>): void {
    this.calendar.seBabylonianYear = seBabylonianYear
    this.calendar.seMacedonianYear =
      seBabylonianYear < 1 ? undefined : seBabylonianYear
    this.calendar.seMacedonianYear =
      seBabylonianYear > 0 && mesopotamianMonth < 7
        ? seBabylonianYear
        : seBabylonianYear > -1 && mesopotamianMonth > 6
        ? seBabylonianYear + 1
        : this.calendar.seMacedonianYear
    this.calendar.seArsacidYear =
      seBabylonianYear < 65 ? undefined : seBabylonianYear - 64
  }
}
