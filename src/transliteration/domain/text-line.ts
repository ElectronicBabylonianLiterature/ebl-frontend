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
}

export class TextLine extends AbstractLine {
  readonly type = 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(data: TextLineDto) {
    super(data.prefix, data.content)
    this.lineNumber = data.lineNumber
  }

  get columns(): readonly TextLineColumn[] {
    return createColumns(this.content)
  }

  get numberOfColumns(): number {
    return numberOfColumns(this.columns)
  }
}
