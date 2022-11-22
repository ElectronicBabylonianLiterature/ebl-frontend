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

const testData: TestData<ApiQueryRepository>[] = [
  new TestData(
    'query',
    [{ lemma: 'foo I' }],
    apiClient.fetchJson,
    queryResult,
    [`/fragments/query?lemma=${encodeURIComponent('foo I')}`, true],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [{ and: lemmas }],
    apiClient.fetchJson,
    queryResult,
    [`/fragments/query?and=${encodeURIComponent(lemmas)}`, true],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [{ or: lemmas }],
    apiClient.fetchJson,
    queryResult,
    [`/fragments/query?or=${encodeURIComponent(lemmas)}`, true],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [{ line: lemmas }],
    apiClient.fetchJson,
    queryResult,
    [`/fragments/query?line=${encodeURIComponent(lemmas)}`, true],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [{ phrase: lemmas }],
    apiClient.fetchJson,
    queryResult,
    [`/fragments/query?phrase=${encodeURIComponent(lemmas)}`, true],
    Promise.resolve(queryResult)
  ),
]

describe('ApiQueryRepository', () => testDelegation(queryRepository, testData))
