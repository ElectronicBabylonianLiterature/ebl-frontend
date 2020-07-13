import _ from 'lodash'
import { Token } from './token'
import { LineNumber, LineNumberRange } from './line-number'
import Reference from 'bibliography/domain/Reference'
import { ColumnLabel, SurfaceLabel, ObjectLabel } from './labels'
import { isColumn } from './type-guards'
import { produce, Draft, castDraft } from 'immer'
import {
  AbstractLine,
  LineBaseDto,
  DollarAndAtLineDto,
  Ruling,
} from './abstract-line'

export type LineDto =
  | LineBaseDto
  | TextLineDto
  | LooseDollarLineDto
  | ImageDollarLineDto
  | RulingDollarLineDto
  | SealDollarLineDto
  | StateDollarLineDto
  | SealAtLineDto
  | HeadingAtLineDto
  | ColumnAtLineDto
  | DiscourseAtLineDto
  | SurfaceAtLineDto
  | ObjectAtLineDto
  | DivisionAtLineDto
  | CompositeAtLineDto
  | NoteLineDto

export class ControlLine extends AbstractLine {
  readonly type = 'ControlLine'

  constructor(data: LineBaseDto) {
    super(data.prefix, data.content)
  }
}

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

export class EmptyLine extends AbstractLine {
  readonly type = 'EmptyLine'

  constructor() {
    super('', [])
  }
}

export abstract class DollarLine extends AbstractLine {
  readonly displayValue: string

  constructor(data: DollarAndAtLineDto) {
    super('$', data.content)
    this.displayValue = data.displayValue
  }
}

export interface LooseDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'LooseDollarLine'
  readonly text: string
}

export class LooseDollarLine extends DollarLine {
  readonly type = 'LooseDollarLine'
  readonly text: string

  constructor(data: LooseDollarLineDto) {
    super(data)
    this.text = data.text
  }
}

export interface ImageDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'ImageDollarLine'
  readonly number: string
  readonly letter: string | null
  readonly text: string
}

export class ImageDollarLine extends DollarLine {
  readonly type = 'ImageDollarLine'
  readonly number: string
  readonly letter: string | null
  readonly text: string

  constructor(data: ImageDollarLineDto) {
    super(data)
    this.number = data.number
    this.letter = data.letter
    this.text = data.text
  }
}

export interface RulingDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'RulingDollarLine'
  readonly number: Ruling
  readonly status: string | null
}

export class RulingDollarLine extends DollarLine {
  readonly type = 'RulingDollarLine'
  readonly number: Ruling
  readonly status: string | null

  constructor(data: RulingDollarLineDto) {
    super(data)
    this.number = data.number
    this.status = data.status
  }
}

export interface SealDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'SealDollarLine'
  readonly number: number
}

export class SealDollarLine extends DollarLine {
  readonly type = 'SealDollarLine'
  readonly number: number

  constructor(data: SealDollarLineDto) {
    super(data)
    this.number = data.number
  }
}

interface ScopeContainer {
  readonly type: string
  readonly content: string
  readonly text: string
}
export interface StateDollarLineDto extends DollarAndAtLineDto {
  readonly type: 'StateDollarLine'
  readonly qualification: string | null
  readonly extent: string | null
  readonly scope: ScopeContainer | null
  readonly state: string | null
  readonly status: string | null
}

export class StateDollarLine extends DollarLine {
  readonly type = 'SealDollarLine'
  readonly qualification: string | null
  readonly extent: string | null
  readonly scope: ScopeContainer | null
  readonly state: string | null
  readonly status: string | null

  constructor(data: StateDollarLineDto) {
    super(data)
    this.qualification = data.qualification
    this.extent = data.extent
    this.scope = data.scope
    this.state = data.state
    this.status = data.status
  }
}

export abstract class AtLine extends AbstractLine {
  readonly displayValue: string

  constructor(data: DollarAndAtLineDto) {
    super('@', data.content)
    this.displayValue = data.displayValue
  }
}

export interface SealAtLineDto extends DollarAndAtLineDto {
  readonly type: 'SealAtLine'
  readonly number: number
}

export class SealAtLine extends AtLine {
  readonly type = 'SealAtLine'
  readonly number: number

  constructor(data: SealAtLineDto) {
    super(data)
    this.number = data.number
  }
}

export interface HeadingAtLineDto extends DollarAndAtLineDto {
  readonly type: 'HeadingAtLine'
  readonly number: number
}

export class HeadingAtLine extends AtLine {
  readonly type = 'HeadingAtLine'
  readonly number: number

  constructor(data: HeadingAtLineDto) {
    super(data)
    this.number = data.number
  }
}

export interface ColumnAtLineDto extends DollarAndAtLineDto {
  readonly type: 'ColumnAtLine'
  readonly column_label: ColumnLabel
}

export class ColumnAtLine extends AtLine {
  readonly type = 'ColumnAtLine'
  readonly label: ColumnLabel

  constructor(data: ColumnAtLineDto) {
    super(data)
    this.label = data.column_label
  }
}

export interface DiscourseAtLineDto extends DollarAndAtLineDto {
  readonly type: 'DiscourseAtLine'
  readonly discourse_label: string
}

export class DiscourseAtLine extends AtLine {
  readonly type = 'DiscourseAtLine'
  readonly label: string

  constructor(data: DiscourseAtLineDto) {
    super(data)
    this.label = data.discourse_label
  }
}

export interface SurfaceAtLineDto extends DollarAndAtLineDto {
  readonly type: 'SurfaceAtLine'
  readonly surface_label: SurfaceLabel
}

export class SurfaceAtLine extends AtLine {
  readonly type = 'SurfaceAtLine'
  readonly label: SurfaceLabel

  constructor(data: SurfaceAtLineDto) {
    super(data)
    this.label = data.surface_label
  }
}

export interface ObjectAtLineDto extends DollarAndAtLineDto {
  readonly type: 'ObjectAtLine'
  readonly label: ObjectLabel
}

export class ObjectAtLine extends AtLine {
  readonly type = 'ObjectAtLine'
  readonly label: ObjectLabel

  constructor(data: ObjectAtLineDto) {
    super(data)
    this.label = data.label
  }
}

export interface DivisionAtLineDto extends DollarAndAtLineDto {
  readonly type: 'DivisionAtLine'
  readonly number: number | null
  readonly text: string
}

export class DivisionAtLine extends AtLine {
  readonly type = 'DivisionAtLine'
  readonly number: number | null
  readonly text: string

  constructor(data: DivisionAtLineDto) {
    super(data)
    this.number = data.number
    this.text = data.text
  }
}

export interface CompositeAtLineDto extends DollarAndAtLineDto {
  readonly type: 'CompositeAtLine'
  readonly composite: string
  readonly number: number | null
  readonly text: string
}

export class CompositeAtLine extends AtLine {
  readonly type = 'CompositeAtLine'
  readonly composite: string
  readonly number: number | null
  readonly text: string

  constructor(data: CompositeAtLineDto) {
    super(data)
    this.composite = data.composite
    this.number = data.number
    this.text = data.text
  }
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

export interface NoteLineDto extends LineBaseDto {
  readonly type: 'NoteLine'
  readonly prefix: '#note: '
  readonly parts: readonly NoteLinePart[]
}

export class NoteLine extends AbstractLine {
  readonly type = 'NoteLine'
  readonly parts: readonly NoteLinePart[]

  constructor(data: NoteLineDto) {
    super('#note: ', data.content)
    this.parts = data.parts
  }
}
