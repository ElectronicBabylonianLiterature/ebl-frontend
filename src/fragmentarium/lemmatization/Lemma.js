import _ from 'lodash'

export default class Lemma {
  constructor (word) {
    this.value = word._id
    this.lemma = word.lemma.join(' ')
    this.homonym = word.homonym
    this.label = `${word._id}, ${
      _.truncate(word.meaning.replace(/\*|\\/g, ''), {
        separator: ' ',
        omission: '…'
      })
    }`
  }
}
