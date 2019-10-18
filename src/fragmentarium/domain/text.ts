import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken
} from 'fragmentarium/domain/Lemmatization'
import { UniqueLemma } from 'fragmentarium/domain/Lemmatization'

interface Word {
  readonly type: 'Word'
  readonly value: string
  readonly uniqueLemma: ReadOnlyArray<string>
  readonly normalized: boolean
  readonly language: string
  readonly lemmatizable: boolean
  readonly erasure: string
  readonly alignment?: number
}

interface LoneDeterminative {
  readonly type: 'LoneDeterminative'
  readonly value: string
  readonly uniqueLemma: ReadOnlyArray<string>
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
}

interface Erasure {
  readonly type: 'Erasure',
  readonly value: string,
  readonly side: string,
  readonly lemmatizable?: false
}

export type Token =
  {
    readonly type: string,
    readonly value: string,
    readonly lemmatizable?: false
  }
  | Word
  | LoneDeterminative
  | Shift
  | Erasure

export interface Line {
  readonly type: 'ControlLine' | 'EmptyLine' | 'TextLine'
  readonly prefix: string
  readonly content: ReadOnlyArray<Token>
}

export class Text {
  readonly lines: ReadOnlyArray<Line>

  constructor({ lines }: { lines: ReadOnlyArray<Line> }) {
    this.lines = lines
  }

  createLemmatization(
    lemmas: { [key: string]: UniqueLemma },
    suggestions: { [key: string]: ReadOnlyArray<UniqueLemma> }
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
