import _ from 'lodash'
// $FlowFixMe
import produce, { immerable } from 'immer'

export class LemmatizationToken {
  constructor(
    value,
    lemmatizable,
    uniqueLemma = null,
    suggestions = null,
    suggested = false
  ) {
    this.value = value
    this.uniqueLemma = uniqueLemma
    this.suggestions = suggestions
    this.lemmatizable = lemmatizable
    this.suggested = suggested
  }

  setUniqueLemma(uniqueLemma, suggested = false) {
    return produce(this, draft => {
      draft.uniqueLemma = uniqueLemma
      draft.suggested = suggested
    })
  }

  applySuggestion() {
    if (
      _.isArray(this.suggestions) &&
      this.suggestions.length === 1 &&
      _.isEmpty(this.uniqueLemma)
    ) {
      return this.setUniqueLemma(this.suggestions[0], true)
    } else {
      return this
    }
  }

  clearSuggestionFlag() {
    return produce(this, draft => {
      draft.suggested = false
    })
  }

  toDto() {
    return _.isNil(this.uniqueLemma)
      ? {
          value: this.value
        }
      : {
          value: this.value,
          uniqueLemma: this.uniqueLemma.map(lemma => lemma.value)
        }
  }
}
LemmatizationToken[immerable] = true

export default class Lemmatization {
  constructor(lines, tokens) {
    this.lines = lines
    this.tokens = tokens
  }

  getRowPrefix(rowIndex) {
    return this.lines[rowIndex]
  }

  setLemma(rowIndex, columnIndex, uniqueLemma) {
    return produce(this, draft => {
      const token = draft.tokens[rowIndex][columnIndex]
      draft.tokens[rowIndex][columnIndex] = token.setUniqueLemma(uniqueLemma)
    })
  }

  applySuggestions() {
    return produce(this, draft => {
      draft.tokens = this._mapTokens(token => token.applySuggestion())
    })
  }

  clearSuggestionFlags() {
    return produce(this, draft => {
      draft.tokens = this._mapTokens(token => token.clearSuggestionFlag())
    })
  }

  toDto() {
    return this.tokens.map(row => row.map(token => token.toDto()))
  }

  _mapTokens(iteratee) {
    return this.tokens.map(row => row.map(iteratee))
  }
}
Lemmatization[immerable] = true
