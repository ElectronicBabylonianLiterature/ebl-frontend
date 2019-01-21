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
  lemmatization = Lemmatization.fromText(text)
})

it('Maps tokens', () => {
  expect(lemmatization.tokens).toEqual(text.lines.map(lines => lines.content))
})

it('Sets unique lemma', () => {
  const uniqueLemma = [new Lemma(words[1])]
  const expected = _.cloneDeep(lemmatization.tokens[0][0])
  expected.uniqueLemma = uniqueLemma
  expected.suggested = false
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

it('setSuggestions sets suggestions', () => {
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [words[0]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          },
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }
        ]
      }
    ]
  }
  lemmatization = new Lemmatization(text, [[
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[0])],
      suggestions: [[new Lemma(words[1])]],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    },
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [],
      suggestions: [[new Lemma(words[1])]],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    }
  ]])
  const expected = [[
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[0])],
      suggestions: [[new Lemma(words[1])]],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    },
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[1])],
      suggestions: [[new Lemma(words[1])]],
      suggested: true,
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    }
  ]]
  lemmatization.setSuggestions()
  expect(lemmatization.tokens).toEqual(expected)
})

it('clearSuggestionFalgs clears flags', () => {
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [words[0]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          },
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }
        ]
      }
    ]
  }
  lemmatization = new Lemmatization(text, [[
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[0])],
      suggestions: [[new Lemma(words[1])]],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    },
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[1])],
      suggestions: [[new Lemma(words[1])]],
      suggested: true,
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    }
  ]])
  const expected = [[
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[0])],
      suggestions: [[new Lemma(words[1])]],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    },
    {
      type: 'Word',
      value: 'kur',
      uniqueLemma: [new Lemma(words[1])],
      suggestions: [[new Lemma(words[1])]],
      suggested: false,
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true
    }
  ]]
  lemmatization.clearSuggestionFlags()
  expect(lemmatization.tokens).toEqual(expected)
})
