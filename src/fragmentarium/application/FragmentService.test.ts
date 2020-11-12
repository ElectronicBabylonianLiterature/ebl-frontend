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
import produce, { castDraft, Draft } from 'immer'
import { Genres } from 'fragmentarium/domain/Genres'
import Word from 'dictionary/domain/Word'

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const word: Word = {
  _id: 'aklu I',
  lemma: ['aklu'],
  homonym: 'I',
  guideWord: 'test',
  oraccWords: [],
  pos: [],
}
const fragmentRepository = {
  statistics: jest.fn(),
  find: jest.fn(),
  updateTransliteration: jest.fn(),
  updateLemmatization: jest.fn(),
  fetchGenres: jest.fn(),
  updateGenres: jest.fn(),
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
  [
    'findSuggestions',
    ['kur', true],
    fragmentRepository.findLemmas,
    [[new Lemma(word)]],
    ['kur', true],
    Promise.resolve([[word]]),
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
  let genreResult: string[][]
  const genreOptions = [['ARCHIVE', 'Administrative']]
  const genres: Genres = Genres.fromJson([
    {
      category: ['ARCHIVE', 'Administrative'],
      uncertain: false,
    },
  ])

  beforeEach(async () => {
    const { entries, references, expectedReferences } = await setUpReferences(
      bibliographyService
    )
    fragment = await factory.build('fragment', {
      number: number,
      references: references,
      genres: new Genres([]),
    })
    bibliographyService.find.mockImplementation((id) => {
      const entry = entries.find((entry) => entry.id === id)
      return entry
        ? Promise.resolve(entry)
        : Promise.reject(new Error(`${id} not found.`))
    })

    expectedFragment = fragment.setReferences(expectedReferences)
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
  describe('fetch genres', () => {
    beforeEach(async () => {
      fragmentRepository.fetchGenres.mockReturnValue(
        Promise.resolve(genreOptions)
      )
      genreResult = await fragmentService.fetchGenres()
    })
    test('returns genres', () => expect(genreResult).toEqual(genreOptions))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.fetchGenres).toHaveBeenCalled())
  })

  describe('update genre', () => {
    beforeEach(async () => {
      expectedFragment = produce(expectedFragment, (draft: Draft<Fragment>) => {
        draft.genres = castDraft(genres)
      })
      fragmentRepository.updateGenres.mockReturnValue(
        Promise.resolve(expectedFragment)
      )
      result = await fragmentService.updateGenres(fragment.number, genres)
    })
    test('returns updated fragment', () =>
      expect(result).toEqual(expectedFragment))
    test('calls repository with correct parameters', () =>
      expect(fragmentRepository.updateGenres).toHaveBeenCalledWith(
        fragment.number,
        genres
      ))
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
  const lemmatization = new Lemmatization(
    ['1.', '#note: '],
    text.allLines.map((line) =>
      line.content.map(
        (token) =>
          new LemmatizationToken(
            token.value,
            token.lemmatizable ?? false,
            token.uniqueLemma?.map((lemma) => expectedLemmas[lemma]) ?? null,
            token.lemmatizable
              ? expectedSuggestions[token.cleanValue] ?? []
              : null
          )
      )
    )
  )

  const result = await fragmentService.createLemmatization(text)
  expect(result).toEqual(lemmatization)
})
