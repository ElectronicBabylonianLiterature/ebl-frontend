//import produce, { castDraft, Draft, immerable } from 'immer'
//import { immerable } from 'immer'
//import _ from 'lodash'
import { King } from 'common/BrinkmanKings'
import { MesopotamianDateDto } from 'fragmentarium/domain/FragmentDtos'
import { romanize } from 'romans'

export interface DateField {
  value: string
  broken?: boolean
  uncertain?: boolean
}

export interface MonthField extends DateField {
  intercalary?: boolean
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
  era: King | string | undefined
  year: DateField
  month: MonthField
  day: DateField
  ur3Calendar?: Ur3Calendar

  constructor(
    era: King | string | undefined,
    year: DateField,
    month: MonthField,
    day: DateField,
    ur3Calendar?: Ur3Calendar
  ) {
    this.era = era
    this.year = year
    this.month = month
    this.day = day
    this.ur3Calendar = ur3Calendar
  }

  static fromJson(dateJSON: MesopotamianDateDto): MesopotamianDate {
    const { era, year, month, day } = dateJSON
    return new MesopotamianDate(era, year, month, day)
  }

  toString(): string {
    const dateParts = [
      this.yearToString(),
      this.monthToString(),
      this.dayToString(),
    ]
    return `${dateParts.join(
      '.'
    )}${this.eraToString()}${this.ur3CalendarToString()}`
  }

  yearToString(): string {
    return this.year.value
      ? this.brokenAndUncertainToString('year', this.year.value)
      : '∅'
  }

  monthToString(): string {
    const intercalary = this.month.intercalary ? '²' : ''
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
    const { broken, uncertain } = this[parameter]

    return `${broken ? '⸢' : ''}${element}${broken ? '⸣' : ''}${
      uncertain ? '?' : ''
    }`
  }

  eraToString(): string {
    const era =
      this.era === 'seleucid'
        ? 'SE'
        : typeof this.era === 'string'
        ? this.era
        : this.era?.name ?? ''
    return era ? ' ' + era : era
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
