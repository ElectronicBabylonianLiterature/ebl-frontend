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
    this.setToModernDate(-310, 3, 3)
  }

  toModernDateString(): string {
    const { day, month, year, bcYear } = this.calendar
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
    console.log('!!!', [year, month, day])
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
}
