import { King } from 'chronology/ui/Kings/Kings'
import { Eponym } from 'chronology/ui/DateEditor/Eponyms'
import DateConverter from 'chronology/domain/DateConverter'
import data from 'chronology/domain/dateConverterData.json'
import _ from 'lodash'
import DateRange from './DateRange'

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

export enum DateType {
  seleucidDate = 'seleucidDate',
  nabonassarEraDate = 'nabonassarEraDate',
  assyrianDate = 'assyrianDate',
  kingDate = 'kingDate',
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
  range?: DateRange

  constructor({
    year,
    month,
    day,
    king,
    eponym,
    isSeleucidEra,
    isAssyrianDate,
    ur3Calendar,
  }: {
    year: DateField
    month: MonthField
    day: DateField
    king?: KingDateField
    eponym?: EponymDateField
    isSeleucidEra?: boolean
    isAssyrianDate?: boolean
    ur3Calendar?: Ur3Calendar
  }) {
    this.year = year
    this.month = month
    this.day = day
    this.king = king
    this.eponym = eponym
    this.isSeleucidEra = isSeleucidEra
    this.isAssyrianDate = isAssyrianDate
    this.ur3Calendar = ur3Calendar
    if (this.getEmptyOrBrokenFields().length > 0 && this.getType() !== null) {
      this.range = DateRange.getRangeFromPartialDate(this)
      console.log('!! Range:', this.range, this.range.toDateString())
    }
  }

  private isSeleucidEraApplicable(year?: number | string): boolean {
    year = typeof year === 'number' ? year : parseInt(year ?? '')
    return !!this.isSeleucidEra && !isNaN(year) && year > 0
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

  getType(): DateType | null {
    if (this?.year?.value && this.isSeleucidEraApplicable(this?.year?.value)) {
      return DateType.seleucidDate
    } else if (this.isNabonassarEraApplicable()) {
      return DateType.nabonassarEraDate
    } else if (this.isAssyrianDateApplicable()) {
      return DateType.assyrianDate
    } else if (this.isKingDateApplicable()) {
      return DateType.kingDate
    }
    return null
  }

  toModernDate(calendar: 'Julian' | 'Gregorian' = 'Julian'): string {
    const type = this.getType()
    if (type === null) {
      return ''
    }
    const dateProps = {
      ...this.getDateApproximation(),
      calendar,
    }
    const { year } = dateProps
    return {
      seleucidDate: () => this.seleucidToModernDate(dateProps),
      nabonassarEraDate: () =>
        this.nabonassarEraToModernDate({
          ...dateProps,
          year: year > 0 ? year : 1,
        }),
      assyrianDate: () => this.getAssyrianDate({ calendar: 'Julian' }),
      kingDate: () =>
        this.kingToModernDate({ ...dateProps, calendar: 'Julian' }),
    }[type]()
  }

  private getAssyrianDate({
    calendar = 'Julian',
  }: Pick<DateProps, 'calendar'>): string {
    return `ca. ${this.eponym?.date} BCE ${calendarToAbbreviation(calendar)}`
    // ToDo: Continue here
    // Calculate years in range if year is missing
  }

  private getDateApproximation(): {
    year: number
    month: number
    day: number
    isApproximate: boolean
  } {
    const year = parseInt(this.year.value)
    const month = parseInt(this.month.value)
    const day = parseInt(this.day.value)
    const isApproximate = this.isApproximate()
    // ToDo: Change this
    return {
      year: isNaN(year) ? -1 : year,
      month: isNaN(month) ? 1 : month,
      day: isNaN(day) ? 1 : day,
      isApproximate,
    }
  }

  getEmptyOrBrokenFields(): Array<'year' | 'month' | 'day'> {
    const fields: Array<'year' | 'month' | 'day'> = ['year', 'month', 'day']
    return fields
      .map((field) => {
        if (isNaN(parseInt(this[field].value)) || this[field].isBroken) {
          return field
        }
        return null
      })
      .filter((field) => !!field) as Array<'year' | 'month' | 'day'>
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
    // ToDo: Continue here
    // Use converter to compute earliest and latest dates in range
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
    if (this.kingName) {
      // ToDo: Continue here
      // Use converter to compute earliest and latest dates in range
      const converter = new DateConverter()
      converter.setToMesopotamianDate(this.kingName, year, month, day)
      return this.insertDateApproximation(
        converter.toDateString(calendar),
        isApproximate
      )
    }
    return ''
  }

  get kingName(): string | undefined {
    return Object.keys(data.rulerToBrinkmanKings).find(
      (key) => data.rulerToBrinkmanKings[key] === this.king?.orderGlobal
    )
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
    // ToDo: Continue here
    // Calculate years in range if year is missing
  }

  private insertDateApproximation(
    dateString: string,
    isApproximate: boolean
  ): string {
    return `${isApproximate ? 'ca. ' : ''}${dateString}`
  }
}
