import { King } from 'common/BrinkmanKings'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import _ from 'lodash'
import { romanize } from 'romans'

export interface DateField {
  value: string
  isBroken?: boolean
  isUncertain?: boolean
}

export interface MonthField extends DateField {
  isIntercalary?: boolean
}

export enum Ur3Calendar {
  ADAB = 'Adab',
  GIRSU = 'Girsu',
  IRISAGRIG = 'Irisagrig',
  NIPPUR = 'Nippur',
  PUZRISHDAGAN = 'Puzriš-Dagan',
  UMMA = 'Umma',
  UR = 'Ur',
}

export class MesopotamianDate {
  year: DateField
  month: MonthField
  day: DateField
  king?: King
  isSeleucidEra?: boolean
  ur3Calendar?: Ur3Calendar

  constructor(
    year: DateField,
    month: MonthField,
    day: DateField,
    king?: King,
    isSeleucidEra?: boolean,
    ur3Calendar?: Ur3Calendar
  ) {
    this.year = year
    this.month = month
    this.day = day
    this.king = king
    this.isSeleucidEra = isSeleucidEra
    this.ur3Calendar = ur3Calendar
  }

  static fromJson(dateJSON: MesopotamianDateDto): MesopotamianDate {
    const { year, month, day, king, isSeleucidEra, ur3Calendar } = dateJSON
    return new MesopotamianDate(
      year,
      month,
      day,
      king,
      isSeleucidEra,
      ur3Calendar
    )
  }

  toString(): string {
    const dateParts = [
      this.dayToString(),
      this.monthToString(),
      this.yearToString(),
    ]
    return `${dateParts.join(
      '.'
    )}${this.kingOrEraToString()}${this.ur3CalendarToString()}`
  }

  private parameterToString(
    parameter: 'year' | 'day' | 'month',
    element?: string
  ): string {
    element =
      !_.isEmpty(element) && typeof element == 'string'
        ? element
        : !_.isEmpty(this[parameter].value)
        ? this[parameter].value
        : '∅'
    return this.brokenAndUncertainToString(parameter, element)
  }

  private brokenAndUncertainToString(
    parameter: 'year' | 'day' | 'month',
    element: string
  ): string {
    const { isBroken, isUncertain } = this[parameter]
    let brokenIntercalary = ''
    if (isBroken) {
      element = 'x'
      brokenIntercalary =
        parameter === 'month' && this.month.isIntercalary ? '²' : ''
    }
    return `${isBroken ? '[' : ''}${element}${
      isBroken ? ']' + brokenIntercalary : ''
    }${isUncertain ? '?' : ''}`
  }

  yearToString(): string {
    return this.parameterToString('year')
  }

  monthToString(): string {
    const month = Number(this.month.value)
      ? romanize(Number(this.month.value))
      : this.month.value
    const intercalary = this.month.isIntercalary ? '²' : ''
    return this.parameterToString('month', month + intercalary)
  }

  dayToString(): string {
    return this.parameterToString('day')
  }

  kingOrEraToString(): string {
    const eraOrKing = this.isSeleucidEra ? 'SE' : this.king?.name ?? ''
    return eraOrKing ? ' ' + eraOrKing : eraOrKing
  }

  ur3CalendarToString(): string {
    return this.ur3Calendar ? `, ${this.ur3Calendar} calendar` : ''
  }

  toGregorian(): string {
    // ToDo: WiP, implement
    return ''
  }
}
