import data from 'chronology/domain/dateConverterData.json'
import DateConverterBase, {
  CalendarProps,
  GregorianProps,
  JulianProps,
  SeBabylonianProps,
  monthNames,
} from 'chronology/domain/DateConverterBase'
import DateConverterChecks from 'chronology/domain/DateConverterChecks'
import { King, findKingByOrderGlobal } from 'chronology/ui/Kings/Kings'

export default class DateConverter extends DateConverterBase {
  checks: DateConverterChecks = new DateConverterChecks()
  earliestDate: CalendarProps
  latestDate: CalendarProps

  constructor() {
    super()
    this.setToEarliestDate()
    this.earliestDate = { ...this.calendar }
    this.setToLatestDate()
    this.latestDate = { ...this.calendar }
    this.setToJulianDate(-310, 4, 3)
  }

  toDateString(calendarType: 'Julian' | 'Gregorian' = 'Gregorian'): string {
    let {
      gregorianDay: day,
      gregorianMonth: month,
      gregorianYear: year,
      bcGregorianYear: bcYear,
    } = this.calendar
    if (calendarType === 'Julian') {
      day = this.calendar.julianDay
      month = this.calendar.julianMonth
      year = this.calendar.julianYear
      bcYear = this.calendar.bcJulianYear
    }
    const suffix = year < 1 ? ' BCE' : ' CE'
    return `${day} ${monthNames[month - 1]} ${
      year < 1 ? bcYear : year
    }${suffix}${calendarType === 'Julian' ? ' PJC' : ' PGC'}`
  }

  rulerToBrinkmanKings(ruler?: string): King | null {
    ruler = ruler ?? this.calendar?.ruler
    if (ruler) {
      const orderGlobal = data.rulerToBrinkmanKings[ruler]
      return findKingByOrderGlobal(orderGlobal)
    }
    return null
  }

  setToEarliestDate(): void {
    this.setToCjdn(1492871)
  }

  setToLatestDate(): void {
    this.setToCjdn(1748871)
  }

  setToEdgeIfOutsideRange(
    params: GregorianProps | JulianProps | SeBabylonianProps
  ): boolean {
    const rangeCheck = this.checks.isDateWithinValidRange(
      params,
      this.earliestDate,
      this.latestDate
    )
    if (rangeCheck.includes(false)) {
      if (rangeCheck[0] === false) {
        this.setToEarliestDate()
      } else {
        this.setToLatestDate()
      }
      return true
    }
    return false
  }

  setToGregorianDate(
    gregorianYear: number,
    gregorianMonth: number,
    gregorianDay: number
  ): void {
    const params = {
      gregorianYear,
      gregorianMonth,
      gregorianDay,
    }
    if (this.setToEdgeIfOutsideRange(params)) {
      return
    }
    const monthLength = this.getMonthLength(
      false,
      gregorianYear,
      gregorianMonth
    )
    const cjdn = this.computeCjdnFromGregorianDate({
      ...params,
      gregorianDay: gregorianDay <= monthLength ? gregorianDay : monthLength,
    })
    this.setToCjdn(cjdn)
  }

  setToJulianDate(
    julianYear: number,
    julianMonth: number,
    julianDay: number
  ): void {
    const params = { julianYear, julianMonth, julianDay }
    if (this.setToEdgeIfOutsideRange(params)) {
      return
    }
    const monthLength = this.getMonthLength(true, julianYear, julianMonth)
    this.applyDate(
      {
        year: julianYear,
        month: julianMonth,
        day: julianDay <= monthLength ? julianDay : monthLength,
      },
      'julian'
    )
    this.applyGregorianDateWhenJulian()
    this.updateBabylonianDate()
  }

  setToSeBabylonianDate(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
    const params = { seBabylonianYear, mesopotamianMonth, mesopotamianDay }
    if (this.setToEdgeIfOutsideRange(params)) {
      return
    }
    const monthLength = this.getMesopotamianSeMonthLength(
      seBabylonianYear,
      mesopotamianMonth
    )
    const cjdn = this.computeCjdnFromSeBabylonian(
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay <= monthLength ? mesopotamianDay : monthLength
    )
    this.setToCjdn(cjdn)
  }

  setToMesopotamianDate(
    ruler: string,
    regnalYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
    mesopotamianMonth = this.shiftMesopotamianMonthIfNoMatchFound(
      ruler,
      regnalYear,
      mesopotamianMonth
    )
    const rulerIndex = data.rulerName.indexOf(ruler)
    if (rulerIndex === -1) throw new Error('Invalid ruler name.')
    const seBabylonianYear = data.rulerSeYears[rulerIndex] + regnalYear - 1
    this.setToSeBabylonianDate(
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay
    )
  }

  setToCjdn(cjdn: number): void {
    this.applyDate(this.computeJulianDateFromCjnd(cjdn), 'julian')
    this.applyDate(this.computeGregorianDateFromCjdn(cjdn), 'gregorian')
    this.updateBabylonianDate(cjdn)
  }

  private shiftMesopotamianMonthIfNoMatchFound(
    ruler: string,
    regnalYear: number,
    mesopotamianMonth: number
  ): number {
    if ([13, 14].includes(mesopotamianMonth)) {
      this.setToMesopotamianDate(ruler, regnalYear, 1, 1)
      if (
        !this.checks.isIncomingDateHasCorrespondingIntercalary(
          mesopotamianMonth,
          this
        )
      ) {
        mesopotamianMonth =
          { 13: 6, 14: 12 }[mesopotamianMonth] ?? mesopotamianMonth
      }
    }
    return mesopotamianMonth
  }
}

Object.assign(DateConverter.prototype, DateConverterChecks.prototype)
