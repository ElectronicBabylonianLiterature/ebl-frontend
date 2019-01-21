import _ from 'lodash'

export default class Lemmatization {
  constructor (text, tokens) {
    this.tokens = tokens
    this.text = text
  }

  getRowPrefix = rowIndex => this.text.lines[rowIndex].prefix

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.tokens[rowIndex][columnIndex].uniqueLemma = uniqueLemma
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
