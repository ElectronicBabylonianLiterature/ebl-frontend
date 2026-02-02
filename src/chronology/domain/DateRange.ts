import { MesopotamianDateBase } from 'chronology/domain/DateBase'
import { DateType } from 'chronology/domain/DateParameters'
import DateConverter from './DateConverter'
import { CalendarProps } from './DateConverterBase'

export default class DateRange {
  start: CalendarProps
  end: CalendarProps
  private _converter: DateConverter

  constructor() {
    this._converter = new DateConverter()
    this.start = this._converter.calendar
    this.end = this._converter.calendar
  }

  toDateString(calendarType?: 'Julian' | 'Gregorian'): string {
    this._converter.setToCjdn(this.start.cjdn)
    const startDateString = this._converter.toDateString(calendarType)
    this._converter.setToCjdn(this.end.cjdn)
    const endDateString = this._converter.toDateString(calendarType)
    return `${this.getCompactStartDateString(
      startDateString,
      endDateString,
    )} - ${endDateString}`
  }

  private getCompactStartDateString(
    startDateString: string,
    endDateString: string,
  ): string {
    let startDateArray: string[] = []
    const endDateArray = endDateString.split(' ').reverse()
    const _startDateArray = startDateString.split(' ').reverse()
    for (const [index, startElement] of _startDateArray.entries()) {
      const endElement = endDateArray[index]
      if (startElement !== endElement) {
        startDateArray = _startDateArray.slice(index)
        break
      }
    }
    return startDateArray.reverse().join(' ')
  }

  private setToPartialDate(date: MesopotamianDateBase): void {
    const fieldsToUpdate = date.getEmptyFields()
    const defaultValues = this.getDefaultDateValues(date)
    const startDate = this.calculateDateValues(
      fieldsToUpdate,
      defaultValues,
      'start',
      date,
    )
    const endDate = this.calculateDateValues(
      fieldsToUpdate,
      defaultValues,
      'end',
      date,
    )
    this.setDateBasedOnType(date, startDate, 'start')
    this.setDateBasedOnType(date, endDate, 'end')
  }

  private getDefaultDateValues(date: MesopotamianDateBase): {
    year: number
    month: number
    day: number
  } {
    const parseValue = (value: { value: string }) => parseInt(value.value)
    return {
      year: parseValue(date.year),
      month: parseValue(date.month),
      day: parseValue(date.day),
    }
  }

  private calculateDateValues(
    fields: Array<'year' | 'month' | 'day'>,
    defaultValues: { year: number; month: number; day: number },
    type: 'start' | 'end',
    date: MesopotamianDateBase,
  ): { year: number; month: number; day: number } {
    return fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]:
          type === 'start'
            ? 1
            : parseInt(this.getEndValueForPartialDate(date, field)),
      }),
      defaultValues,
    )
  }

  private setDateBasedOnType(
    date: MesopotamianDateBase,
    dateValues: { year: number; month: number; day: number },
    position: 'start' | 'end',
  ): void {
    if (date.dateType === DateType.seleucidDate) {
      this._converter.setToSeBabylonianDate(
        dateValues.year,
        dateValues.month,
        dateValues.day,
      )
    } else if (date.dateType === DateType.nabonassarEraDate) {
      this._converter.setToMesopotamianDate(
        date.kingName as string,
        dateValues.year,
        dateValues.month,
        dateValues.day,
      )
    }
    this[position] = { ...this._converter.calendar }
  }

  private getEndValueForPartialDate(
    date: MesopotamianDateBase,
    field: 'year' | 'month' | 'day',
  ): string {
    const { dateType } = date
    if (dateType === DateType.seleucidDate) {
      return {
        year: () => `${this.seleucidRangeEndYear}`,
        month: () => `${this.getSeleucidDateEndMonth(date)}`,
        day: () => `${this.getSeleucidDateEndDay(date)}`,
      }[field]()
    } else if (dateType === DateType.nabonassarEraDate) {
      return {
        year: () => `${this.getNabonassarRangeEndYear(date)}`,
        month: () => `${this.getNabonassarDateEndMonth(date)}`,
        day: () => `${this.getNabonassarDateEndDay(date)}`,
      }[field]()
    }
    return ''
  }

  private get seleucidRangeEndYear(): number {
    return this._converter.latestDate.seBabylonianYear
  }

  private getSeleucidRangeEndYear(date: MesopotamianDateBase): number {
    return date.getEmptyFields().includes('year')
      ? this.seleucidRangeEndYear
      : parseInt(date.year.value)
  }

  private getSeleucidDateEndMonth(date: MesopotamianDateBase): number {
    const year = this.getSeleucidRangeEndYear(date)
    return date.getEmptyFields().includes('month')
      ? this._converter.getMesopotamianMonthsOfSeYear(year).slice(-1)[0].value
      : (parseInt(date.month.value) ?? 12)
  }

  private getSeleucidDateEndDay(date: MesopotamianDateBase): number {
    const year = this.getSeleucidRangeEndYear(date)
    const month = this.getSeleucidDateEndMonth(date)
    this._converter.setToSeBabylonianDate(year, month, 1)
    return this._converter.calendar.mesopotamianMonthLength ?? 28
  }

  private getNabonassarRangeEndYear(date: MesopotamianDateBase): number {
    if (!date.getEmptyFields().includes('year')) {
      return parseInt(date.year.value)
    }
    this._converter.setToMesopotamianDate(date.kingName as string, 1, 1, 1)
    return this._converter.calendar.regnalYears ?? 1
  }

  private getNabonassarDateEndMonth(date: MesopotamianDateBase): number {
    const year = this.getNabonassarRangeEndYear(date)
    this._converter.setToMesopotamianDate(date.kingName as string, year, 1, 1)
    return date.getEmptyFields().includes('month')
      ? this._converter.getMesopotamianMonthsOfSeYear(year).slice(-1)[0].value
      : parseInt(date.month.value)
  }

  private getNabonassarDateEndDay(date: MesopotamianDateBase): number {
    const year = this.getNabonassarRangeEndYear(date)
    const month = this.getNabonassarDateEndMonth(date)
    this._converter.setToMesopotamianDate(
      date.kingName as string,
      year,
      month,
      1,
    )
    return this._converter.calendar.mesopotamianMonthLength ?? 28
  }

  static getRangeFromPartialDate(date: MesopotamianDateBase): DateRange {
    const range = new DateRange()
    range.setToPartialDate(date)
    return range
  }
}
