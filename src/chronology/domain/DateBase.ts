import { King } from 'chronology/ui/BrinkmanKings'
import { Eponym } from 'chronology/ui/Eponyms'
import DateConverter from 'chronology/domain/DateConverter'
import data from 'chronology/domain/dateConverterData.json'
import _ from 'lodash'

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

export class MesopotamianDateBase {
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

  toJulianDate(): string {
    const { year, month, day, isApproximate } = this.getDateApproximation()

    if (this.isSeleucidEra && year > 0) {
      return this.getSeleucidEraDate(year, month, day, isApproximate)
    }

    if (
      this.king?.orderGlobal &&
      Object.values(data.rulerToBrinkmanKings).includes(this.king?.orderGlobal)
    ) {
      return this.getNabonassarEraDate(year, month, day, isApproximate)
    }

    if (this.isAssyrianDate && this.eponym?.date) {
      return this.getAssyrianDate()
    }

    if (this.king?.date) {
      return this.getKingDate(year)
    }
    return ''
  }

  private getSeleucidEraDate(
    year: number,
    month: number,
    day: number,
    isApproximate: boolean
  ): string {
    return this.seleucidToJulianDate(year, month, day, isApproximate)
  }

  private getNabonassarEraDate(
    year: number,
    month: number,
    day: number,
    isApproximate: boolean
  ): string {
    return this.nabonassarEraToJulianDate(
      year > 0 ? year : 1,
      month,
      day,
      isApproximate
    )
  }

  private getAssyrianDate(): string {
    return `ca. ${this.eponym?.date} BCE`
  }

  private getKingDate(year: number): string {
    return this.kingToJulianDate(year)
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

  private seleucidToJulianDate(
    year: number,
    month: number,
    day: number,
    isApproximate: boolean
  ): string {
    const converter = new DateConverter()
    converter.setToSeBabylonianDate(year, month, day)
    return this.insertDateApproximation(converter.toDateString(), isApproximate)
  }

  private nabonassarEraToJulianDate(
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
      converter.setToMesopotamianDate(kingName, year, month, day)
      return this.insertDateApproximation(
        converter.toDateString(),
        isApproximate
      )
    }
    return ''
  }
  private kingToJulianDate(year: number): string {
    const firstReignYear = this.king?.date?.split('-')[0]
    return firstReignYear !== undefined && year > 0
      ? `ca. ${parseInt(firstReignYear) - year + 1} BCE`
      : this.king?.date && !['', '?'].includes(this.king?.date)
      ? `ca. ${this.king?.date} BCE`
      : ''
  }
  private insertDateApproximation(
    dateString: string,
    isApproximate: boolean
  ): string {
    return `${isApproximate ? 'ca. ' : ''}${dateString}`
  }
}
