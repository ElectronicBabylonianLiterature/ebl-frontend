import data from 'chronology/domain/dateConverterData.json'
import DateConverterBase, {
  monthNames,
} from 'chronology/domain/DateConverterBase'
import DateConverterChecks from 'chronology/domain/DateConverterChecks'

export default class DateConverter extends DateConverterBase {
  checks: DateConverterChecks = new DateConverterChecks()

  constructor() {
    super()
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
    const suffix = year < 0 ? ' BCE' : ' CE'
    return `${day} ${monthNames[month - 1]} ${
      year < 0 ? bcYear : year
    }${suffix}${calendarType === 'Julian' ? ' PJC' : ' PGC'}`
  }

  setToEarliestDate(): void {
    this.setToCjdn(1492871)
  }

  setToLatestDate(): void {
    this.setToCjdn(1748871)
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
    if (this.checks.isGregorianDateBeforeValidRange(params)) {
      this.setToEarliestDate()
    } else if (this.checks.isGregorianDateAfterValidRange(params)) {
      this.setToLatestDate()
    } else {
      const cjdn = this.computeCjdnFromGregorianDate(params)
      this.setToCjdn(cjdn)
    }
  }

  setToJulianDate(
    julianYear: number,
    julianMonth: number,
    julianDay: number
  ): void {
    const params = { julianYear, julianMonth, julianDay }
    if (this.checks.isJulianDateBeforeValidRange(params)) {
      this.setToEarliestDate()
    } else if (this.checks.isJulianDateAfterValidRange(params)) {
      this.setToLatestDate()
    } else {
      this.applyDate(
        { year: julianYear, month: julianMonth, day: julianDay },
        'julian'
      )
      this.applyGregorianDateWhenJulian()
      this.updateBabylonianDate()
    }
  }

  setToSeBabylonianDate(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
    const params = { seBabylonianYear, mesopotamianMonth, mesopotamianDay }
    if (this.checks.isSeBabylonianDateBeforeValidRange(params)) {
      this.setToEarliestDate()
    } else if (this.checks.isSeBabylonianDateAfterValidRange(params)) {
      this.setToLatestDate()
    } else {
      const cjdn = this.computeCjdnFromSeBabylonian(
        seBabylonianYear,
        mesopotamianMonth,
        mesopotamianDay
      )
      this.setToCjdn(cjdn)
    }
  }

  setToMesopotamianDate(
    ruler: string,
    regnalYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  ): void {
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
}

Object.assign(DateConverter.prototype, DateConverterChecks.prototype)
