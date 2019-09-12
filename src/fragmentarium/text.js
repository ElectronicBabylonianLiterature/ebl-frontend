// @flow
// $FlowFixMe
import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken
} from './lemmatization/Lemmatization'
import type { UniqueLemma } from './lemmatization/Lemmatization'

type Word = {|
  +type: 'Word',
  +value: string,
  +uniqueLemma: $ReadOnlyArray<string>,
  +normalized: boolean,
  +language: string,
  +lemmatizable: boolean,
  +erasure: string,
  +alignment?: number
|}

type LoneDeterminative = {|
  +type: 'LoneDeterminative',
  +value: string,
  +uniqueLemma: $ReadOnlyArray<string>,
  +normalized: boolean,
  +language: string,
  +lemmatizable: boolean,
  +partial: [boolean, boolean],
  +erasure: string,
  +alignment?: number
|}

type Shift = {|
  +type: 'LanguageShift',
  +value: string,
  +normalized: boolean,
  +language: string
|}

type Erasure = {|
  +type: 'Erasure',
  +value: string,
  +side: string
|}

export type Token =
  | {|
      +type: string,
      +value: string
    |}
  | Word
  | LoneDeterminative
  | Shift
  | Erasure

export type Line = {|
  +type: 'ControlLine' | 'EmptyLine' | 'TextLine',
  +prefix: string,
  +content: $ReadOnlyArray<Token>
|}

export class Text {
  +lines: $ReadOnlyArray<Line>

  constructor({ lines }: { lines: $ReadOnlyArray<Line> }) {
    this.lines = lines
  }

  createLemmatization(
    lemmas: { [string]: UniqueLemma },
    suggestions: { [string]: $ReadOnlyArray<UniqueLemma> }
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
