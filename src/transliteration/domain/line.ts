import _ from 'lodash'
import { Token } from './token'
import { LineNumber, LineNumberRange } from './line-number'
import Reference from 'bibliography/domain/Reference'
import { ColumnLabel, SurfaceLabel, ObjectLabel } from './labels'
import { isColumn } from './type-guards'
import { produce, Draft, castDraft } from 'immer'

export type Line =
  | LineBase
  | ControlLine
  | TextLine
  | EmptyLine
  | LooseDollarLine
  | ImageDollarLine
  | RulingDollarLine
  | SealDollarLine
  | StateDollarLine
  | SealAtLine
  | HeadingAtLine
  | ColumnAtLine
  | DiscourseAtLine
  | SurfaceAtLine
  | ObjectAtLine
  | DivisionAtLine
  | CompositeAtLine
  | NoteLine

export type LineDto =
  | LineBase
  | TextLineDto
  | LooseDollarLine
  | ImageDollarLine
  | RulingDollarLine
  | SealDollarLine
  | StateDollarLine
  | SealAtLine
  | HeadingAtLine
  | ColumnAtLine
  | DiscourseAtLine
  | SurfaceAtLine
  | ObjectAtLine
  | DivisionAtLine
  | CompositeAtLine
  | NoteLine

export interface LineBase {
  readonly type: string
  readonly prefix: string
  readonly content: ReadonlyArray<Token>
}

export class ControlLine {
  readonly type = 'ControlLine'
  readonly prefix: string
  readonly content: ReadonlyArray<Token>

  constructor(data: LineBase) {
    this.prefix = data.prefix
    this.content = data.content
  }
}

export interface TextLineDto extends LineBase {
  readonly type: 'TextLine'
  readonly lineNumber: LineNumber | LineNumberRange
}

export interface TextLineColumn {
  span: number | null
  content: readonly Token[]
}

const defaultSpan = 1

export class TextLine implements TextLineDto {
  readonly type = 'TextLine'
  readonly prefix: string
  readonly content: ReadonlyArray<Token>
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(data: TextLineDto) {
    this.prefix = data.prefix
    this.content = data.content
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

export class EmptyLine implements LineBase {
  readonly type = 'EmptyLine'
  readonly prefix = ''
  readonly content: ReadonlyArray<Token> = []
}

export interface DollarAndAtLine extends LineBase {
  readonly displayValue: string
}
export interface LooseDollarLine extends DollarAndAtLine {
  readonly type: 'LooseDollarLine'
  readonly text: string
}
export interface ImageDollarLine extends DollarAndAtLine {
  readonly type: 'ImageDollarLine'
  readonly number: string
  readonly letter: string | null
  readonly text: string
}
export interface RulingDollarLine extends DollarAndAtLine {
  readonly type: 'RulingDollarLine'
  readonly number: 'SINGLE' | 'DOUBLE' | 'TRIPLE'
  readonly status: string | null
}
export interface SealDollarLine extends DollarAndAtLine {
  readonly type: 'SealDollarLine'
  readonly number: number
}
interface ScopeContainer {
  readonly type: string
  readonly content: string
  readonly text: string
}
export interface StateDollarLine extends DollarAndAtLine {
  readonly type: 'StateDollarLine'
  readonly qualification: string | null
  readonly extent: string | null
  readonly scope: ScopeContainer | null
  readonly state: string | null
  readonly status: string | null
}
export interface SealAtLine extends DollarAndAtLine {
  readonly type: 'SealAtLine'
  readonly number: number
}
export interface HeadingAtLine extends DollarAndAtLine {
  readonly type: 'HeadingAtLine'
  readonly number: number
}
export interface ColumnAtLine extends DollarAndAtLine {
  readonly type: 'ColumnAtLine'
  readonly column_label: ColumnLabel
}
export interface DiscourseAtLine extends DollarAndAtLine {
  readonly type: 'DiscourseAtLine'
  readonly discourse_label: string
}
export interface SurfaceAtLine extends DollarAndAtLine {
  readonly type: 'SurfaceAtLine'
  readonly surface_label: SurfaceLabel
}
export interface ObjectAtLine extends DollarAndAtLine {
  readonly type: 'ObjectAtLine'
  readonly label: ObjectLabel
}
export interface DivisionAtLine extends DollarAndAtLine {
  readonly type: 'DivisionAtLine'
  readonly number: number | null
  readonly text: string
}
export interface CompositeAtLine extends DollarAndAtLine {
  readonly type: 'CompositeAtLine'
  readonly composite: string
  readonly number: number | null
  readonly text: string
}

export interface TextPart {
  readonly type: 'StringPart' | 'EmphasisPart'
  readonly text: string
}

export interface LanguagePart {
  readonly type: 'LanguagePart'
  readonly language: 'AKKADIAN' | 'SUMERIAN' | 'EMESAL'
  readonly tokens: readonly Token[]
}

export interface ReferenceDto {
  readonly id: string
  readonly type: 'DISCUSSION'
  readonly pages: string
  readonly notes: ''
  readonly linesCited: []
}

export interface BibliographyPart {
  readonly type: 'BibliographyPart'
  readonly reference: ReferenceDto | Reference
}

export type NoteLinePart = TextPart | LanguagePart | BibliographyPart

export interface NoteLine extends LineBase {
  readonly type: 'NoteLine'
  readonly prefix: '#note: '
  readonly parts: readonly NoteLinePart[]
}
