import DateConverter from 'chronology/domain/DateConverter'
import data from 'chronology/domain/dateConverterData.json'
import DateRange from 'chronology/domain/DateRange'
import {
  DateField,
  DateProps,
  DateType,
  EponymDateField,
  KingDateField,
  ModernCalendar,
  MonthField,
  Ur3Calendar,
  YearMonthDay,
} from 'chronology/domain/DateParameters'
import normalizeMesopotamianMonth from 'chronology/domain/normalizeMesopotamianMonth'
import parseDateFieldNumber from 'chronology/domain/parseDateFieldNumber'
import getPreviousKingAndYearIfYearZero from 'chronology/domain/ZeroYearKingFinder'
import {
  calendarToAbbreviation,
  insertDateApproximation,
  isApproximateDate,
  kingToModernDate,
} from 'chronology/domain/mesopotamianDateFormatting'

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
  yearZero?: DateField
  zeroYearKing?: KingDateField

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
    const kingAndYear = getPreviousKingAndYearIfYearZero(king, year)
    this.year = kingAndYear.year
    this.month = month
    this.day = day
    this.king = kingAndYear.king
    this.eponym = eponym
    this.isSeleucidEra = isSeleucidEra
    this.isAssyrianDate = isAssyrianDate
    this.ur3Calendar = ur3Calendar
    this.setRange()
    this.yearZero = year === kingAndYear.year ? undefined : year
    this.zeroYearKing = king === kingAndYear.king ? undefined : king
  }

  private setRange(): void {
    if (
      this.getEmptyFields().length > 0 &&
      [DateType.nabonassarEraDate, DateType.seleucidDate].includes(
        this.dateType as DateType,
      )
    ) {
      this.range = DateRange.getRangeFromPartialDate(this)
    }
  }

  private isSeleucidEraApplicable(year: string): boolean {
    const yearNumber = parseDateFieldNumber(year)
    return !!this.isSeleucidEra && !isNaN(yearNumber) && yearNumber > 0
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

  get dateType(): DateType | null {
    let result: DateType | null = null

    if (this?.year?.value && this.isSeleucidEraApplicable(this?.year?.value)) {
      result = DateType.seleucidDate
    } else if (this.isNabonassarEraApplicable()) {
      result = DateType.nabonassarEraDate
    } else if (this.isAssyrianDateApplicable()) {
      result = DateType.assyrianDate
    } else if (this.isKingDateApplicable()) {
      result = DateType.kingDate
    }
    return result
  }

  toModernDate(calendar: ModernCalendar = 'Julian'): string {
    const type = this.dateType
    if (type === null) {
      return ''
    }
    const dateProps = this.getDateProps(calendar)
    const { year } = dateProps
    return {
      seleucidDate: () => this.seleucidToModernDate(dateProps),
      nabonassarEraDate: () =>
        this.nabonassarEraToModernDate({
          ...dateProps,
          year: year > 0 ? year : 1,
        }),
      assyrianDate: () => this.getAssyrianDate(),
      kingDate: () => kingToModernDate(this.king, dateProps.year, 'Julian'),
    }[type]()
  }

  private getAssyrianDate(): string {
    return `ca. ${this.eponym?.date} BCE ${calendarToAbbreviation('Julian')}`
  }

  private getDateProps(calendar: ModernCalendar): {
    year: number
    month: number
    day: number
    isApproximate: boolean
    calendar: ModernCalendar
  } {
    return {
      year: parseDateFieldNumber(this.year.value),
      month: normalizeMesopotamianMonth(
        parseDateFieldNumber(this.month.value),
        this.month.isIntercalary,
      ),
      day: parseDateFieldNumber(this.day.value),
      isApproximate: isApproximateDate(this.year, this.month, this.day),
      calendar,
    }
  }

  getEmptyFields(): Array<YearMonthDay> {
    const fields: Array<YearMonthDay> = ['year', 'month', 'day']
    return fields
      .map((field) => {
        if (isNaN(parseDateFieldNumber(this[field].value))) {
          return field
        }
        return null
      })
      .filter((field) => !!field) as Array<YearMonthDay>
  }

  private seleucidToModernDate({
    year,
    month,
    day,
    isApproximate,
    calendar,
  }: DateProps): string {
    const dateRangeString = this.getDateRangeString(calendar)
    if (dateRangeString) {
      return dateRangeString
    }
    const converter = new DateConverter()
    converter.setToSeBabylonianDate(year, month, day)
    return insertDateApproximation(
      converter.toDateString(calendar),
      isApproximate,
    )
  }

  private nabonassarEraToModernDate({
    year,
    month,
    day,
    isApproximate,
    calendar,
  }: DateProps): string {
    const dateRangeString = this.getDateRangeString(calendar)
    if (dateRangeString) {
      return dateRangeString
    }
    const converter = new DateConverter()
    converter.setToMesopotamianDate(this.kingName as string, year, month, day)
    return insertDateApproximation(
      converter.toDateString(calendar),
      isApproximate,
    )
  }

  getDateRangeString(calendar: ModernCalendar): string | undefined {
    if (this.range !== undefined) {
      return insertDateApproximation(this.range.toDateString(calendar), true)
    }
  }

  get kingName(): string | undefined {
    return Object.keys(data.rulerToBrinkmanKings).find(
      (key) => data.rulerToBrinkmanKings[key] === this.king?.orderGlobal,
    )
  }
}
export { Ur3Calendar }
