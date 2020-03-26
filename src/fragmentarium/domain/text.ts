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
  readonly type: 'Token'
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

export type LineContainer = Line | RulingDollarLine

export interface Line {
  readonly type: string
  readonly prefix: string
  readonly content: ReadonlyArray<Token>
}

export interface ControlLines extends Line {
  readonly display_value: string
}

export interface RulingDollarLine extends ControlLines {
  readonly number: string
  readonly status?: string | null
}

export class Text {
  readonly lines: ReadonlyArray<LineContainer>

  constructor({ lines }: { lines: ReadonlyArray<LineContainer> }) {
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
