import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken
} from 'fragmentarium/domain/Lemmatization'
import { UniqueLemma } from 'fragmentarium/domain/Lemmatization'
import Lemma from './Lemma';

interface Word {
  readonly type: 'Word'
  readonly value: string
  readonly uniqueLemma: ReadonlyArray<string>
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable: boolean
  readonly erasure: string
  readonly alignment?: number
}

interface LoneDeterminative {
  readonly type: 'LoneDeterminative'
  readonly value: string
  readonly uniqueLemma: ReadonlyArray<string>
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable: boolean
  readonly partial: [boolean, boolean]
  readonly erasure: string
  readonly alignment: number
}

interface Shift {
  readonly type: 'LanguageShift'
  readonly value: string
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable?: false
  readonly uniqueLemma?: null
}

interface Erasure {
  readonly type: 'Erasure'
  readonly value: string
  readonly side: string
  readonly lemmatizable?: false
  readonly uniqueLemma?: null
}

export type Token =
  | {
      readonly type: string
      readonly value: string
      readonly lemmatizable?: false
      readonly uniqueLemma?: null
    }
  | Word
  | LoneDeterminative
  | Shift
  | Erasure

export interface Line {
  readonly type: 'ControlLine' | 'EmptyLine' | 'TextLine'
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
