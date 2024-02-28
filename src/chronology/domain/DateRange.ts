import { DateType, MesopotamianDateBase } from 'chronology/domain/DateBase'
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
    const endDateArray = endDateString.split(' ').reverse()
    const startDateArray: string[] = []
    for (const [index, startElement] of startDateString
      .split(' ')
      .reverse()
      .entries()) {
      const endElement = endDateArray[index]
      if (startElement !== endElement) {
        startDateArray.push(startElement)
      }
    }
    // ToDo: Continue here. Verify that it works as expected
    return `${startDateArray.reverse().join(' ')} - ${endDateString}`
  }

  private setToPartialDate(date: MesopotamianDateBase): void {
    const fieldsToUpdate = date.getEmptyOrBrokenFields()
    const defaultValues = this.getDefaultDateValues(date)

    const startDate = this.calculateDateValues(
      fieldsToUpdate,
      defaultValues,
      'start',
      date
    )
    const endDate = this.calculateDateValues(
      fieldsToUpdate,
      defaultValues,
      'end',
      date
    )

    this.setDateBasedOnType(date, startDate, 'start')
    this.setDateBasedOnType(date, endDate, 'end')
  }

  private getDefaultDateValues(
    date: MesopotamianDateBase
  ): { year: number; month: number; day: number } {
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
    date: MesopotamianDateBase
  ): { year: number; month: number; day: number } {
    return fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]:
          type === 'start'
            ? 1
            : parseInt(this.getEndValueForPartialDate(date, field)),
      }),
      defaultValues
    )
  }

  private setDateBasedOnType(
    date: MesopotamianDateBase,
    dateValues: { year: number; month: number; day: number },
    type: 'start' | 'end'
  ): void {
    if (date.getType() === DateType.seleucidDate) {
      this._converter.setToSeBabylonianDate(
        dateValues.year,
        dateValues.month,
        dateValues.day
      )
    } else if (date.getType() === DateType.nabonassarEraDate) {
      this._converter.setToMesopotamianDate(
        date.kingName as string,
        dateValues.year,
        dateValues.month,
        dateValues.day
      )
    }

    this[type] = { ...this._converter.calendar }
  }

  private getEndValueForPartialDate(
    date: MesopotamianDateBase,
    field: 'year' | 'month' | 'day'
  ): string {
    const dateType = date.getType()
    if (dateType === DateType.seleucidDate) {
      return {
        year: () => `${this.seleucidRangeEndYear}`,
        month: () => `${this.getSeleucidDateEndMonth(date)}`,
        day: () => `${this.getSeleucidDateEndDay(date)}`,
      }[field]()
    } else if (DateType.nabonassarEraDate) {
      return {
        year: () => `${this.getNabonassarRangeEndYear}`,
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
    return date.getEmptyOrBrokenFields().includes('year')
      ? this.seleucidRangeEndYear
      : parseInt(date.year.value)
  }

  private getSeleucidDateEndMonth(date: MesopotamianDateBase): number {
    const year = this.getSeleucidRangeEndYear(date)
    return date.getEmptyOrBrokenFields().includes('month')
      ? this._converter.getMesopotamianMonthsOfSeYear(year).length
      : parseInt(date.month.value)
  }

  private getSeleucidDateEndDay(date: MesopotamianDateBase): number {
    const year = this.getSeleucidRangeEndYear(date)
    const month = this.getSeleucidDateEndMonth(date)
    this._converter.setToSeBabylonianDate(year, month, 1)
    return this._converter.calendar.mesopotamianMonthLength ?? 29
  }

  private get nabonassarRangeEndYear(): number {
    return this._converter.latestDate.regnalYears ?? 1
  }

  private getNabonassarRangeEndYear(date: MesopotamianDateBase): number {
    return date.getEmptyOrBrokenFields().includes('year')
      ? this.nabonassarRangeEndYear
      : parseInt(date.year.value)
  }

  private getNabonassarDateEndMonth(date: MesopotamianDateBase): number {
    const year = this.getNabonassarRangeEndYear(date)
    this._converter.setToMesopotamianDate(date.kingName as string, year, 1, 1)
    return date.getEmptyOrBrokenFields().includes('month')
      ? this._converter.getMesopotamianMonthsOfSeYear(
          this._converter.calendar.seBabylonianYear
        ).length
      : parseInt(date.month.value)
  }

  private getNabonassarDateEndDay(date: MesopotamianDateBase): number {
    const year = this.getNabonassarRangeEndYear(date)
    const month = this.getNabonassarDateEndMonth(date)
    this._converter.setToMesopotamianDate(
      date.kingName as string,
      year,
      month,
      1
    )
    return this._converter.calendar.mesopotamianMonthLength ?? 29
  }

  static getRangeFromPartialDate(date: MesopotamianDateBase): DateRange {
    const range = new DateRange()
    range.setToPartialDate(date)
    return range
  }
}
