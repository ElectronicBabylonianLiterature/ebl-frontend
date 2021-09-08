import { LineNumber } from 'transliteration/domain/line-number'

export interface ExtantLine {
  readonly lineNumber: LineNumber
  readonly isBeginningOfSide: boolean
}

export interface ExtantLines {
  readonly [siglum: string]: {
    readonly [label: string]: readonly ExtantLine[]
  }
}
