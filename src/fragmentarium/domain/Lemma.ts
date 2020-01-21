import Word from 'dictionary/domain/Word'

function createGuideWordAndPos(word: Word): string {
  const pos = word.pos.length > 0 ? ` (${word.pos.join(', ')})` : ''
  return `, ${word.guideWord}${pos}`
}

export default class Lemma {
  readonly value: string
  readonly lemma: string
  readonly homonym: string
  readonly label: string

  constructor(word: Word) {
    this.value = word._id
    this.lemma = word.lemma.join(' ')
    this.homonym = word.homonym === 'I' ? '' : ` ${word.homonym}`
    this.label = `${this.lemma}${this.homonym}${createGuideWordAndPos(word)}`
  }
}
