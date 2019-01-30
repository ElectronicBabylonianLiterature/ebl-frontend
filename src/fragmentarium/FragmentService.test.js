import Promise from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { testDelegation } from 'testHelpers'
import FragmentService from './FragmentService'
import createFolio from 'fragmentarium/createFolio'
import Lemmatization, { LemmatizationToken } from 'fragmentarium/lemmatization/Lemmatization'
import Lemma from 'fragmentarium/lemmatization/Lemma'

const resultStub = {}
const folio = createFolio('AKG', '375')
const auth = {
  isAllowedToReadFragments: jest.fn(),
  isAllowedToTransliterateFragments: jest.fn(),
  isAllowedToLemmatizeFragments: jest.fn(),
  hasBetaAccess: jest.fn()
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
  updateReferences: jest.fn(),
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
const bibliographyRepository = {
  find: jest.fn(),
  search: jest.fn()
}
const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, wordRepository, bibliographyRepository)

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
  ['updateReferences', ['K.1', [[{ id: 'id', type: 'EDITION', 'notes': '', pages: '', linesCited: [] }]]], fragmentRepository.updateReferences, resultStub],
  ['findFolio', [folio], imageRepository.find, resultStub, [folio.fileName]],
  ['isAllowedToRead', [], auth.isAllowedToReadFragments, true],
  ['isAllowedToTransliterate', [], auth.isAllowedToTransliterateFragments, true],
  ['isAllowedToLemmatize', [], auth.isAllowedToLemmatizeFragments, true],
  ['hasBetaAccess', [], auth.hasBetaAccess, true],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]],
  ['searchBibliography', ['Alba Cecilia 1998 The Qualifications'], bibliographyRepository.search, [resultStub], ['Alba Cecilia', '1998', 'The Qualifications']],
  ['searchBibliography', ['Alba Cecilia'], bibliographyRepository.search, [resultStub], ['Alba Cecilia', '', '']],
  ['findBibliography', ['RN2020'], bibliographyRepository.find, resultStub]
]

testDelegation(fragmentService, testData)

describe.each([
  'searchLemma',
  'searchBibliography'
])('%s', method => {
  it('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
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

  const expected = new Lemmatization(['1.'], [[
    new LemmatizationToken(
      'kur',
      true,
      [new Lemma(words[0])],
      [[new Lemma(words[2])]]
    ),
    new LemmatizationToken(
      'nu',
      true,
      [new Lemma(words[1])],
      [[new Lemma(words[3])]]
    )
  ]])

  const result = await fragmentService.createLemmatization(text)
  expect(result).toEqual(expected)
})
