import _ from 'lodash'
import { updateIn } from 'immutable'

export class LemmatizationToken {
  constructor (
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
    Object.freeze(this)
  }

  setUniqueLemma (uniqueLemma, suggested = false) {
    return new LemmatizationToken(
      this.value,
      this.lemmatizable,
      uniqueLemma,
      this.suggestions,
      suggested
    )
  }

  applySuggestion () {
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

  clearSuggestionFlag () {
    return new LemmatizationToken(
      this.value,
      this.lemmatizable,
      this.uniqueLemma,
      this.suggestions,
      false
    )
  }

  toDto () {
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

export default class Lemmatization {
  constructor (lines, tokens) {
    this.lines = lines
    this.tokens = tokens
    Object.freeze(this)
  }

  getRowPrefix (rowIndex) {
    return this.lines[rowIndex]
  }

  setLemma (rowIndex, columnIndex, uniqueLemma) {
    return new Lemmatization(
      this.lines,
      updateIn(this.tokens, [rowIndex, columnIndex], token =>
        token.setUniqueLemma(uniqueLemma)
      )
    )
  }

  applySuggestions () {
    return new Lemmatization(
      this.lines,
      this._mapTokens(token => token.applySuggestion())
    )
  }

  clearSuggestionFlags () {
    return new Lemmatization(
      this.lines,
      this._mapTokens(token => token.clearSuggestionFlag())
    )
  }

  toDto () {
    return this.tokens.map(row => row.map(token => token.toDto()))
  }

  _mapTokens (iteratee) {
    return this.tokens.map(row => row.map(iteratee))
  }
}
