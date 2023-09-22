import { King } from 'common/BrinkmanKings'
import { Eponym } from 'common/Eponyms'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import _ from 'lodash'
import { romanize } from 'romans'
import DateConverter from 'fragmentarium/domain/DateConverter'
import data from 'fragmentarium/domain/dateConverterData.json'

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
  eponym?: Eponym
  isSeleucidEra?: boolean
  isAssyrianDate?: boolean
  ur3Calendar?: Ur3Calendar

  constructor(
    year: DateField,
    month: MonthField,
    day: DateField,
    king?: King,
    eponym?: Eponym,
    isSeleucidEra?: boolean,
    isAssyrianDate?: boolean,
    ur3Calendar?: Ur3Calendar
  ) {
    this.year = year
    this.month = month
    this.day = day
    this.king = king
    this.eponym = eponym
    this.isSeleucidEra = isSeleucidEra
    this.isAssyrianDate = isAssyrianDate
    this.ur3Calendar = ur3Calendar
  }

  static fromJson(dateJSON: MesopotamianDateDto): MesopotamianDate {
    const {
      year,
      month,
      day,
      eponym,
      king,
      isSeleucidEra,
      isAssyrianDate,
      ur3Calendar,
    } = dateJSON
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
    const dateParts = [
      this.dayToString(),
      this.monthToString(),
      this.yearToString(),
    ]
    let modernDate = this.toModernDate()
    modernDate = modernDate ? ` (${modernDate})` : ''
    return `${dateParts.join(
      '.'
    )}${this.kingEponymOrEraToString()}${this.ur3CalendarToString()}${modernDate}`
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

  kingEponymOrEraToString(): string {
    const eraEponymOrKing = this.isSeleucidEra
      ? 'SE'
      : this.isAssyrianDate && this.eponym?.name
      ? `${this.eponym?.name} (${this.eponym?.phase} eponym)`
      : this.king?.name ?? ''
    return eraEponymOrKing ? ' ' + eraEponymOrKing : eraEponymOrKing
  }

  ur3CalendarToString(): string {
    return this.ur3Calendar ? `, ${this.ur3Calendar} calendar` : ''
  }

  toModernDate(): string {
    const year = parseInt(this.year.value)
    const month = parseInt(this.month.value)
    const day = parseInt(this.day.value)
    return this.isSeleucidEra === true
      ? this.seleucidToModernDate(year, month, day)
      : this.king?.orderGlobal &&
        Object.values(data.rulerToBrinkmanKings).includes(
          this.king?.orderGlobal
        )
      ? this.nabonassarEraToModernDate(year, month, day)
      : this.isAssyrianDate && this.eponym?.date
      ? `ca. ${this.eponym?.date} BCE`
      : this.king?.date
      ? this.kingToModernDate(year)
      : ''
  }

  private seleucidToModernDate(
    year: number,
    month: number,
    day: number
  ): string {
    const converter = new DateConverter()
    converter.setSeBabylonianDate(year, month, day)
    return converter.toModernDateString()
  }

  private nabonassarEraToModernDate(
    year: number,
    month: number,
    day: number
  ): string {
    const kingName = Object.keys(data.rulerToBrinkmanKings).find(
      (key) => data.rulerToBrinkmanKings[key] === this.king?.orderGlobal
    )
    if (kingName) {
      const converter = new DateConverter()
      converter.setMesopotamianDate(kingName, year, month, day)
      return converter.toModernDateString()
    }
    return ''
  }
  private kingToModernDate(year?: number): string {
    const firstReignYear = this.king?.date?.split('-')[0]
    return firstReignYear !== undefined && year && !this.year.isBroken
      ? `ca. ${parseInt(firstReignYear) - year + 1} BCE`
      : this.king?.date && !['', '?'].includes(this.king?.date)
      ? `ca. ${this.king?.date} BCE`
      : ''
  }
}
