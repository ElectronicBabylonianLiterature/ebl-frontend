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

export interface LemmatizableToken extends BaseToken {
  readonly lemmatizable: boolean
  readonly alignable?: boolean
  readonly uniqueLemma: ReadonlyArray<string>
  readonly alignment?: null | number
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

export interface Word extends LemmatizableToken {
  readonly type: 'Word'
  readonly language: string
  readonly normalized: boolean
  readonly erasure: string
  readonly parts: readonly Token[]
}

export interface LoneDeterminative extends LemmatizableToken {
  readonly type: 'LoneDeterminative'
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

export interface UnidentifiedSign extends NotLemmatizableToken {
  type: 'UnidentifiedSign'
}

export interface UnclearSign extends NotLemmatizableToken {
  type: 'UnclearSign'
}

export interface Variant extends NotLemmatizableToken {
  type: 'Variant'
  tokens: readonly Token[]
}

export interface Reading extends NotLemmatizableToken {
  type: 'Reading'
}

export interface Logogram extends NotLemmatizableToken {
  type: 'Logogram'
}

export interface CompoundGrapheme extends NotLemmatizableToken {
  type: 'CompoundGrapheme'
}

export type Token =
  | ValueToken
  | Word
  | LoneDeterminative
  | Shift
  | Erasure
  | Joiner
  | UnknownNumberOfSigns
  | UnidentifiedSign
  | UnclearSign
  | Variant
  | Reading
  | Logogram
  | CompoundGrapheme

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
