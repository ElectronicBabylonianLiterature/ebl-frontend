import Promise from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { testDelegation } from 'testHelpers'
import FragmentService from './FragmentService'
import createFolio from 'fragmentarium/createFolio'
import Lemmatization from 'fragmentarium/lemmatization/Lemmatization'
import Lemma from 'fragmentarium/lemmatization/Lemma'

const resultStub = {}
const folio = createFolio('AKG', '375')
const auth = {
  isAllowedToReadFragments: jest.fn(),
  isAllowedToTransliterateFragments: jest.fn(),
  isAllowedToLemmatizeFragments: jest.fn()
}
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  random: jest.fn(),
  interesting: jest.fn(),
  searchNumber: jest.fn(),
  searchTransliteration: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  folioPager: jest.fn(),
  findLemmas: jest.fn()
}
const wordRepository = {
  searchLemma: jest.fn(),
  find: jest.fn()
}
const imageRepository = {
  find: jest.fn()
}
const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, wordRepository)

const testData = [
  ['statistics', [], fragmentRepository.statistics, resultStub],
  ['find', ['K.1'], fragmentRepository.find, resultStub],
  ['random', [], fragmentRepository.random, resultStub, null, Promise.resolve([resultStub])],
  ['interesting', [], fragmentRepository.interesting, resultStub, null, Promise.resolve([resultStub])],
  ['random', [], fragmentRepository.random, undefined, null, Promise.resolve([])],
  ['interesting', [], fragmentRepository.interesting, undefined, null, Promise.resolve([])],
  ['searchNumber', ['K.1'], fragmentRepository.searchNumber, resultStub],
  ['searchTransliteration', ['kur'], fragmentRepository.searchTransliteration, resultStub],
  ['updateTransliteration', ['K.1', '1. kur', 'notes'], fragmentRepository.updateTransliteration, resultStub],
  ['updateLemmatization', ['K.1', [[{ value: 'kur', uniqueLemma: [] }]]], fragmentRepository.updateLemmatization, resultStub],
  ['findFolio', [folio], imageRepository.find, resultStub, [folio.fileName]],
  ['isAllowedToRead', [], auth.isAllowedToReadFragments, true],
  ['isAllowedToTransliterate', [], auth.isAllowedToTransliterateFragments, true],
  ['isAllowedToLemmatize', [], auth.isAllowedToLemmatizeFragments, true],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]]
]

testDelegation(fragmentService, testData)

it('searchLemma resolves to empty array on zero length query', async () => {
  await expect(fragmentService.searchLemma('')).resolves.toEqual([])
})

it('createLemmatization', async () => {
  const words = await factory.buildMany('word', 4)
  const wordMap = _.keyBy(words, '_id')
  const suggestions = {
    'kur': words[2],
    'nu': words[3]
  }
  const text = {
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
            value: 'nu',
            uniqueLemma: [words[1]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }
        ]
      }
    ]
  }
  wordRepository.find.mockImplementation(id => wordMap[id]
    ? Promise.resolve(wordMap[id])
    : Promise.reject(new Error())
  )
  fragmentRepository.findLemmas.mockImplementation(word => Promise.resolve(suggestions[word]
    ? [[suggestions[word]]]
    : [])
  )

  const expected = Lemmatization.fromText(text, token => ({
    ...token,
    uniqueLemma: token.uniqueLemma.map(uniqueLemma => new Lemma(wordMap[uniqueLemma])),
    suggestions: [[new Lemma(suggestions[token.value])]]
  }))

  const result = await fragmentService.createLemmatization(text)
  expect(result.tokens).toEqual(expected.tokens)
  expect(result.text).toEqual(text)
})
