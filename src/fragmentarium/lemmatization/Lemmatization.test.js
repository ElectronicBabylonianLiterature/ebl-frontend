import _ from 'lodash'
import Lemmatization from './Lemmatization'

let text
let lemmatization

beforeEach(async () => {
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: ['aklu I'],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
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
  const uniqueLemma = ['aklu II']
  const expected = _.cloneDeep(lemmatization.tokens[0][0])
  expected.uniqueLemma = uniqueLemma
  lemmatization.setLemma(0, 0, uniqueLemma)
  expect(lemmatization.tokens[0][0]).toEqual(expected)
})

it('Does not mutate text', () => {
  const expected = _.cloneDeep(text)
  lemmatization.setLemma(0, 0, ['aklu II'])
  expect(lemmatization.text).toEqual(expected)
})

it('Creates correct DTO', () => {
  expect(lemmatization.toDto()).toEqual([[
    {
      value: 'kur',
      uniqueLemma: ['aklu I']
    }
  ]])
})
