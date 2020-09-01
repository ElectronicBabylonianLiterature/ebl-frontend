import Promise from 'bluebird'
import { factory } from 'factory-girl'
import Folio from 'fragmentarium/domain/Folio'
import _ from 'lodash'
import { fragment } from 'test-support/test-fragment'
import createLemmatizationTestText from 'test-support/test-text'
import { TestData, testDelegation } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import Lemmatization, {
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import FragmentService from './FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import setUpReferences from 'test-support/setUpReferences'
import produce, { Draft } from 'immer'

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  updateGenre: jest.fn(),
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

describe('methods returning hydrated fragment', () => {
  const number = 'K.1'
  let fragment: Fragment
  let expectedFragment: Fragment
  let result: Fragment
  const genre = [['ARCHIVE', 'Administrative']]

  beforeEach(async () => {
    const { entries, references, expectedReferences } = await setUpReferences(
      bibliographyService
    )
    fragment = await factory.build('fragment', {
      number: number,
      references: references,
      genre: [],
    })

    bibliographyService.find.mockImplementation((id) => {
      const entry = entries.find((entry) => entry.id === id)
      return entry
        ? Promise.resolve(entry)
        : Promise.reject(new Error(`${id} not found.`))
    })

    expectedFragment = fragment.setReferences(expectedReferences)
    produce(expectedFragment, (draft: Draft<Fragment>) => {
      draft.genre = genre
    })
  })

  describe('find', () => {
    beforeEach(async () => {
      fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))
      result = await fragmentService.find(fragment.number)
    })

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.find).toHaveBeenCalledWith(number))
  })

  describe('update transliteration', () => {
    const transliteration = '1. kur'
    const notes = 'notes'

    beforeEach(async () => {
      fragmentRepository.updateTransliteration.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateTransliteration(
        fragment.number,
        transliteration,
        notes
      )
    })

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateTransliteration).toHaveBeenCalledWith(
        fragment.number,
        transliteration,
        notes
      ))
  })

  describe('update genre', () => {
    beforeEach(async () => {
      fragmentRepository.updateGenre.mockReturnValue(Promise.resolve(fragment))
      result = await fragmentService.updateGenre(fragment.number, genre)
    })

    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
  })

  describe('update lemmatization', () => {
    const lemmatization: Lemmatization = new Lemmatization(
      ['1.'],
      [[new LemmatizationToken('kur', true, [])]]
    )

    beforeEach(async () => {
      fragmentRepository.updateLemmatization.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateLemmatization(
        fragment.number,
        lemmatization.toDto()
      )
    })

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateLemmatization).toHaveBeenCalledWith(
        fragment.number,
        lemmatization.toDto()
      ))
  })

  describe('update references', () => {
    beforeEach(async () => {
      fragmentRepository.updateReferences.mockReturnValue(
        Promise.resolve(fragment)
      )
      result = await fragmentService.updateReferences(
        fragment.number,
        fragment.references
      )
    })

    test('Returns hydrated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('Finds correct fragment', () =>
      expect(fragmentRepository.updateReferences).toHaveBeenCalledWith(
        fragment.number,
        fragment.references
      ))
  })
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

  const expectedLemmas = _([words[0]])
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
