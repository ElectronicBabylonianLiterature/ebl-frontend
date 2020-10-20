import _ from 'lodash'
import { Token } from './token'
import { LineNumber, LineNumberRange } from './line-number'
import { isColumn } from './type-guards'
import { AbstractLine, LineBaseDto } from './abstract-line'

export interface TextLineDto extends LineBaseDto {
  readonly type: 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange
}

export interface TextLineColumn {
  span: number | null
  content: Token[]
}
const defaultSpan = 1

export class TextLine extends AbstractLine {
  readonly type = 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(data: TextLineDto) {
    super(data.prefix, data.content)
    this.lineNumber = data.lineNumber
  }

  get columns(): readonly TextLineColumn[] {
    return _.reduce<Token, TextLineColumn[]>(
      this.content,
      (columns, current) => {
        if (isColumn(current)) {
          if (_.isEmpty(columns) && current.number === null) {
            columns.push({
              span: defaultSpan,
              content: [],
            })
          }
          columns.push({
            span: current.number ?? defaultSpan,
            content: [],
          })
        } else if (_.isEmpty(columns)) {
          columns.push({
            span: this.hasColumns ? 1 : null,
            content: [current],
          })
        } else {
          _.last(columns)?.content.push(current)
        }
        return columns
      },
      []
    )
  }

  get numberOfColumns(): number {
    return _(this.columns)
      .map((column) => column.span ?? defaultSpan)
      .sum()
  }

  get hasColumns(): boolean {
    return this.content.some(isColumn)
  }
}
