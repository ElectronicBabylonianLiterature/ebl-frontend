import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma,
} from 'fragmentarium/domain/Lemmatization'

import Lemma from './Lemma'
import { Token } from './token'

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

export interface LineBase {
  readonly type: string
  readonly prefix: string
  readonly content: ReadonlyArray<Token>
}

export interface LineNumber {
  number: number
  hasPrime: boolean
  prefixModifier: string | null
  suffixModifier: string | null
  type?: 'LineNumber'
}

export interface LineNumberRange {
  start: LineNumber
  end: LineNumber
  type: 'LineNumberRange'
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
  readonly number: string
  readonly text: string
}

export interface CompositeAtLine extends DollarAndAtLine {
  readonly type: 'CompositeAtLine'
  readonly composite: string
  readonly number: string
  readonly text: string
}

export class Text {
  readonly lines: ReadonlyArray<Line>

  constructor({ lines }: { lines: ReadonlyArray<Line> }) {
    this.lines = lines
  }

  createLemmatization(
    lemmas: { [key: string]: Lemma },
    suggestions: { [key: string]: ReadonlyArray<UniqueLemma> }
  ): Lemmatization {
    return new Lemmatization(
      this.lines.map((line) => line.prefix),
      this.lines
        .map((line) => line.content)
        .map((tokens) =>
          tokens.map((token) =>
            token.lemmatizable
              ? new LemmatizationToken(
                  token.value,
                  true,
                  (token.uniqueLemma || []).map((id) => lemmas[id]),
                  suggestions[token.cleanValue]
                )
              : new LemmatizationToken(token.value, false)
          )
        )
    )
  }
}
Text[immerable] = true
