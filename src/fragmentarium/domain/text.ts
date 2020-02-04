import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma
} from 'fragmentarium/domain/Lemmatization'

import Lemma from './Lemma'

export interface BaseToken {
  readonly type: string
  readonly value: string
  readonly parts?: readonly Token[]
}

export interface NotLemmatizableToken extends BaseToken {
  readonly lemmatizable?: false
  readonly alignable?: false
  readonly uniqueLemma?: null
  readonly alignment?: null
}

export interface ValueToken extends NotLemmatizableToken {
  type: 'Token'
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
  type: 'Joiner'
}

export interface UnknownNumberOfSigns extends NotLemmatizableToken {
  type: 'UnknownNumberOfSigns'
}

export interface UnknownSign extends NotLemmatizableToken {
  type: 'UnidentifiedSign' | 'UnclearSign'
  flags: readonly string[]
}

export interface Variant extends NotLemmatizableToken {
  type: 'Variant'
  tokens: readonly Token[]
}

export interface Sign extends NotLemmatizableToken {
  modifiers: readonly string[]
  flags: readonly string[]
}

export interface NamedSign extends Sign {
  name: string
  subIndex?: number | null
  sign?: Token | null
  surrogate?: readonly Token[] | null
}

export interface Reading extends NamedSign {
  type: 'Reading'
}

export interface Logogram extends NamedSign {
  type: 'Logogram'
}

export interface NumberSign extends NamedSign {
  type: 'Number'
}

export interface Divider extends Sign {
  type: 'Divider'
  divider: string
}

export interface Grapheme extends Sign {
  type: 'Grapheme'
  name: string
}

export interface CompoundGrapheme extends NotLemmatizableToken {
  type: 'CompoundGrapheme'
}

export interface Gloss extends NotLemmatizableToken {
  readonly parts: readonly Token[]
}

export interface Determinative extends Gloss {
  type: 'Determinative'
}

export interface PhoneticGloss extends Gloss {
  type: 'PhoneticGloss'
}

export interface LinguisticGloss extends Gloss {
  type: 'LinguisticGloss'
}

export interface DocumentOrientedGloss extends NotLemmatizableToken {
  type: 'DocumentOrientedGloss'
}

export interface DocumentOrientedGloss extends NotLemmatizableToken {
  type: 'DocumentOrientedGloss'
}

export interface Enclosure extends NotLemmatizableToken {
  type:
    | 'BrokenAway'
    | 'PerhapsBrokenAway'
    | 'AccidentalOmission'
    | 'IntentionalOmission'
    | 'Removal'
    | 'Erasure'
  side: 'LEFT' | 'CENTER' | 'RIGHT'
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
  | Reading
  | Logogram
  | NumberSign
  | Grapheme
  | Divider
  | CompoundGrapheme
  | Determinative
  | PhoneticGloss
  | LinguisticGloss
  | DocumentOrientedGloss
  | Enclosure

export interface Line {
  readonly type: string
  readonly prefix: string
  readonly content: ReadonlyArray<Token>
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
