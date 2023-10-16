import data from 'chronology/domain/dateConverterData.json'
import DateConverterBase from 'chronology/domain/DateConverterBase'

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

export default class DateConverter extends DateConverterBase {
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

  setToGregorianDate(
    gregorianYear: number,
    gregorianMonth: number,
    gregorianDay: number
  ): void {
    const cjdn = this.computeCjdnFromGregorianDate({
      gregorianYear,
      gregorianMonth,
      gregorianDay,
    })
    this.setToCjdn(cjdn)
  }

  setToJulianDate(
    julianYear: number,
    julianMonth: number,
    julianDay: number
  ): void {
    this.applyDate(
      { year: julianYear, month: julianMonth, day: julianDay },
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
    const cjdn = this.computeCjdnFromSeBabylonian(
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay
    )
    this.setToCjdn(cjdn)
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
    const cjdn = this.computeCjdnFromSeBabylonian(
      seBabylonianYear,
      mesopotamianMonth,
      mesopotamianDay
    )
    this.setToCjdn(cjdn)
  }

  setToCjdn(cjdn: number): void {
    this.applyDate(this.computeJulianDateFromCjnd(cjdn), 'julian')
    this.applyDate(this.computeGregorianDateFromCjdn(cjdn), 'gregorian')
    this.updateBabylonianDate(cjdn)
  }
}
