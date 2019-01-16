import { factory } from 'factory-girl'
import Lemma from './Lemma'

let word
let lemma

describe('Homonym I', () => {
  beforeEach(async () => {
    word = await factory.build('word', {
      'lemma': ['waklu', 'waklu'],
      'homonym': 'I',
      'meaning': 'a very very long complicated meaning of a word'
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
      'lemma': ['waklu', 'waklu'],
      'homonym': 'II',
      'meaning': 'a very very long complicated meaning of a word'
    })
    lemma = new Lemma(word)
  })

  test('homonym', () => {
    expect(lemma.homonym).toEqual(` ${word.homonym}`)
  })

  commonTests()
})

function commonTests () {
  test('value', () => {
    expect(lemma.value).toEqual(word._id)
  })

  test('lemma', () => {
    expect(lemma.lemma).toEqual(word.lemma.join(' '))
  })

  test('label', () => {
    expect(lemma.label).toEqual(`${lemma.lemma}${lemma.homonym}, a very very long complicated…`)
  })
}
