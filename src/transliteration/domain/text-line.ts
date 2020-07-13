import _ from 'lodash'
import { Token } from './token'
import { LineNumber, LineNumberRange } from './line-number'
import { isColumn } from './type-guards'
import { produce, Draft, castDraft } from 'immer'
import { AbstractLine, LineBaseDto } from './abstract-line'

export interface TextLineDto extends LineBaseDto {
  readonly type: 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange
}

export interface TextLineColumn {
  span: number | null
  content: readonly Token[]
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
      produce((draft: Draft<TextLineColumn[]>, current: Token) => {
        if (isColumn(current)) {
          if (_.isEmpty(draft) && current.number === null) {
            draft.push({
              span: defaultSpan,
              content: [],
            })
          }
          draft.push({
            span: current.number ?? defaultSpan,
            content: [],
          })
        } else if (_.isEmpty(draft)) {
          draft.push({
            span: this.hasColumns ? 1 : null,
            content: [castDraft(current)],
          })
        } else {
          _.last(draft)?.content.push(castDraft(current))
        }
      }),
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
