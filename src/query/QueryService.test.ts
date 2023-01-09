import { testDelegation, TestData } from 'test-support/utils'
import { QueryResult } from './QueryResult'
import { QueryService } from './QueryService'

const queryRepository = { query: jest.fn() }
const queryService = new QueryService(queryRepository)
const lemmas = ['foo I', 'bar II']
const queryResult: QueryResult = { items: [], matchCountTotal: 0 }

const testData: TestData<QueryService>[] = [
  new TestData(
    'query',
    [lemmas[0]],
    queryRepository.query,
    queryResult,
    [{ lemma: 'foo I' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'queryAnd',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ and: 'foo I+bar II' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'queryOr',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ or: 'foo I+bar II' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'queryLine',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ line: 'foo I+bar II' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'queryPhrase',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ phrase: 'foo I+bar II' }],
    Promise.resolve(queryResult)
  ),
]

describe('ApiQueryRepository', () => testDelegation(queryService, testData))
