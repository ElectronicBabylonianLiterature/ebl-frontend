import produce, { immerable } from 'immer'
import compareAkkadianStrings, {
  cleanAkkadianString,
} from 'dictionary/domain/compareAkkadianStrings'

interface Logogram {
  logogram: string
  atf: string
  wordId: readonly string[]
  schrammLogogramme: string
}

interface SignListRecord {
  name: string
  number: string
}

export interface SignQuery {
  value: string | undefined
  subIndex: number | undefined
  listsName: string | undefined
  listsNumber: string | undefined
  isIncludeHomophones: boolean | undefined
  isComposite: boolean | undefined
}
export interface SignDto {
  name: string
  lists: readonly SignListRecord[]
  values: readonly { value: string; subIndex?: number | undefined }[]
  logograms: readonly Logogram[]
  mesZl: string
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
    } else {
      return `~${this.subIndex}~`
    }
  }
}

export default class Sign {
  [immerable] = true
  readonly name: string
  readonly lists: readonly SignListRecord[]
  readonly values: readonly Value[]
  readonly logograms: readonly Logogram[]
  readonly mesZl: string
  readonly unicode: readonly number[]

  constructor({
    name,
    lists,
    values,
    logograms,
    mesZl,
    unicode,
  }: {
    name: string
    lists: readonly SignListRecord[]
    values: readonly Value[]
    logograms: readonly Logogram[]
    mesZl: string
    unicode: readonly number[]
  }) {
    this.name = name
    this.lists = lists
    this.values = values
    this.logograms = logograms
    this.mesZl = mesZl
    this.unicode = unicode
  }

  private sortedValues(): Value[] {
    return produce(this.values, (draftValues) => {
      return draftValues.sort((value1, value2) => {
        return compareAkkadianStrings(
          cleanAkkadianString(value1.value),
          cleanAkkadianString(value2.value)
        )
      })
    })
  }
  get displayValues(): string {
    return this.sortedValues()
      .map((value) => `${value.value}${value.displaySubIndex}`)
      .join(', ')
  }

  get displayCuneiformSigns(): string {
    return this.unicode.map((unicode) => String.fromCodePoint(unicode)).join('')
  }
  get displaySignName(): string {
    return this.name.replace(/\|/g, '')
  }

  static fromJavascriptObject(signJavascriptObject: SignDto): Sign {
    const sign = produce(signJavascriptObject, (draftSignDto) => {
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
