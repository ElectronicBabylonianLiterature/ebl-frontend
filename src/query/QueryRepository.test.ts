import { ApiQueryRepository } from './QueryRepository'
import { testDelegation, TestData } from 'test-support/utils'
import { QueryResult } from './QueryResult'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const queryRepository = new ApiQueryRepository(apiClient)
const lemmas = 'foo I+bar II'
const queryResult: QueryResult = { items: [], matchCountTotal: 0 }

const testValues = [
  { queryOperator: 'lemma', value: 'foo I' },
  { queryOperator: 'and', value: lemmas },
  { queryOperator: 'or', value: lemmas },
  { queryOperator: 'line', value: lemmas },
  { queryOperator: 'phrase', value: lemmas },
]

const testData: TestData<ApiQueryRepository>[] = testValues.map(
  ({ queryOperator, value }) =>
    new TestData(
      'query',
      [{ [queryOperator]: value }],
      apiClient.fetchJson,
      queryResult,
      [`/fragments/query?${queryOperator}=${encodeURIComponent(value)}`, false],
      Promise.resolve(queryResult)
    )
)

describe('ApiQueryRepository', () => testDelegation(queryRepository, testData))
