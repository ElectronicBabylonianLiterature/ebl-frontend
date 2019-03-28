import Promise from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { List, fromJS } from 'immutable'
import { testDelegation } from 'test-helpers/testHelpers'
import FragmentService from './FragmentService'
import Lemmatization, { LemmatizationToken } from 'fragmentarium/lemmatization/Lemmatization'
import Lemma from 'fragmentarium/lemmatization/Lemma'
import { Text, Line, Folio } from 'fragmentarium/fragment'

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
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
  findLemmas: jest.fn(),
  fetchLatestTransliterations: jest.fn()
}
const wordRepository = {
  searchLemma: jest.fn(),
  find: jest.fn()
}
const imageRepository = {
  find: jest.fn()
}
const bibliographyService = {
  find: jest.fn(),
  search: jest.fn()
}
const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, wordRepository, bibliographyService)
const testData = [
  ['statistics', [], fragmentRepository.statistics, resultStub],
  ['random', [], fragmentRepository.random, resultStub, null, Promise.resolve([resultStub])],
  ['interesting', [], fragmentRepository.interesting, resultStub, null, Promise.resolve([resultStub])],
  ['random', [], fragmentRepository.random, undefined, null, Promise.resolve([])],
  ['interesting', [], fragmentRepository.interesting, undefined, null, Promise.resolve([])],
  ['searchNumber', ['K.1'], fragmentRepository.searchNumber, resultStub],
  ['searchTransliteration', ['kur'], fragmentRepository.searchTransliteration, resultStub],
  ['updateTransliteration', ['K.1', '1. kur', 'notes'], fragmentRepository.updateTransliteration, resultStub],
  ['updateLemmatization', ['K.1', [[{ value: 'kur', uniqueLemma: [] }]]], fragmentRepository.updateLemmatization, resultStub],
  ['updateReferences', ['K.1', [[{ id: 'id', type: 'EDITION', 'notes': '', pages: '', linesCited: [] }]]], fragmentRepository.updateReferences, resultStub],
  ['findFolio', [folio], imageRepository.find, resultStub, [folio.fileName, true]],
  ['findImage', [fileName], imageRepository.find, resultStub, [fileName, false]],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]],
  ['searchBibliography', ['Alba Cecilia 1998 The Qualifications'], bibliographyService.search, [resultStub]],
  ['fetchLatestTransliterations', [], fragmentRepository.fetchLatestTransliterations, resultStub]
]

testDelegation(fragmentService, testData)

describe.each([
  'searchLemma'
])('%s', method => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('find', () => {
  const number = 'K.1'
  let expectedFragment
  let result

  beforeEach(async () => {
    const { entries, references, expectedReferences } = await setUpHydration()
    const fragment = await factory.build('fragment', { number: number, references: references })

    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
    bibliographyService.find.mockImplementation(id => Promise.resolve(entries.find(entry => entry.id === id)))

    expectedFragment = fragment.setReferences(expectedReferences)

    result = await fragmentService.find(fragment.number)
  })

  test('Returns hydrated fragment', () => expect(result).toEqual(expectedFragment))
  test('Finds correct fragment', () => expect(fragmentRepository.find).toHaveBeenCalledWith(number))
})

test('createLemmatization', async () => {
  const words = await factory.buildMany('word', 4)
  const wordMap = _.keyBy(words, '_id')
  const suggestions = {
    'kur': words[2],
    'nu': words[3]
  }
  const text = Text({ lines: List.of(
    Line({
      type: 'TextLine',
      prefix: '1.',
      content: List.of(
        fromJS({
          type: 'Word',
          value: 'kur',
          uniqueLemma: [words[0]._id],
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true
        }),
        fromJS({
          type: 'Word',
          value: 'nu',
          uniqueLemma: [words[1]._id],
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true
        })
      )
    })
  ) })
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

test('hydrateReferences', async () => {
  const { references, expectedReferences } = await setUpHydration()
  await expect(fragmentService.hydrateReferences(references)).resolves.toEqual(expectedReferences)
})

async function setUpHydration () {
  const entries = await factory.buildMany('bibliographyEntry', 2)
  const referenceDtos = await factory.buildMany('referenceDto', 2, entries.map(entry => ({ id: entry.id })))
  const references = List(referenceDtos).map(dto => fromJS(dto))
  const expectedReferences = List(await factory.buildMany('reference', 2, referenceDtos.map((dto, index) => ({
    ...dto,
    document: entries[index]
  }))))
  bibliographyService.find.mockImplementation(id => Promise.resolve(entries.find(entry => entry.id === id)))
  return {
    entries,
    references,
    expectedReferences
  }
}
