import { Token } from './token'
import { LineNumber, LineNumberRange } from './line-number'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export type Line =
  | LineBase
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

export interface LineBase {
  readonly type: string
  readonly prefix: string
  readonly content: ReadonlyArray<Token>
}
export interface TextLine extends LineBase {
  type: 'TextLine'
  lineNumber: LineNumber | LineNumberRange
}
export interface EmptyLine extends LineBase {
  readonly type: 'EmptyLine'
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
export interface LooseDollarLine extends DollarAndAtLine {
  readonly type: 'LooseDollarLine'
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
interface Label {
  readonly status: ReadonlyArray<string>
}
interface ColumnLabel extends Label {
  readonly column: number
}
interface SurfaceLabel extends Label {
  readonly surface: string
  readonly text: string
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
  readonly status: ReadonlyArray<string>
  readonly object_label: string
  readonly text: string
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

export interface Reference {
  readonly id: string
  readonly type: 'DISCUSSION'
  readonly pages: string
  readonly notes: ''
  readonly linesCited: []
}

export interface BibliographyPart {
  readonly type: 'BibliographyPart'
  readonly reference: Reference
}

export type NoteLinePart = TextPart | LanguagePart | BibliographyPart

export interface NoteLine extends LineBase {
  readonly type: 'NoteLine'
  readonly prefix: '#note: '
  readonly parts: readonly NoteLinePart[]
}
