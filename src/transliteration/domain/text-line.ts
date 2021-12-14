import { LineNumber, LineNumberRange } from './line-number'
import { AbstractLine, LineBaseDto } from './abstract-line'
import { TextLineColumn, createColumns, numberOfColumns } from './columns'

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
