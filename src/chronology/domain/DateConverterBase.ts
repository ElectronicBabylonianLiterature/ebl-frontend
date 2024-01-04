import data from 'chronology/domain/dateConverterData.json'
import DateConverterCompute from './DateConverterCompute'

export const monthNames = [
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

export const weekDayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const babylonianMonths = [
  { name: 'Nisannu', number: 'I', value: 1 },
  { name: 'Ayyāru', number: 'II', value: 2 },
  { name: 'Simānu', number: 'III', value: 3 },
  { name: 'Duʾūzu', number: 'IV', value: 4 },
  { name: 'Abu', number: 'V', value: 5 },
  { name: 'Ulūlu', number: 'VI', value: 6 },
  { name: 'Tašrītu', number: 'VII', value: 7 },
  { name: 'Araḫsamna', number: 'VIII', value: 8 },
  { name: 'Kislīmu', number: 'IX', value: 9 },
  { name: 'Ṭebētu', number: 'X', value: 10 },
  { name: 'Šabāṭu', number: 'XI', value: 11 },
  { name: 'Addaru', number: 'XII', value: 12 },
  { name: 'Ulūlu II', number: 'VIb', value: 13 },
  { name: 'Addāru II', number: 'XIIb', value: 14 },
]

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

export default class DateConverterBase extends DateConverterCompute {
  getBcYear(year: number): number | undefined {
    return year < 1 ? 1 - year : undefined
  }

  private getDaysInMonth(year: number, isJulian: boolean): number[] {
    return [
      31,
      this.isLeapYear(year, isJulian) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ]
  }

  getMonthLength(isJulian = false): number {
    const { year, month } = this.getYearAndMonth(isJulian)
    return this.getDaysInMonth(year, isJulian)[month - 1]
  }

  getMesopotamianMonthsOfSeYear(
    seBabylonianYear: number
  ): { name: string; number: string; value: number }[] {
    return data.seBabylonianYearMonthPeriod
      .filter(
        (seBabylonianYearMonth) => seBabylonianYearMonth[0] === seBabylonianYear
      )
      .map(
        (seBabylonianYearMonth) =>
          babylonianMonths.find(
            (_month) => _month.value === seBabylonianYearMonth[1]
          ) ?? babylonianMonths[0]
      )
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

  private isLeapYear(year: number, isJulian = false): boolean {
    return isJulian
      ? year % 4 === 0
      : year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  }

  private getYearAndMonth(isJulian = false): { year: number; month: number } {
    return isJulian
      ? { year: this.calendar.julianYear, month: this.calendar.julianMonth }
      : {
          year: this.calendar.gregorianYear,
          month: this.calendar.gregorianMonth,
        }
  }
}
