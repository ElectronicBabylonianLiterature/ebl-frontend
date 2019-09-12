// @flow
import _ from 'lodash'
// $FlowFixMe
import produce, { immerable, Draft } from 'immer'
import Lemma from './Lemma'

export type UniqueLemma = $ReadOnlyArray<Lemma>

export class LemmatizationToken {
  +value: string
  +uniqueLemma: ?UniqueLemma
  +suggestions: ?$ReadOnlyArray<UniqueLemma>
  +lemmatizable: boolean
  +suggested: boolean

  constructor(
    value: string,
    lemmatizable: boolean,
    uniqueLemma: ?UniqueLemma = null,
    suggestions: ?$ReadOnlyArray<UniqueLemma> = null,
    suggested: boolean = false
  ) {
    this.value = value
    this.uniqueLemma = uniqueLemma
    this.suggestions = suggestions
    this.lemmatizable = lemmatizable
    this.suggested = suggested
  }

  setUniqueLemma(
    uniqueLemma: UniqueLemma,
    suggested: boolean = false
  ): LemmatizationToken {
    return produce(this, (draft: Draft<LemmatizationToken>) => {
      draft.uniqueLemma = uniqueLemma
      draft.suggested = suggested
    })
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

  toDto(): { [string]: mixed } {
    return _.isNil(this.uniqueLemma)
      ? {
          value: this.value
        }
      : {
          value: this.value,
          uniqueLemma: (this.uniqueLemma || []).map(lemma => lemma.value)
        }
  }
}
LemmatizationToken[immerable] = true

export default class Lemmatization {
  +lines: $ReadOnlyArray<string>
  +tokens: $ReadOnlyArray<$ReadOnlyArray<LemmatizationToken>>

  constructor(
    lines: $ReadOnlyArray<string>,
    tokens: $ReadOnlyArray<$ReadOnlyArray<LemmatizationToken>>
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
    return produce(this, (draft: Draft<Lemmatization>) => {
      const token = draft.tokens[rowIndex][columnIndex]
      draft.tokens[rowIndex][columnIndex] = token.setUniqueLemma(uniqueLemma)
    })
  }

  applySuggestions(): Lemmatization {
    return produce(this, (draft: Draft<Lemmatization>) => {
      draft.tokens = this._mapTokens(token => token.applySuggestion())
    })
  }

  clearSuggestionFlags(): Lemmatization {
    return produce(this, (draft: Draft<Lemmatization>) => {
      draft.tokens = this._mapTokens(token => token.clearSuggestionFlag())
    })
  }

  toDto(): $ReadOnlyArray<$ReadOnlyArray<{ [string]: mixed }>> {
    return this.tokens.map(row => row.map(token => token.toDto()))
  }

  _mapTokens(
    iteratee: LemmatizationToken => LemmatizationToken
  ): $ReadOnlyArray<$ReadOnlyArray<LemmatizationToken>> {
    return this.tokens.map(row => row.map(iteratee))
  }
}
Lemmatization[immerable] = true
