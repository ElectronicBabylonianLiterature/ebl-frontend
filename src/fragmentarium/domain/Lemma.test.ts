import { factory } from 'factory-girl'
import Lemma from './Lemma'
import Word from 'dictionary/domain/Word'

let word: Word
let lemma: Lemma

describe('Homonym I', () => {
  beforeEach(async () => {
    word = await factory.build('word', {
      homonym: 'I'
    })
    lemma = new Lemma(word)
  })

  test('homonym', () => {
    expect(lemma.homonym).toEqual('')
  })

  commonTests()
})

describe('Homonym not I', () => {
  beforeEach(async () => {
    word = await factory.build('word', {
      homonym: 'II'
    })
    lemma = new Lemma(word)
  })

  test('homonym', () => {
    expect(lemma.homonym).toEqual(` ${word.homonym}`)
  })

  commonTests()
})

describe('Empty POS', () => {
  beforeEach(async () => {
    word = await factory.build('word', {
      pos: []
    })
    lemma = new Lemma(word)
  })

  commonTests()
})

function guideWordAndPos(word: Word): string {
  const pos = word.pos.length > 0 ? ` (${word.pos.join(', ')})` : ''
  return `${word.guideWord}${pos}`
}

function commonTests(): void {
  test('value', () => {
    expect(lemma.value).toEqual(word._id)
  })

  test('lemma', () => {
    expect(lemma.lemma).toEqual(word.lemma.join(' '))
  })

  test('label', () => {
    expect(lemma.label).toEqual(
      `*${lemma.lemma}*${lemma.homonym}, ${guideWordAndPos(word)}`
    )
  })
}
