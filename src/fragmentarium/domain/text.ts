import { immerable } from 'immer'
import Lemmatization, {
  LemmatizationToken
, UniqueLemma } from 'fragmentarium/domain/Lemmatization'

import Lemma from './Lemma'

type Word = {
  readonly type: 'Word';
  readonly value: string;
  readonly uniqueLemma: ReadonlyArray<string>;
  readonly normalized: boolean;
  readonly language: string;
  readonly lemmatizable: boolean;
  readonly erasure: string;
  readonly alignment?: number;
}

type LoneDeterminative = {
  readonly type: 'LoneDeterminative';
  readonly value: string;
  readonly uniqueLemma: ReadonlyArray<string>;
  readonly normalized: boolean;
  readonly language: string;
  readonly lemmatizable: boolean;
  readonly partial: [boolean, boolean];
  readonly erasure: string;
  readonly alignment?: number;
}

type Shift = {
  readonly type: 'LanguageShift';
  readonly value: string;
  readonly normalized: boolean;
  readonly language: string;
  readonly lemmatizable?: false;
  readonly uniqueLemma?: null;
}

type Erasure = {
  readonly type: 'Erasure';
  readonly value: string;
  readonly side: string;
  readonly lemmatizable?: false;
  readonly uniqueLemma?: null;
}

type PlainToken = {
  readonly type: string;
  readonly value: string;
  readonly lemmatizable?: false;
  readonly uniqueLemma?: null;
}

export type Token = PlainToken | Word | LoneDeterminative | Shift | Erasure

export type lineType = 'ControlLine' | 'EmptyLine' | 'TextLine'

export interface Line {
  readonly type: lineType;
  readonly prefix: string;
  readonly content: ReadonlyArray<Token>;
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
