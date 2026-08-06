import { TestData, testDelegation } from 'test-support/utils'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import {
  fragmentFactory,
  manuscriptAttestationFactory,
  uncertainFragmentAttestationFactory,
} from 'test-support/fragment-fixtures'
import { QueryResult } from 'query/QueryResult'
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

const { fragmentRepository, fragmentService } =
  createFragmentServiceTestContext()

const lemmas = 'foo I+bar II'
const queryResultStub: QueryResult = { items: [], matchCountTotal: 0 }

describe('search for fragment in corpus', () => {
  const number = 'K.1'
  const manuscriptAttestation = manuscriptAttestationFactory.build(
    {},
    { transient: { museumNumber: 'K.1' } },
  )
  const uncertainFragmentAttestation =
    uncertainFragmentAttestationFactory.build()
  let result: {
    manuscriptAttestations: ReadonlyArray<ManuscriptAttestation>
    uncertainFragmentAttestations: ReadonlyArray<UncertainFragmentAttestation>
  }
  const testData = {
    manuscriptAttestations: [manuscriptAttestation],
    uncertainFragmentAttestations: [uncertainFragmentAttestation],
  }

  beforeEach(async () => {
    fragmentRepository.findInCorpus.mockReturnValue(Promise.resolve(testData))
    result = await fragmentService.findInCorpus(number)
  })

  test('returns attestation data', () => expect(result).toEqual(testData))
  test('calls repository with correct parameters', () =>
    expect(fragmentRepository.findInCorpus).toHaveBeenCalled())
})

const queryTestCases = [
  { lemmas: 'ina I' },
  { lemmas: lemmas, queryOperator: 'and' },
  { lemmas: lemmas, queryOperator: 'or' },
  { lemmas: lemmas, queryOperator: 'line' },
  { lemmas: lemmas, queryOperator: 'phrase' },
  { bibId: 'id' },
  { bibId: 'id', pages: '42' },
  { transliteration: 'me lik\nkur kur' },
  { number: 'X.1' },
  {
    number: 'M.2',
    bibId: 'id',
    pages: '123',
    transliteration: 'ana',
    lemmas: 'šumma I+ina I+qanû I',
    lemmaOperator: 'line',
  },
]

const queryTestData: TestData<FragmentService>[] = queryTestCases.map(
  (parameters) =>
    new TestData(
      'query',
      [parameters],
      fragmentRepository.query,
      queryResultStub,
      [parameters],
      Promise.resolve(queryResultStub),
    ),
)

describe('Query FragmentService', () =>
  testDelegation(fragmentService, queryTestData))

describe('Query by traditional references', () => {
  const fragment = fragmentFactory.build({ traditionalReferences: ['text 1'] })
  const returnData = {
    items: [
      { traditionalReference: 'text 1', fragmentNumbers: [fragment.number] },
    ],
  }
  const expected = Promise.resolve(returnData)
  let result

  beforeEach(async () => {
    fragmentRepository.queryByTraditionalReferences.mockReturnValue(
      Promise.resolve(returnData),
    )
    result = fragmentService.queryByTraditionalReferences(['text 1'])
  })

  test('returns traditional reference to fragment numbers mapping data', () =>
    expect(result).toEqual(expected))
  test('calls repository with correct parameters', () =>
    expect(
      fragmentRepository.queryByTraditionalReferences,
    ).toHaveBeenCalledWith(['text 1']))
})
