import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import { AbstractLine, LineBaseDto } from 'transliteration/domain/abstract-line'
import {
  TextLineColumn,
  createColumns,
  numberOfColumns,
} from 'transliteration/domain/columns'

export interface TextLineDto extends LineBaseDto {
  readonly type: 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange
  readonly index?: number
  readonly location?: TextLineLocation | null
}

export interface TextLineLocation {
  readonly object: string | null
  readonly surface: string | null
  readonly column: string | null
  readonly sealNumber: number | null
}

export class TextLine extends AbstractLine {
  readonly type = 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange
  readonly index?: number
  readonly location?: TextLineLocation | null

  constructor(data: TextLineDto) {
    super(data.prefix, data.content)
    this.lineNumber = data.lineNumber
    if ('index' in data) {
      this.index = data.index
    }
    if ('location' in data) {
      this.location = data.location
    }
  }

  get columns(): readonly TextLineColumn[] {
    return createColumns(this.content)
  }

  get numberOfColumns(): number {
    return numberOfColumns(this.columns)
  }
}
