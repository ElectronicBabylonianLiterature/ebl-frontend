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

  toJulianDateString(): string {
    const { julianDay, julianMonth, julianYear, bcJulianYear } = this.calendar
    const suffix = julianYear < 0 ? ' BCE' : ' CE'
    return `${julianDay} ${monthNames[julianMonth - 1]} ${
      julianYear < 0 ? bcJulianYear : julianYear
    }${suffix}`
  }

  setToGregorianDate(
    gregorianYear: number,
    gregorianMonth: number,
    gregorianDay: number
  ): void {
    this.applyGregorianDate({ gregorianYear, gregorianMonth, gregorianDay })
    this.updateBabylonianDate()
  }

  setToJulianDate(
    julianYear: number,
    julianMonth: number,
    julianDay: number
  ): void {
    this.applyJulianDate({ julianYear, julianMonth, julianDay })
    this.applyGregorianDateWhenJulian()
    this.updateBabylonianDate()
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
}
