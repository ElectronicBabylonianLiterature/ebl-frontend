import _ from 'lodash'

export default class Lemmatization {
  constructor (text) {
    this.tokens = _(text.lines)
      .map('content')
      .map(_.cloneDeep)
      .value()
    this.text = text
  }

  getRowPrefix = rowIndex => this.text.lines[rowIndex].prefix

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.tokens[rowIndex][columnIndex].uniqueLemma = uniqueLemma
    return this
  }

  toDto = () => this.tokens.map(row => row.map(token => _.pick(token, 'value', 'uniqueLemma')))
}
