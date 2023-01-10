import _ from 'lodash'
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
    [_.take(lemmas, 1)],
    queryRepository.query,
    queryResult,
    [{ lemmas: 'foo I' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ lemmas: lemmas.join('+'), queryOperator: 'and' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ lemmas: lemmas.join('+'), queryOperator: 'or' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ lemmas: lemmas.join('+'), queryOperator: 'line' }],
    Promise.resolve(queryResult)
  ),
  new TestData(
    'query',
    [lemmas],
    queryRepository.query,
    queryResult,
    [{ lemmas: lemmas.join('+'), queryOperator: 'phrase' }],
    Promise.resolve(queryResult)
  ),
]

describe('ApiQueryRepository', () => testDelegation(queryService, testData))
