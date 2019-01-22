import _ from 'lodash'
import { factory } from 'factory-girl'
import Lemma from './Lemma'
import Lemmatization, { LemmatizationToken } from './Lemmatization'

let words

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
})

it('Sets unique lemma', () => {
  const lemmatization = new Lemmatization(['1.'], [[
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[0])],
      []
    )
  ]])
  const uniqueLemma = [new Lemma(words[1])]
  lemmatization.setLemma(0, 0, uniqueLemma)
  expect(lemmatization.tokens[0][0].uniqueLemma).toEqual(uniqueLemma)
})

it('setUniqueLemma clears sugegsted', () => {
  const lemmatization = new Lemmatization(['1.'], [[
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[0])],
      [[new Lemma(words[0])]],
      true
    )
  ]])
  lemmatization.setLemma(0, 0, [new Lemma(words[1])])
  expect(lemmatization.tokens[0][0].suggested).toEqual(false)
})

it('Creates correct DTO', () => {
  const lemmatization = new Lemmatization(['1.'], [[
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[0])],
      []
    ),
    new LemmatizationToken(
      '%sux',
      false
    )
  ]])
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

it('applySuggestions sets suggestions', () => {
  const lemmatization = new Lemmatization(['1.'], [[
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[0])],
      [[new Lemma(words[1])]]
    ),
    new LemmatizationToken(
      'kur',
      true,
      [],
      [[new Lemma(words[1])]]
    )
  ]])
  lemmatization.applySuggestions()
  expect(_.map(lemmatization.tokens[0], 'uniqueLemma')).toEqual([
    [new Lemma(words[0])],
    [new Lemma(words[1])]
  ])
})

it('clearSuggestionFlags clears flags', () => {
  const lemmatization = new Lemmatization(['1.'], [[
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[0])],
      [[new Lemma(words[1])]]
    ),
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[1])],
      [[new Lemma(words[1])]],
      true
    )
  ]])
  lemmatization.clearSuggestionFlags()
  expect(_.map(lemmatization.tokens[0], 'suggested')).toEqual([false, false])
})
