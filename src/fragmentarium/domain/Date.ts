//import produce, { castDraft, Draft, immerable } from 'immer'
//import { immerable } from 'immer'
//import _ from 'lodash'
import { King } from 'common/BrinkmanKings'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
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
      this.yearToString(),
      this.monthToString(),
      this.dayToString(),
    ]
    return `${dateParts.join(
      '.'
    )}${this.kingOrEraToString()}${this.ur3CalendarToString()}`
  }

  yearToString(): string {
    return this.year.value
      ? this.brokenAndUncertainToString('year', this.year.value)
      : '∅'
  }

  monthToString(): string {
    const intercalary = this.month.isIntercalary ? '²' : ''
    const month = Number(this.month.value)
      ? romanize(Number(this.month.value))
      : this.month.value
    return month
      ? this.brokenAndUncertainToString('month', month + intercalary)
      : '∅'
  }

  dayToString(): string {
    return this.day.value
      ? this.brokenAndUncertainToString('day', this.day.value)
      : '∅'
  }

  brokenAndUncertainToString(
    parameter: 'year' | 'day' | 'month',
    element: string
  ): string {
    const { isBroken, isUncertain } = this[parameter]

    return `${isBroken ? '⸢' : ''}${element}${isBroken ? '⸣' : ''}${
      isUncertain ? '?' : ''
    }`
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

/*
export class Dates {
  readonly dates: ReadonlyArray<Date>

  constructor(dates: Date[]) {
    this.dates = dates
  }

  static fromJson(datesJSON: readonly MesopotamianDateDto[]): Dates {
    return new Dates(datesJSON.map((dateJson) => Date.fromJson(dateJson)))
  }


  isPresent(date: Date): boolean {
    return this.dates.some(
      (element) =>
        JSON.stringify(element.category) === JSON.stringify(date.category)
    )
  }

  find(date: Date): Date | undefined {
    return _.find(
      this.dates,
      (elem) => JSON.stringify(elem.category) === JSON.stringify(date.category)
    )
  }

  insertWithOrder(date: Date, indexLookup: readonly string[][]): Dates {
    return produce(this, (draft: Draft<Dates>) => {
      draft.dates = castDraft(
        _.sortBy([...this.dates, date], (date) =>
          JSON.stringify(indexLookup).indexOf(JSON.stringify(date.category))
        )
      )
    })
  }

  delete(date: Date): Dates {
    return produce(this, (draft: Draft<Dates>) => {
      draft.dates = castDraft(
        this.dates.filter(
          (elem) => JSON.stringify(elem) !== JSON.stringify(date)
        )
      )
    })
  }

  replace(date: Date): Dates {
    return produce(this, (draft: Draft<Dates>) => {
      const dates = _.cloneDeep(this.dates as Date[])
      const index = _.findIndex(
        this.dates,
        (content) =>
          JSON.stringify(content.category) === JSON.stringify(date.category)
      )
      dates.splice(index, 1, date)
      draft.dates = castDraft(dates)
    })
  }
  */
