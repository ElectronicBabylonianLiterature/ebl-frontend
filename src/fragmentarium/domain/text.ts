import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma
} from 'fragmentarium/domain/Lemmatization'

import Lemma from './Lemma'

export type EnclosureType =
  | 'ACCIDENTAL_OMISSION'
  | 'INTENTIONAL_OMISSION'
  | 'BROKEN_AWAY'
  | 'PERHAPS_BROKEN_AWAY'
  | 'PERHAPS'
  | 'DOCUMENT_ORIENTED_GLOSS'

export interface BaseToken {
  readonly type: string
  readonly value: string
  readonly parts?: readonly Token[]
  readonly enclosureType: readonly EnclosureType[]
}

export interface NotLemmatizableToken extends BaseToken {
  readonly lemmatizable?: false
  readonly alignable?: false
  readonly uniqueLemma?: null
  readonly alignment?: null
}

export interface ValueToken extends NotLemmatizableToken {
  readonly type: 'ValueToken'
}

export interface Word extends BaseToken {
  readonly type: 'Word' | 'LoneDeterminative'
  readonly lemmatizable: boolean
  readonly alignable?: boolean
  readonly uniqueLemma: ReadonlyArray<string>
  readonly alignment?: null | number
  readonly language: string
  readonly normalized: boolean
  readonly erasure: string
  readonly parts: readonly Token[]
}

export interface Shift extends NotLemmatizableToken {
  readonly type: 'LanguageShift'
  readonly normalized: boolean
  readonly language: string
}

export interface Erasure extends NotLemmatizableToken {
  readonly type: 'Erasure'
  readonly side: string
}

export interface Joiner extends NotLemmatizableToken {
  readonly type: 'Joiner'
}

export interface UnknownNumberOfSigns extends NotLemmatizableToken {
  readonly type: 'UnknownNumberOfSigns'
}

export interface UnknownSign extends NotLemmatizableToken {
  readonly type: 'UnidentifiedSign' | 'UnclearSign'
  readonly flags: readonly string[]
}

export interface Variant extends NotLemmatizableToken {
  readonly type: 'Variant' | 'Variant2'
  readonly tokens: readonly Token[]
}

export interface Sign extends NotLemmatizableToken {
  readonly modifiers: readonly string[]
  readonly flags: readonly string[]
}

export interface NamedSign extends Sign {
  readonly type: 'Reading' | 'Logogram' | 'Number'
  readonly name: string
  readonly nameParts: readonly (ValueToken | Enclosure)[]
  readonly subIndex?: number | null
  readonly sign?: Token | null
  readonly surrogate?: readonly Token[] | null
}

export interface Divider extends Sign {
  readonly type: 'Divider'
  readonly divider: string
}

export interface Grapheme extends Sign {
  readonly type: 'Grapheme'
  readonly name: string
}

export interface CompoundGrapheme extends NotLemmatizableToken {
  readonly type: 'CompoundGrapheme'
}

export interface Gloss extends NotLemmatizableToken {
  readonly type: 'Determinative' | 'PhoneticGloss' | 'LinguisticGloss'
  readonly parts: readonly Token[]
}

export interface Tabulation extends NotLemmatizableToken {
  readonly type: 'Tabulation'
  readonly value: '($___$)'
}

export interface Enclosure extends NotLemmatizableToken {
  readonly type:
    | 'BrokenAway'
    | 'PerhapsBrokenAway'
    | 'AccidentalOmission'
    | 'IntentionalOmission'
    | 'Removal'
    | 'Erasure'
    | 'DocumentOrientedGloss'
  readonly side: 'LEFT' | 'CENTER' | 'RIGHT'
}

export type Token =
  | ValueToken
  | Word
  | Shift
  | Erasure
  | Joiner
  | UnknownNumberOfSigns
  | UnknownSign
  | Variant
  | NamedSign
  | Grapheme
  | Divider
  | CompoundGrapheme
  | Gloss
  | Enclosure
  | Tabulation

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
  hasPrime: false
  prefixModifier?: string
  suffixModifier?: string
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
