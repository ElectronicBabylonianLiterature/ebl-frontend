import Word, { wordPosLabels } from 'dictionary/domain/Word'

function createGuideWordAndPos(word: Word): string {
  const posLabels = wordPosLabels(word)
  const pos = posLabels.length > 0 ? ` (${posLabels.join(', ')})` : ''
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
    this.label = `*${this.lemma}*${this.homonym}${createGuideWordAndPos(word)}`
  }
}
