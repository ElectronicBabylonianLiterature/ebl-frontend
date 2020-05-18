import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import Folio from 'fragmentarium/domain/Folio'
import _ from 'lodash'
import { fragment } from 'test-helpers/test-fragment'
import createLemmatizationTestText from 'test-helpers/test-text'
import { TestData, testDelegation } from 'test-helpers/utils'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization from 'transliteration/domain/Lemmatization'
import FragmentService from './FragmentService'

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  updateReferences: jest.fn(),
  folioPager: jest.fn(),
  fragmentPager: jest.fn(),
  findLemmas: jest.fn(),
  fetchCdliInfo: jest.fn(),
  findAnnotations: jest.fn(),
  updateAnnotations: jest.fn(),
}
const wordRepository = {
  searchLemma: jest.fn(),
  find: jest.fn(),
}
const imageRepository = {
  find: jest.fn(),
  findFolio: jest.fn(),
  findPhoto: jest.fn(),
}
const bibliographyService = {
  find: jest.fn(),
  search: jest.fn(),
}
const fragmentService = new FragmentService(
  fragmentRepository,
  imageRepository,
  wordRepository,
  bibliographyService
)
const testData: TestData[] = [
  ['statistics', [], fragmentRepository.statistics, resultStub],
  [
    'updateTransliteration',
    ['K.1', '1. kur', 'notes'],
    fragmentRepository.updateTransliteration,
    resultStub,
  ],
  [
    'updateLemmatization',
    ['K.1', [[{ value: 'kur', uniqueLemma: [] }]]],
    fragmentRepository.updateLemmatization,
    resultStub,
  ],
  [
    'updateReferences',
    [
      'K.1',
      [[{ id: 'id', type: 'EDITION', notes: '', pages: '', linesCited: [] }]],
    ],
    fragmentRepository.updateReferences,
    resultStub,
  ],
  ['findFolio', [folio], imageRepository.findFolio, resultStub, [folio]],
  ['findImage', [fileName], imageRepository.find, resultStub, [fileName]],
  [
    'findPhoto',
    [fragment],
    imageRepository.findPhoto,
    resultStub,
    [fragment.number],
  ],
  ['folioPager', [folio, 'K.1'], fragmentRepository.folioPager, resultStub],
  ['fragmentPager', ['K.1'], fragmentRepository.fragmentPager, resultStub],
  ['searchLemma', ['lemma'], wordRepository.searchLemma, [resultStub]],
  [
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub],
  ],
  [
    'fetchCdliInfo',
    [fragment],
    fragmentRepository.fetchCdliInfo,
    resultStub,
    [fragment.cdliNumber],
  ],
  [
    'findAnnotations',
    [fragment.number],
    fragmentRepository.findAnnotations,
    resultStub,
  ],
  [
    'updateAnnotations',
    [fragment.number, resultStub],
    fragmentRepository.updateAnnotations,
    resultStub,
  ],
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', (method) => {
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
    const fragment = await factory.build('fragment', {
      number: number,
      references: references,
    })

    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
    bibliographyService.find.mockImplementation((id) =>
      Promise.resolve(entries.find((entry) => entry.id === id))
    )

    expectedFragment = fragment.setReferences(expectedReferences)

    result = await fragmentService.find(fragment.number)
  })

  test('Returns hydrated fragment', () =>
    expect(result).toEqual(expectedFragment))
  test('Finds correct fragment', () =>
    expect(fragmentRepository.find).toHaveBeenCalledWith(number))
})

test('createLemmatization', async () => {
  const [text, words] = await createLemmatizationTestText()
  const wordMap = _.keyBy(words, '_id')
  const suggestions = {
    kur: words[2],
    nu: words[3],
  }
  wordRepository.find.mockImplementation((id) =>
    wordMap[id] ? Promise.resolve(wordMap[id]) : Promise.reject(new Error())
  )
  fragmentRepository.findLemmas.mockImplementation((word) =>
    Promise.resolve(suggestions[word] ? [[suggestions[word]]] : [])
  )

  const expectedLemmas = _([words[0], words[1]])
    .map((word) => new Lemma(word))
    .keyBy('value')
    .value()
  const expectedSuggestions = _.mapValues(suggestions, (word) => [
    [new Lemma(word)],
  ])
  const lemmatization = new Lemmatization([], [])

  jest.spyOn(text, 'createLemmatization').mockReturnValue(lemmatization)

  const result = await fragmentService.createLemmatization(text)
  expect(result).toEqual(lemmatization)
  expect(text.createLemmatization).toHaveBeenCalledWith(
    expectedLemmas,
    expectedSuggestions
  )
})

test('hydrateReferences', async () => {
  const { references, expectedReferences } = await setUpHydration()
  await expect(fragmentService.hydrateReferences(references)).resolves.toEqual(
    expectedReferences
  )
})

async function setUpHydration(): Promise<{
  entries: readonly BibliographyEntry[]
  references: readonly {}[]
  expectedReferences: readonly Reference[]
}> {
  const entries = await factory.buildMany('bibliographyEntry', 2)
  const references = await factory.buildMany(
    'referenceDto',
    2,
    entries.map((entry: BibliographyEntry) => ({ id: entry.id }))
  )
  const expectedReferences = await factory.buildMany(
    'reference',
    2,
    references.map((dto, index) => ({
      ...dto,
      document: entries[index],
    }))
  )
  bibliographyService.find.mockImplementation((id) =>
    Promise.resolve(entries.find((entry: BibliographyEntry) => entry.id === id))
  )
  return {
    entries,
    references,
    expectedReferences,
  }
}
