import _ from 'lodash'

import Lemma from './Lemma'
import Lemmatization, { LemmatizationToken } from './Lemmatization'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

let words: Word[]

beforeEach(() => {
  words = wordFactory.buildList(2)
})

it('Equals', () => {
  const lemmatization = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('kur', true, [new Lemma(words[0])], [])]],
  )
  const anotherLemmatization = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('kur', true, [new Lemma(words[0])], [])]],
  )
  const differentLemmatization = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('ra', true, [new Lemma(words[0])], [])]],
  )
  expect(_.isEqual(lemmatization, anotherLemmatization)).toEqual(true)
  expect(_.isEqual(lemmatization, differentLemmatization)).toEqual(false)
})

it('Sets unique lemma', () => {
  const lemmatization = new Lemmatization(
    ['1.'],
    [[new LemmatizationToken('kur', true, [new Lemma(words[0])], [])]],
  )
  const uniqueLemma = [new Lemma(words[1])]
  expect(
    lemmatization.setLemma(0, 0, uniqueLemma).tokens[0][0].uniqueLemma,
  ).toEqual(uniqueLemma)
})

it('setUniqueLemma clears sugegsted', () => {
  const lemmatization = new Lemmatization(
    ['1.'],
    [
      [
        new LemmatizationToken(
          'kur',
          true,
          [new Lemma(words[0])],
          [[new Lemma(words[0])]],
          true,
        ),
      ],
    ],
  )
  expect(
    lemmatization.setLemma(0, 0, [new Lemma(words[1])]).tokens[0][0].suggested,
  ).toEqual(false)
})

it('Creates correct DTO', () => {
  const lemmatization = new Lemmatization(
    ['1.'],
    [
      [
        new LemmatizationToken('kur', true, [new Lemma(words[0])], []),
        new LemmatizationToken('%sux', false),
      ],
    ],
  )
  expect(lemmatization.toDto()).toEqual([
    [
      {
        value: 'kur',
        uniqueLemma: [words[0]._id],
      },
      {
        value: '%sux',
      },
    ],
  ])
})

it('applySuggestions sets suggestions', () => {
  const lemmatization = new Lemmatization(
    ['1.'],
    [
      [
        new LemmatizationToken(
          'kur',
          true,
          [new Lemma(words[0])],
          [[new Lemma(words[1])]],
        ),
        new LemmatizationToken('kur', true, [], [[new Lemma(words[1])]]),
      ],
    ],
  )
  expect(
    _.map(lemmatization.applySuggestions().tokens[0], 'uniqueLemma'),
  ).toEqual([[new Lemma(words[0])], [new Lemma(words[1])]])
})

it('clearSuggestionFlags clears flags', () => {
  const lemmatization = new Lemmatization(
    ['1.'],
    [
      [
        new LemmatizationToken(
          'kur',
          true,
          [new Lemma(words[0])],
          [[new Lemma(words[1])]],
        ),
        new LemmatizationToken(
          'kur',
          true,
          [new Lemma(words[1])],
          [[new Lemma(words[1])]],
          true,
        ),
      ],
    ],
  )
  expect(
    _.map(lemmatization.clearSuggestionFlags().tokens[0], 'suggested'),
  ).toEqual([false, false])
})

test.each([
  [
    new LemmatizationToken('kur', true, [
      new Lemma(
        wordFactory.build({
          _id: '',
          lemma: ['kur'],
          homonym: 'I',
          pos: [],
          guideWord: '',
          arabicGuideWord: '',
          origin: 'CDA',
          cdaAddenda: '(egg-shaped) bead',
          supplementsAkkadianDictionaries: 'word',
          oraccWords: [],
          akkadischeGlossareUndIndices: [],
        }),
      ),
    ]),
    true,
  ],
  [new LemmatizationToken('kur', true, []), false],
  [new LemmatizationToken('kur', true, null), false],
])('hasLemma', (token, expected) => {
  expect(token.hasLemma).toEqual(expected)
})
