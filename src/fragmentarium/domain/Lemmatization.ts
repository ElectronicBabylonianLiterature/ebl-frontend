import _ from 'lodash'
import produce, { Draft, immerable } from 'immer'

import Lemma from './Lemma'

export type UniqueLemma = ReadonlyArray<Lemma>

export class LemmatizationToken {
  readonly value: string
  readonly uniqueLemma: UniqueLemma | null
  readonly suggestions: ReadonlyArray<UniqueLemma> | null
  readonly lemmatizable: boolean
  readonly suggested: boolean

  constructor(
    value: string,
    lemmatizable: boolean,
    uniqueLemma: UniqueLemma | null = null,
    suggestions: ReadonlyArray<UniqueLemma> | null = null,
    suggested = false
  ) {
    this.value = value
    this.uniqueLemma = uniqueLemma
    this.suggestions = suggestions
    this.lemmatizable = lemmatizable
    this.suggested = suggested
  }

  setUniqueLemma(
    uniqueLemma: UniqueLemma,
    suggested = false
  ): LemmatizationToken {
    return produce((draft: Draft<LemmatizationToken>, uniqueLemma) => {
      draft.uniqueLemma = uniqueLemma
      draft.suggested = suggested
    })(this, uniqueLemma)
  }

  applySuggestion(): LemmatizationToken {
    if (
      this.suggestions &&
      this.suggestions.length === 1 &&
      _.isEmpty(this.uniqueLemma)
    ) {
      return this.setUniqueLemma(this.suggestions[0], true)
    } else {
      return this
    }
  }

  clearSuggestionFlag(): LemmatizationToken {
    return produce(this, (draft: Draft<LemmatizationToken>) => {
      draft.suggested = false
    })
  }

  toDto(): any {
    return _.isNil(this.uniqueLemma)
      ? {
          value: this.value,
        }
      : {
          value: this.value,
          uniqueLemma: (this.uniqueLemma || []).map((lemma) => lemma.value),
        }
  }
}
LemmatizationToken[immerable] = true

export default class Lemmatization {
  readonly lines: ReadonlyArray<string>
  readonly tokens: ReadonlyArray<ReadonlyArray<LemmatizationToken>>

  constructor(
    lines: ReadonlyArray<string>,
    tokens: ReadonlyArray<ReadonlyArray<LemmatizationToken>>
  ) {
    this.lines = lines
    this.tokens = tokens
  }

  getRowPrefix(rowIndex: number): string {
    return this.lines[rowIndex]
  }

  setLemma(
    rowIndex: number,
    columnIndex: number,
    uniqueLemma: UniqueLemma
  ): Lemmatization {
    return produce((draft: Draft<Lemmatization>, token) => {
      draft.tokens[rowIndex][columnIndex] = token
    })(this, this.tokens[rowIndex][columnIndex].setUniqueLemma(uniqueLemma))
  }

  applySuggestions(): Lemmatization {
    return produce((draft: Draft<Lemmatization>, tokens) => {
      draft.tokens = tokens
    })(
      this,
      this._mapTokens((token) => token.applySuggestion())
    )
  }

  clearSuggestionFlags(): Lemmatization {
    return produce((draft: Draft<Lemmatization>, tokens) => {
      draft.tokens = tokens
    })(
      this,
      this._mapTokens((token) => token.clearSuggestionFlag())
    )
  }

  toDto(): ReadonlyArray<ReadonlyArray<{ [key: string]: any }>> {
    return this.tokens.map((row) => row.map((token) => token.toDto()))
  }

  _mapTokens(
    iteratee: (token: LemmatizationToken) => LemmatizationToken
  ): ReadonlyArray<ReadonlyArray<LemmatizationToken>> {
    return this.tokens.map((row) => row.map(iteratee))
  }
}
Lemmatization[immerable] = true
