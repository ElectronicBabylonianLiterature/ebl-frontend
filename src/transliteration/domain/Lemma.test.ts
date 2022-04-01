import Lemma from './Lemma'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

let word: Word
let lemma: Lemma

describe.each([
  ['I', ''],
  ['II', ' II'],
])('Word with homonym %s', (homonym, expected) => {
  beforeEach(() => {
    word = wordFactory.build({ homonym: homonym })
    lemma = new Lemma(word)
  })

  test('homonym', () => {
    expect(lemma.homonym).toEqual(expected)
  })

  test('label', () => {
    const pos = word.pos.join(', ')
    expect(lemma.label).toEqual(`${expectedLabel()} (${pos})`)
  })

  commonTests()
})

describe('Empty POS', () => {
  beforeEach(() => {
    word = wordFactory.build({ pos: [] })
    lemma = new Lemma(word)
  })

  test('label', () => {
    expect(lemma.label).toEqual(expectedLabel())
  })

  commonTests()
})

function expectedLabel(): string {
  return `*${lemma.lemma}*${lemma.homonym}, ${word.guideWord}`
}

function commonTests(): void {
  test('value', () => {
    expect(lemma.value).toEqual(word._id)
  })

  test('lemma', () => {
    expect(lemma.lemma).toEqual(word.lemma.join(' '))
  })
}
