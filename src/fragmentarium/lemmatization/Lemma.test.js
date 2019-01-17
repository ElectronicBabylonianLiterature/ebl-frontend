import { factory } from 'factory-girl'
import _ from 'lodash'
import Lemma from './Lemma'

const meaning = 'a very very long complicated meaning of a word'
let word
let lemma

describe('Homonym I', () => {
  beforeEach(async () => {
    word = await factory.build('word', {
      homonym: 'I',
      meaning: meaning
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
      homonym: 'II',
      meaning: meaning
    })
    lemma = new Lemma(word)
  })

  test('homonym', () => {
    expect(lemma.homonym).toEqual(` ${word.homonym}`)
  })

  commonTests()
})

test('Empty meaning', async () => {
  word = await factory.build('word', {
    meaning: ''
  })
  lemma = new Lemma(word)
  expect(lemma.label).toEqual(`${lemma.lemma}${lemma.homonym}, ${truncateMeaning(word.amplifiedMeanings[0].meaning)}`)
})

test('Empty amplified meaning', async () => {
  word = await factory.build('word', {
    meaning: '',
    amplifiedMeanings: [
      await factory.build('amplifiedMeaning', {
        meaning: ''
      })
    ]
  })
  lemma = new Lemma(word)
  expect(lemma.label).toEqual(`${lemma.lemma}${lemma.homonym}, ${truncateMeaning(word.amplifiedMeanings[0].entries[0].meaning)}`)
})

test('No meanings', async () => {
  word = await factory.build('word', {
    meaning: '',
    amplifiedMeanings: []
  })
  lemma = new Lemma(word)
  expect(lemma.label).toEqual(`${lemma.lemma}${lemma.homonym}`)
})

function truncateMeaning (meaning) {
  return _.truncate(meaning.replace(/\*|\\/g, ''), {
    separator: ' ',
    omission: '…'
  })
}

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
