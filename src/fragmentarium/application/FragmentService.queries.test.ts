import Promise from 'bluebird'
import { TestData, testDelegation } from 'test-support/utils'
import FragmentService from './FragmentService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { QueryResult } from 'query/QueryResult'
import {
  fragmentRepository,
  fragmentService,
} from 'fragmentarium/application/fragmentService.testSupport'

const lemmas = 'foo I+bar II'
const queryResultStub: QueryResult = { items: [], matchCountTotal: 0 }

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
