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

export interface DateRange {
  start: Date
  end: Date
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
    const { isBroken, isUncertain, value } = this[parameter]
    let brokenIntercalary = ''
    if (isBroken && !value) {
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
    const { year, month, day, isApproximate } = this.getDateApproximation()
    let result = ''
    if (this.isSeleucidEra && year > 0) {
      result = this.seleucidToModernDate(year, month, day, isApproximate)
    } else if (
      this.king?.orderGlobal &&
      Object.values(data.rulerToBrinkmanKings).includes(this.king?.orderGlobal)
    ) {
      result = this.nabonassarEraToModernDate(
        year > 0 ? year : 1,
        month,
        day,
        isApproximate
      )
    } else if (this.isAssyrianDate && this.eponym?.date) {
      result = `ca. ${this.eponym?.date} BCE`
    } else if (this.king?.date) {
      result = this.kingToModernDate(year)
    }
    return result
  }

  private insertDateApproximation(
    dateString: string,
    isApproximate: boolean
  ): string {
    return `${isApproximate ? 'ca. ' : ''}${dateString}`
  }

  private getDateApproximation(): {
    year: number
    month: number
    day: number
    isApproximate: boolean
  } {
    let year = parseInt(this.year.value)
    let month = parseInt(this.month.value)
    let day = parseInt(this.day.value)
    const isApproximate = this.isApproximate()
    if (isNaN(month)) {
      month = 1
    }
    if (isNaN(day)) {
      day = 1
    }
    if (isNaN(year)) {
      year = -1
    }
    return {
      year,
      month,
      day,
      isApproximate: isApproximate,
    }
  }

  private isApproximate(): boolean {
    return [
      _.some(
        [
          parseInt(this.year.value),
          parseInt(this.month.value),
          parseInt(this.day.value),
        ],
        _.isNaN
      ),
      [
        this.year.isBroken,
        this.month.isBroken,
        this.day.isBroken,
        this.year.isUncertain,
        this.month.isUncertain,
        this.day.isUncertain,
      ].includes(true),
    ].includes(true)
  }

  private seleucidToModernDate(
    year: number,
    month: number,
    day: number,
    isApproximate: boolean
  ): string {
    const converter = new DateConverter()
    converter.setSeBabylonianDate(year, month, day)
    return this.insertDateApproximation(
      converter.toModernDateString(),
      isApproximate
    )
  }

  private nabonassarEraToModernDate(
    year: number,
    month: number,
    day: number,
    isApproximate: boolean
  ): string {
    const kingName = Object.keys(data.rulerToBrinkmanKings).find(
      (key) => data.rulerToBrinkmanKings[key] === this.king?.orderGlobal
    )
    if (kingName) {
      const converter = new DateConverter()
      converter.setMesopotamianDate(kingName, year, month, day)
      return this.insertDateApproximation(
        converter.toModernDateString(),
        isApproximate
      )
    }
    return ''
  }
  private kingToModernDate(year: number): string {
    const firstReignYear = this.king?.date?.split('-')[0]
    return firstReignYear !== undefined && year > 0
      ? `ca. ${parseInt(firstReignYear) - year + 1} BCE`
      : this.king?.date && !['', '?'].includes(this.king?.date)
      ? `ca. ${this.king?.date} BCE`
      : ''
  }
}
