import _ from 'lodash'

export default class Lemmatization {
  constructor (text, tokens) {
    this.tokens = tokens
    this.text = text
  }

  getRowPrefix = rowIndex => this.text.lines[rowIndex].prefix

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    const token = this.tokens[rowIndex][columnIndex]
    token.uniqueLemma = uniqueLemma
    token.suggested = false
    return this
  }

  setSuggestions = () => {
    this.tokens.forEach(row => row.forEach(token => {
      if (_.isArray(token.suggestions) &&
        token.suggestions.length === 1 &&
        _.isEmpty(token.uniqueLemma)) {
        token.uniqueLemma = token.suggestions[0]
        token.suggested = true
      }
    }))
    return this
  }

  clearSuggestionFlags = () => {
    this.tokens.forEach(row => row.forEach(token => {
      if (token.suggested) {
        token.suggested = false
      }
    }))
    return this
  }

  toDto = () => this.tokens.map(row => row.map(token => _.isNil(token.uniqueLemma)
    ? {
      value: token.value
    }
    : {
      value: token.value,
      uniqueLemma: token.uniqueLemma.map(lemma => lemma.value)
    }
  ))

  static fromText (text, tokenFactory = _.cloneDeep) {
    const tokens = _(text.lines)
      .map('content')
      .map(line => line.map(tokenFactory))
      .value()
    return new Lemmatization(text, tokens)
  }
}
