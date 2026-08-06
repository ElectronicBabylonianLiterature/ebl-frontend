import Folio from 'fragmentarium/domain/Folio'
import { fragment } from 'test-support/test-fragment'
import { TestData, testDelegation } from 'test-support/utils'
import Lemma from 'transliteration/domain/Lemma'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { produce, Draft } from 'immer'
import Word from 'dictionary/domain/Word'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { wordFactory } from 'test-support/word-fixtures'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { createFragmentServiceTestContext } from 'fragmentarium/application/FragmentService.testSupport'

jest.mock('bibliography/application/BibliographyService', () => {
  return function () {
    return { find: jest.fn(), findMany: jest.fn(), search: jest.fn() }
  }
})

jest.mock('dictionary/infrastructure/WordRepository', () => {
  return function () {
    return { searchLemma: jest.fn(), find: jest.fn(), findAll: jest.fn() }
  }
})

const resultStub = {}
const folio = new Folio({ name: 'AKG', number: '375' })
const fileName = 'Babel_Project_01_cropped.svg'
const word: Word = wordFactory.build()
const lemmaSuggestions = new Map([['foo', new LemmaOption(word)]])

const {
  fragmentRepository,
  imageRepository,
  wordRepository,
  bibliographyService,
  fragmentService,
} = createFragmentServiceTestContext()

const testData: TestData<FragmentService>[] = [
  new TestData('statistics', [], fragmentRepository.statistics, resultStub, [
    undefined,
  ]),
  new TestData(
    'lineToVecRanking',
    ['X.0'],
    fragmentRepository.lineToVecRanking,
    resultStub,
    ['X.0', undefined],
  ),
  new TestData('findFolio', [folio], imageRepository.findFolio, resultStub, [
    folio,
    undefined,
  ]),
  new TestData('findImage', [fileName], imageRepository.find, resultStub, [
    fileName,
  ]),
  new TestData('findPhoto', [fragment], imageRepository.findPhoto, resultStub, [
    fragment.number,
    undefined,
  ]),
  new TestData(
    'findThumbnail',
    [fragment, 'small'],
    imageRepository.findThumbnail,
    resultStub,
    [fragment.number, 'small'],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'folioPager',
    [folio, 'K.1'],
    fragmentRepository.folioPager,
    resultStub,
    [folio, 'K.1', undefined],
  ),
  new TestData(
    'fragmentPager',
    ['K.1'],
    fragmentRepository.fragmentPager,
    resultStub,
    ['K.1', undefined],
  ),
  new TestData('searchLemma', ['lemma'], wordRepository.searchLemma, [
    resultStub,
  ]),
  new TestData(
    'searchBibliography',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyService.search,
    [resultStub],
  ),
  new TestData(
    'findAnnotations',
    [fragment.number],
    fragmentRepository.findAnnotations,
    resultStub,
    [fragment.number, false, undefined],
  ),
  new TestData(
    'generateAnnotations',
    [fragment.number],
    fragmentRepository.findAnnotations,
    resultStub,
    [fragment.number, true],
  ),
  new TestData(
    'updateAnnotations',
    [fragment.number, resultStub],
    fragmentRepository.updateAnnotations,
    resultStub,
    undefined,
    Promise.resolve(resultStub),
  ),
  new TestData(
    'findSuggestions',
    ['kur', true],
    fragmentRepository.findLemmas,
    [[new Lemma(word)]],
    ['kur', true],
    Promise.resolve([[word]]),
  ),
  new TestData(
    'listAllFragments',
    [],
    fragmentRepository.listAllFragments,
    [],
    [],
    Promise.resolve([]),
  ),
  new TestData(
    'collectLemmaSuggestions',
    ['K.1'],
    fragmentRepository.collectLemmaSuggestions,
    lemmaSuggestions,
    ['K.1'],
    Promise.resolve(lemmaSuggestions),
  ),
]

testDelegation(fragmentService, testData)

describe.each(['searchLemma'])('%s', (method) => {
  test('Resolves to empty array on zero length query', async () => {
    await expect(fragmentService[method]('')).resolves.toEqual([])
  })
})

describe('findPhoto', () => {
  test("throws when fragment doesn't have a photo", () => {
    const fragmentWithoutPhoto = produce(
      fragmentFactory.build({ number: 'X.1' }),
      (draft: Draft<Fragment>) => {
        draft.hasPhoto = false
      },
    )

    expect(() => fragmentService.findPhoto(fragmentWithoutPhoto)).toThrowError(
      "Fragment X.1 doesn't have a Photo",
    )
  })
})

describe('isInFragmentarium', () => {
  test('returns true when repository find does not throw synchronously', () => {
    fragmentRepository.find.mockReturnValue(Promise.resolve(fragment))

    expect(fragmentService.isInFragmentarium('K.1')).toBe(true)
  })

  test('returns false when repository find throws synchronously', () => {
    fragmentRepository.find.mockImplementation(() => {
      throw new Error('not found')
    })

    expect(fragmentService.isInFragmentarium('K.404')).toBe(false)
  })
})
