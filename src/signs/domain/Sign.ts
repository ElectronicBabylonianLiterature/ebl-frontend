import produce, { immerable } from 'immer'
import { compareCleanedAkkadianString } from 'dictionary/domain/compareAkkadianStrings'
import { subscriptNumbers } from 'transliteration/application/SubIndex'
import MuseumNumber from 'fragmentarium/domain/MuseumNumber'

export interface Logogram {
  logogram: string
  atf: string
  wordId: readonly string[]
  schrammLogogramme: string
  unicode: string
}
export class OrderedSign {
  readonly name: string
  readonly unicode: readonly number[]
  readonly mzl: string | null

  constructor(name: string, unicode: readonly number[], mzl: string | null) {
    this.name = name
    this.unicode = unicode
    this.mzl = mzl
  }
}
export interface Fossey {
  page: number
  number: number
  reference: string
  newEdition: string
  secondaryLiterature: string
  cdliNumber: string
  museumNumber: MuseumNumber | null
  externalProject: string
  notes: string
  date: string
  transliteration: string
  sign: string
}

export interface SignListRecord {
  name: string
  number: string
}

export interface SignQuery {
  value?: string | null
  subIndex?: number | null
  listsName?: string | null
  listsNumber?: string | null
  isIncludeHomophones?: boolean | null
  isComposite?: boolean | null
  wordId?: string | null
}
export interface SignDto {
  name: string
  lists: readonly SignListRecord[]
  values: readonly { value: string; subIndex?: number | undefined }[]
  fossey: readonly Fossey[]
  logograms: readonly Logogram[]
  mesZl: string
  LaBaSi: string
  unicode: readonly number[]
}
export class Value {
  readonly value: string
  readonly subIndex: number | undefined

  constructor(value: string, subIndex: number | undefined = undefined) {
    this.value = value
    this.subIndex = subIndex
  }
  get displaySubIndex(): string {
    if (this.subIndex === undefined) {
      return '~x~'
    } else if (this.subIndex === 1) {
      return ''
    } else {
      return this.subIndex
        .toString()
        .split('')
        .map((digit) => subscriptNumbers.get(digit))
        .join('')
    }
  }
}

export default class Sign {
  [immerable] = true
  readonly name: string
  readonly lists: readonly SignListRecord[]
  readonly values: readonly Value[]
  readonly logograms: readonly Logogram[]
  readonly fossey: readonly Fossey[]
  readonly mesZl: string
  readonly LaBaSi: string
  readonly unicode: readonly number[]

  constructor({
    name,
    lists,
    values,
    logograms,
    fossey,
    mesZl,
    LaBaSi,
    unicode,
  }: {
    name: string
    lists: readonly SignListRecord[]
    values: readonly Value[]
    logograms: readonly Logogram[]
    fossey: readonly Fossey[]
    mesZl: string
    LaBaSi: string
    unicode: readonly number[]
  }) {
    this.name = name
    this.lists = lists
    this.values = values
    this.logograms = logograms
    this.fossey = fossey
    this.mesZl = mesZl
    this.LaBaSi = LaBaSi
    this.unicode = unicode
  }

  private sortedValues(): readonly Value[] {
    return produce(this.values, (draftValues) => {
      draftValues.sort((value1, value2) =>
        compareCleanedAkkadianString(value1.value, value2.value)
      )
    })
  }
  get displayValuesMarkdown(): string {
    return this.sortedValues()
      .map((value) => `*${value.value}*${value.displaySubIndex}`)
      .join(', ')
  }

  get displayCuneiformSigns(): string {
    return this.unicode.map((unicode) => String.fromCodePoint(unicode)).join('')
  }
  get displaySignName(): string {
    return this.name.replace(/\|/g, '')
  }

  static fromDto(signDto: SignDto): Sign {
    const sign = produce(signDto, (draftSignDto) => {
      draftSignDto.values = draftSignDto.values.map(
        (value) => new Value(value.value, value.subIndex)
      )
    }) as SignDtoWithValues
    return new Sign(sign)
  }
}

interface SignDtoWithValues extends Omit<SignDto, 'values'> {
  values: readonly Value[]
}
