import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import _ from 'lodash'
import { romanize } from 'romans'
import { MesopotamianDateBase } from 'chronology/domain/DateBase'

export class MesopotamianDate extends MesopotamianDateBase {
  static fromJson(dateJson: MesopotamianDateDto): MesopotamianDate {
    const {
      year,
      month,
      day,
      eponym,
      king,
      isSeleucidEra,
      isAssyrianDate,
      ur3Calendar,
    } = dateJson
    return new MesopotamianDate(
      year,
      month,
      day,
      king,
      eponym,
      isSeleucidEra,
      isAssyrianDate,
      ur3Calendar
    )
  }

  toString(): string {
    const dayMonthYear = this.dayMonthYearToString().join('.')
    let julianDate = this.toJulianDate()
    julianDate = julianDate ? ` (${julianDate})` : ''
    const dateTail = `${this.kingEponymOrEraToString()}${this.ur3CalendarToString()}${julianDate}`
    console.log([dayMonthYear, dateTail].filter((string) => !_.isEmpty(string)))
    return [dayMonthYear, dateTail]
      .filter((string) => !_.isEmpty(string))
      .join(' ')
  }

  private dayMonthYearToString(): string[] {
    const fields = ['day', 'month', 'year']
    const emptyParams = fields.map((field) => {
      const { isBroken, isUncertain, value } = this[field]
      return !isBroken && !isUncertain && _.isEmpty(value)
    })
    console.log(emptyParams)
    if (!emptyParams.includes(false)) {
      return []
    }
    return fields.map((field) =>
      this.datePartToString(field as 'year' | 'day' | 'month')
    )
  }

  private parameterToString(
    field: 'year' | 'day' | 'month',
    element?: string
  ): string {
    element =
      !_.isEmpty(element) && typeof element == 'string'
        ? element
        : !_.isEmpty(this[field].value)
        ? this[field].value
        : '∅'
    return this.brokenAndUncertainToString(field, element)
  }

  private brokenAndUncertainToString(
    field: 'year' | 'day' | 'month',
    element: string
  ): string {
    const { isBroken, isUncertain, value } = this[field]
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

  datePartToString(part: 'year' | 'month' | 'day'): string {
    if (part === 'month') {
      const month = Number(this.month.value)
        ? romanize(Number(this.month.value))
        : this.month.value
      const intercalary = this.month.isIntercalary ? '²' : ''
      return this.parameterToString('month', month + intercalary)
    }
    return this.parameterToString(part)
  }

  kingEponymOrEraToString(): string {
    return this.isSeleucidEra
      ? 'SE'
      : this.isAssyrianDate && this.eponym?.name
      ? `${this.getBrokenAndUncertainString({
          element: this.eponym.name,
          ...this.eponym,
        })} (${this.eponym?.phase} eponym)`
      : this.king?.name
      ? this.getBrokenAndUncertainString({
          element: this.king.name,
          ...this.king,
        })
      : ''
  }

  ur3CalendarToString(): string {
    return this.ur3Calendar ? `, ${this.ur3Calendar} calendar` : ''
  }
}
