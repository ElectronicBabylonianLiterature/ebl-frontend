import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma
} from 'fragmentarium/domain/Lemmatization'

import Lemma from './Lemma'
import { Token } from './token'

export type Line =
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

export interface EmptyLine extends LineBase {
  readonly type: 'EmptyLine'
}
export interface LineNumber {
  readonly number: number
  readonly hasPrime: false
  readonly prefixModifier?: string
  readonly suffixModifier?: string
}
export interface TextLine extends LineBase {
  readonly type: 'TextLine'
  readonly lineNumber?: LineNumber
}

export interface ControlLines extends LineBase {
  readonly displayValue: string
}

export interface LooseDollarLine extends ControlLines {
  readonly type: 'LooseDollarLine'
  readonly text: string
}

export interface ImageDollarLine extends ControlLines {
  readonly type: 'ImageDollarLine'
  readonly number: string
  readonly letter?: string | null
  readonly text: string
}

export interface LooseDollarLine extends ControlLines {
  readonly type: 'LooseDollarLine'
  readonly text: string
}

export interface RulingDollarLine extends LineBase {
  readonly type: 'RulingDollarLine'
  readonly number: 'SINGLE' | 'DOUBLE' | 'TRIPLE'
  readonly status?: string | null
  readonly displayValue: string
}

export interface SealDollarLine extends ControlLines {
  readonly type: 'SealDollarLine'
  readonly number: number
}

interface ScopeContainer {
  readonly type: string
  readonly content: string
  readonly text: string
}

export interface StateDollarLine extends ControlLines {
  readonly type: 'StateDollarLine'
  readonly qualification: string
  readonly extent: string
  readonly scope: ScopeContainer
  readonly state: string
  readonly status: string
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
export interface SealAtLine extends ControlLines {
  readonly type: 'SealAtLine'
  readonly number: number
}
export interface HeadingAtLine extends ControlLines {
  readonly type: 'HeadingAtLine'
  readonly number: number
}

export interface ColumnAtLine extends ControlLines {
  readonly type: 'ColumnAtLine'
  readonly columnLabel: ColumnLabel
}

export interface DiscourseAtLine extends ControlLines {
  readonly type: 'DiscourseAtLine'
  readonly discourseLabel: string
}

export interface SurfaceAtLine extends ControlLines {
  readonly type: 'SurfaceAtLine'
  readonly surfaceLabel: SurfaceLabel
}

export interface ObjectAtLine extends ControlLines {
  readonly type: 'ObjectAtLine'
  readonly status: ReadonlyArray<string>
  readonly objectLabel: string
  readonly text: string
}

export interface DivisionAtLine extends ControlLines {
  readonly type: 'DivisionAtLine'
  readonly number: string
  readonly text: string
}

export interface CompositeAtLine extends ControlLines {
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
      this.lines.map(line => line.prefix),
      this.lines
        .map(line => line.content)
        .map(tokens =>
          tokens.map(token =>
            token.lemmatizable
              ? new LemmatizationToken(
                  token.value,
                  true,
                  (token.uniqueLemma || []).map(id => lemmas[id]),
                  suggestions[token.value]
                )
              : new LemmatizationToken(token.value, false)
          )
        )
    )
  }
}
Text[immerable] = true
