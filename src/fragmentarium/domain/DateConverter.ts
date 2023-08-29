import data from 'fragmentarium/domain/dateConverterData.json'

interface CalendarProps {
  year: number
  month: number
  day: number
  cjdn: number
  weekDay: number
  i: number
  babylonianLunation: number
  babYear: number
  babMonth: number
  j: number
  regnalYear: number
}

export default class DateConverter {
  calendar = {
    year: 0,
    month: 0,
    day: 0,
    bcYear: '',
    julianDay: 0,
    weekDay: 0,
    babylonianDay: 0,
    babylonianMonth: 0,
    babylonianRuler: '',
    seBabylonianYear: '',
    seMacedonianYear: '',
    arsacidYear: '',
    babylonianLunation: 0,
    babylonianMonthLength: 0,
  }

  constructor() {
    this.setToModernDate(-310, 3, 3)
  }

  setToModernDate(year: number, month: number, day: number): void {
    this.applyModernDate({ year, month, day })
    this.updateBabylonDate()
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
    this.applyModernDate({ year, month, day: this.getCurrentDay() })
    this.updateBabylonDate()
  }

  offsetDay(offset: number): void {
    this.calendar.day += offset
    this.updateBabylonDate()
  }

  getCurrentDay(): number {
    return this.calendar.day
  }

  setBabylonianDate(
    babylonianYear: number,
    babylonianMonth: number,
    babylonianDay: number
  ): void {
    const cjdn = this.computeCJDNFromBabylonian(
      babylonianYear,
      babylonianMonth,
      babylonianDay
    )
    if (isNaN(cjdn)) {
      throw new Error(
        `Could not convert Babylonian date ${babylonianYear}/${babylonianMonth}/${babylonianDay} to a Julian date.`
      )
    }

    const [year, month, day] = this.computeModernDateFromCJDN(cjdn)
    if ([year, month, day].some(isNaN)) {
      throw new Error(`Could not convert Julian date ${cjdn} to a modern date.`)
    }

    this.applyModernDate({ year, month, day })
    this.updateBabylonDate()
  }

  private computeCJDNFromBabylonian(
    babylonianYear: number,
    babylonianMonth: number,
    babylonianDay: number
  ): number {
    const i = data.babylonYmPd.findIndex(
      (yearMonth) =>
        Math.floor(Math.abs(yearMonth)) >= babylonianYear &&
        Math.floor(
          100 * (Math.abs(yearMonth) - Math.floor(Math.abs(yearMonth))) + 0.001
        ) === babylonianMonth
    )

    if (i === -1) {
      throw new Error('Could not find matching Babylonian date in data.')
    }
    return data.babylonCjdnPd[i - 1] + babylonianDay - 1
  }

  private computeModernDateFromCJDN(cjdn: number): [number, number, number] {
    const b = cjdn + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const d = Math.floor(365.25 * c)
    const e = Math.floor((b - d) / 30.6001)

    const day = b - d - Math.floor(30.6001 * e)
    const month = e < 14 ? e - 1 : e - 13
    const year = month > 2 ? c - 4716 : c - 4715

    return [year, month, day]
  }

  updateBabylonDate(): void {
    const day = this.getCurrentDay()
    const { month, year } = this.calendar

    const cjdn = this.computeCJDNFromModernDate(year, month, day)
    const [yearValue, weekDay] = this.computeCalendarValues(cjdn)
    const [
      i,
      babylonianLunation,
      babYear,
      babMonth,
    ] = this.computeBabylonianValues(cjdn)
    const [j, regnalYear] = this.computeRegnalValues(i, babYear)

    this.updateCalendarProperties({
      year: yearValue,
      month,
      day,
      cjdn,
      weekDay,
      i,
      babylonianLunation,
      babYear,
      babMonth,
      j,
      regnalYear,
    })
  }

  private computeCJDNFromModernDate(
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

  private computeCalendarValues(cjdn: number): [number, number] {
    const b = cjdn + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const year = c - 4716
    const weekDay = ((cjdn + 1) % 7) + 1
    return [year, weekDay]
  }

  private computeBabylonianValues(
    cjdn: number
  ): [number, number, number, number] {
    const i = data.babylonCjdnPd.findIndex((cjdnPd) => cjdnPd > cjdn)
    const babylonianLunation = 1498 + i
    const babYearMonth = data.babylonYmPd[i - 1]
    const babYear =
      babYearMonth < 0 ? -Math.floor(-babYearMonth) : Math.floor(babYearMonth)
    const babMonth =
      babYearMonth < 0
        ? Math.floor(100 * (-babYearMonth + babYear) + 0.001)
        : Math.floor(100 * (babYearMonth - Math.floor(babYearMonth)) + 0.001)
    return [i, babylonianLunation, babYear, babMonth]
  }

  private computeRegnalValues(i: number, babYear: number): [number, number] {
    const j = data.babylonRulerYears.findIndex((year) => year > babYear)
    const regnalYear = babYear - data.babylonRulerYears[j - 1] + 1
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

  updateCalendarProperties(props: CalendarProps): void {
    this.calendar.julianDay = props.cjdn
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
    this.calendar.bcYear = year < 1 ? String(1 - year) : ' '
  }

  private applyBabylonianDate({
    cjdn,
    babYear,
    babylonianLunation,
    babMonth,
    regnalYear,
    i,
    j,
  }: Pick<
    CalendarProps,
    | 'cjdn'
    | 'babYear'
    | 'babylonianLunation'
    | 'babMonth'
    | 'regnalYear'
    | 'i'
    | 'j'
  >): void {
    const babylonianDay = cjdn - data.babylonCjdnPd[i - 1] + 1
    this.calendar.babylonianMonthLength =
      data.babylonCjdnPd[i] - data.babylonCjdnPd[i - 1]
    this.calendar.babylonianDay = babylonianDay
    this.calendar.babylonianMonth = babMonth
    this.calendar.babylonianRuler =
      babYear < 161 ? `${regnalYear} ${data.babylonRulerNames[j - 1]}` : ' '
    this.calendar.babylonianLunation = babylonianLunation
  }

  private applySeleucidDate({
    babYear,
    babMonth,
  }: Pick<CalendarProps, 'babYear' | 'babMonth'>): void {
    this.calendar.seBabylonianYear = String(babYear)
    this.calendar.seMacedonianYear = babYear < 1 ? ' ' : String(babYear)
    this.calendar.seMacedonianYear =
      babYear > 0 && babMonth < 7
        ? String(babYear)
        : babYear > -1 && babMonth > 6
        ? String(babYear + 1)
        : this.calendar.seMacedonianYear
    this.calendar.arsacidYear = babYear < 65 ? ' ' : String(babYear - 64)
  }

  /*
  private computeYearMonth(
    day: number,
    month: number,
    year: number
  ): [number, number] {
    const cjdn = this.computeCJDNFromModernDate(year, month, day)
    const [, , babYear, babMonth] = this.computeBabylonianValues(cjdn)
    return [babYear, babMonth]
  }*/
}