import _ from 'lodash'
import { factory } from 'factory-girl'
import Lemma from './Lemma'
import Lemmatization from './Lemmatization'

let words
let text
let lemmatization

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [new Lemma(words[0])],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          },
          {
            type: 'LanguageShift',
            value: '%sux',
            lemmatizable: false
          }
        ]
      }
    ]
  }
  lemmatization = new Lemmatization(text)
})

it('Maps tokens', () => {
  expect(lemmatization.tokens).toEqual(text.lines.map(lines => lines.content))
})

it('Sets unique lemma', () => {
  const uniqueLemma = [new Lemma(words[1])]
  const expected = _.cloneDeep(lemmatization.tokens[0][0])
  expected.uniqueLemma = uniqueLemma
  lemmatization.setLemma(0, 0, uniqueLemma)
  expect(lemmatization.tokens[0][0]).toEqual(expected)
})

it('Does not mutate text', () => {
  const expected = _.cloneDeep(text)
  lemmatization.setLemma(0, 0, [new Lemma(words[1])])
  expect(lemmatization.text).toEqual(expected)
})

it('Creates correct DTO', () => {
  expect(lemmatization.toDto()).toEqual([[
    {
      value: 'kur',
      uniqueLemma: [words[0]._id]
    },
    {
      value: '%sux'
    }
  ]])
})
