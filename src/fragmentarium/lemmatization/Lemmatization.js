import _ from 'lodash'

export class LemmatizationToken {
  constructor (value, lemmatizable, uniqueLemma = null, suggestions = null, suggested = false) {
    this.value = value
    this.uniqueLemma = uniqueLemma
    this.suggestions = suggestions
    this.lemmatizable = lemmatizable
    this.suggested = suggested
  }

  setUniqueLemma = uniqueLemma => {
    this.uniqueLemma = uniqueLemma
    this.suggested = false
  }

  applySuggestion = () => {
    if (_.isArray(this.suggestions) &&
      this.suggestions.length === 1 &&
      _.isEmpty(this.uniqueLemma)) {
      this.uniqueLemma = this.suggestions[0]
      this.suggested = true
    }
  }

  clearSuggestionFlag = () => {
    this.suggested = false
  }

  toDto = () => _.isNil(this.uniqueLemma)
    ? {
      value: this.value
    }
    : {
      value: this.value,
      uniqueLemma: this.uniqueLemma.map(lemma => lemma.value)
    }
}

export default class Lemmatization {
  constructor (lines, tokens) {
    this.lines = lines
    this.tokens = tokens
  }

  getRowPrefix = rowIndex => this.lines[rowIndex]

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.tokens[rowIndex][columnIndex].setUniqueLemma(uniqueLemma)
    return this
  }

  applySuggestions = () => {
    this._forEachToken(token => token.applySuggestion())
    return this
  }

  clearSuggestionFlags = () => {
    this._forEachToken(token => token.clearSuggestionFlag())
    return this
  }

  toDto = () => this.tokens.map(row => row.map(token => token.toDto()))

  _forEachToken = iteratee => _(this.tokens).flatten().forEach(iteratee)
}
