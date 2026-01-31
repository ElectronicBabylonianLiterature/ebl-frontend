import _ from 'lodash'
import { romanize } from 'romans'
import { MesopotamianDateBase } from 'chronology/domain/DateBase'
import { DateField, MonthField } from 'chronology/domain/DateParameters'
export class MesopotamianDateString extends MesopotamianDateBase {
  toString(): string {
    const dayMonthYear = this.dayMonthYearToString().join('.')
    const dateTail = `${this.kingEponymOrEraToString()}${this.ur3CalendarToString()}${this.modernDateToString()}`
    const joiner = dateTail.trim().startsWith(',') ? '' : ' '
    return [dayMonthYear, dateTail.trim()]
      .filter((string) => !_.isEmpty(string))
      .join(joiner)
  }

  private modernDateToString(): string {
    const julianDate = this.toModernDate('Julian')
    const gregorianDate = this.toModernDate('Gregorian')
    return julianDate &&
      gregorianDate &&
      gregorianDate.replace('PGC', 'PJC') !== julianDate
      ? ` (${[julianDate, gregorianDate].join(' | ')})`
      : julianDate
        ? ` (${julianDate})`
        : ''
  }

  private dayMonthYearToString(): string[] {
    const fields = ['day', 'month', this.yearZero ? 'yearZero' : 'year']
    const emptyParams = fields.map((field) => {
      const { isBroken, isUncertain, value } = this[field]
      return !isBroken && !isUncertain && _.isEmpty(value)
    })
    if (!emptyParams.includes(false)) {
      return []
    }
    return fields.map((field) =>
      this.datePartToString(field as 'year' | 'day' | 'month' | 'yearZero'),
    )
  }

  private parameterToString(
    field: 'year' | 'day' | 'month' | 'yearZero',
    element?: string,
  ): string {
    const parameter = this[field] as DateField | MonthField
    element =
      !_.isEmpty(element) && typeof element == 'string'
        ? element
        : !_.isEmpty(parameter.value)
          ? parameter.value
          : '∅'
    return this.brokenAndUncertainToString(field, element)
  }

  private brokenAndUncertainToString(
    field: 'year' | 'day' | 'month' | 'yearZero',
    element: string,
  ): string {
    const { isBroken, isUncertain, value } = this[field] as
      | DateField
      | MonthField
    let brokenIntercalary = ''
    if (isBroken && !value) {
      element = 'x'
      brokenIntercalary =
        field === 'month' && this.month.isIntercalary ? '²' : ''
    }
    return this.getBrokenAndUncertainString({
      element,
      brokenIntercalary,
      isBroken,
      isUncertain,
    })
  }

  private getBrokenAndUncertainString({
    element,
    brokenIntercalary = '',
    isBroken,
    isUncertain,
  }: {
    element: string
    brokenIntercalary?: string
    isBroken?: boolean
    isUncertain?: boolean
  }): string {
    return `${isBroken ? '[' : ''}${element}${
      isBroken ? ']' + brokenIntercalary : ''
    }${isUncertain ? '?' : ''}`
  }

  datePartToString(part: 'year' | 'month' | 'day' | 'yearZero'): string {
    if (part === 'month') {
      const month = Number(this.month.value)
        ? romanize(Number(this.month.value))
        : this.month.value
      const intercalary = this.month.isIntercalary ? '²' : ''
      return this.parameterToString('month', month + intercalary)
    }
    return this.parameterToString(part)
  }

  private eponymToString(): string {
    return `${this.getBrokenAndUncertainString({
      element: this?.eponym?.name ?? '',
      ...this?.eponym,
    })} (${this?.eponym?.phase} eponym)`
  }

  private kingToString(): string {
    return this.getBrokenAndUncertainString({
      element: this.zeroYearKing?.name ?? this.king?.name ?? '',
      ...this?.king,
    })
  }

  kingEponymOrEraToString(): string {
    if (this.isSeleucidEra) {
      return 'SE'
    } else if (this.isAssyrianDate && this.eponym?.name) {
      return this.eponymToString()
    } else if (this.king?.name) {
      return this.kingToString()
    }
    return ''
  }

  ur3CalendarToString(): string {
    return this.ur3Calendar ? `, ${this.ur3Calendar} calendar` : ''
  }
}
