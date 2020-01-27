import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken,
  UniqueLemma
} from 'fragmentarium/domain/Lemmatization'

import Lemma from './Lemma'

interface PlainToken {
  readonly type: string
  readonly value: string
  readonly lemmatizable?: boolean
  readonly uniqueLemma?: null | ReadonlyArray<string>
  readonly parts?: readonly Token[]
  readonly tokens?: readonly Token[]
}

interface Word extends PlainToken {
  readonly type: 'Word'
  readonly uniqueLemma: ReadonlyArray<string>
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable: boolean
  readonly erasure: string
  readonly alignment?: number
  readonly parts: readonly Token[]
}

interface LoneDeterminative extends PlainToken {
  readonly type: 'LoneDeterminative'
  readonly uniqueLemma: ReadonlyArray<string>
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable: boolean
  readonly partial: [boolean, boolean]
  readonly erasure: string
  readonly alignment?: number
  readonly parts: readonly Token[]
}

interface Shift extends PlainToken {
  readonly type: 'LanguageShift'
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable?: false
}

interface Erasure extends PlainToken {
  readonly type: 'Erasure'
  readonly side: string
  readonly lemmatizable?: false
  readonly uniqueLemma?: null
  readonly parts?: readonly Token[]
}

interface Joiner extends PlainToken {
  type: 'Joiner'
}

interface UnidentifiedNumberOfSigns extends PlainToken {
  type: 'UnidentifiedNumberOfSigns'
}

interface UnidentifiedSign extends PlainToken {
  type: 'UnidentifiedSign'
}

interface UnclearSign extends PlainToken {
  type: 'UnclearSign'
}

interface Variant extends PlainToken {
  type: 'Variant'
  tokens: readonly Token[]
}

export type Token =
  | PlainToken
  | Word
  | LoneDeterminative
  | Shift
  | Erasure
  | Joiner
  | Variant
  | UnidentifiedNumberOfSigns

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
