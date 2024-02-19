import { King } from 'chronology/ui/Kings/Kings'
import { Eponym } from 'chronology/ui/DateEditor/Eponyms'
import DateConverter from 'chronology/domain/DateConverter'
import data from 'chronology/domain/dateConverterData.json'
import _ from 'lodash'

export interface DateField {
  value: string
  isBroken?: boolean
  isUncertain?: boolean
}

export interface MonthField extends DateField {
  isIntercalary?: boolean
}

export interface KingDateField extends King {
  isBroken?: boolean
  isUncertain?: boolean
}

export interface EponymDateField extends Eponym {
  isBroken?: boolean
  isUncertain?: boolean
}

interface DateProps {
  year: number
  month: number
  day: number
  isApproximate: boolean
  calendar: 'Julian' | 'Gregorian'
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

const calendarToAbbreviation = (calendar: 'Julian' | 'Gregorian'): string =>
  ({ Julian: 'PJC', Gregorian: 'PGC' }[calendar])

export class MesopotamianDateBase {
  year: DateField
  month: MonthField
  day: DateField
  king?: KingDateField
  eponym?: EponymDateField
  isSeleucidEra?: boolean
  isAssyrianDate?: boolean
  ur3Calendar?: Ur3Calendar

  constructor(
    year: DateField,
    month: MonthField,
    day: DateField,
    king?: KingDateField,
    eponym?: EponymDateField,
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

  private isSeleucidEraApplicable(year: number): boolean {
    return !!this.isSeleucidEra && year > 0
  }

  private isNabonassarEraApplicable(): boolean {
    return !!(
      this.king?.orderGlobal &&
      Object.values(data.rulerToBrinkmanKings).includes(this.king?.orderGlobal)
    )
  }

  private isAssyrianDateApplicable(): boolean {
    return !!(this.isAssyrianDate && this.eponym?.date)
  }

  private isKingDateApplicable(): boolean {
    return !!this.king?.date
  }

  toModernDate(calendar: 'Julian' | 'Gregorian' = 'Julian'): string {
    const { year, month, day, isApproximate } = this.getDateApproximation()
    const dateProps = {
      year,
      month,
      day,
      isApproximate,
      calendar,
    }
    let julianDate = ''
    if (this.isSeleucidEraApplicable(year)) {
      julianDate = this.seleucidToModernDate(dateProps)
    } else if (this.isNabonassarEraApplicable()) {
      julianDate = this.getNabonassarEraDate(dateProps)
    } else if (this.isAssyrianDateApplicable()) {
      julianDate = this.getAssyrianDate({ calendar: 'Julian' })
    } else if (this.isKingDateApplicable()) {
      julianDate = this.kingToModernDate({ year, calendar: 'Julian' })
    }
    return julianDate
  }

  private getNabonassarEraDate({
    year,
    month,
    day,
    isApproximate,
    calendar,
  }: DateProps): string {
    return this.nabonassarEraToModernDate({
      year: year > 0 ? year : 1,
      month,
      day,
      isApproximate,
      calendar,
    })
  }

  private getAssyrianDate({
    calendar = 'Julian',
  }: Pick<DateProps, 'calendar'>): string {
    return `ca. ${this.eponym?.date} BCE ${calendarToAbbreviation(calendar)}`
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

  private seleucidToModernDate({
    year,
    month,
    day,
    isApproximate,
    calendar,
  }: DateProps): string {
    const converter = new DateConverter()
    converter.setToSeBabylonianDate(year, month, day)
    return this.insertDateApproximation(
      converter.toDateString(calendar),
      isApproximate
    )
  }

  private nabonassarEraToModernDate({
    year,
    month,
    day,
    isApproximate,
    calendar,
  }: DateProps): string {
    const kingName = Object.keys(data.rulerToBrinkmanKings).find(
      (key) => data.rulerToBrinkmanKings[key] === this.king?.orderGlobal
    )
    if (kingName) {
      const converter = new DateConverter()
      converter.setToMesopotamianDate(kingName, year, month, day)
      return this.insertDateApproximation(
        converter.toDateString(calendar),
        isApproximate
      )
    }
    return ''
  }
  private kingToModernDate({
    year,
    calendar = 'Julian',
  }: Pick<DateProps, 'year' | 'calendar'>): string {
    const firstReignYear = this.king?.date?.split('-')[0]
    return firstReignYear !== undefined && year > 0
      ? `ca. ${
          parseInt(firstReignYear) - year + 1
        } BCE ${calendarToAbbreviation(calendar)}`
      : this.king?.date && !['', '?'].includes(this.king?.date)
      ? `ca. ${this.king?.date} BCE ${calendarToAbbreviation(calendar)}`
      : ''
  }

  private insertDateApproximation(
    dateString: string,
    isApproximate: boolean
  ): string {
    return `${isApproximate ? 'ca. ' : ''}${dateString}`
  }
}
