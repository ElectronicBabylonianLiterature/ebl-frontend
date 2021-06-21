import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import ApiClient from 'http/ApiClient'
import SignsRepository from 'signs/infrastructure/SignsRepository'
import Sign from 'signs/domain/Sign'
import { stringify } from 'query-string'

jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const signsRepository = new SignsRepository(apiClient)
const signName = 'BAR'
const query = { value: 'bar', subIndex: 1 }

const resultStub = Sign.fromDto({
  name: '|E₂.BAR|',
  lists: [],
  values: [{ value: 'saŋŋa' }],
  logograms: [],
  mesZl: '',
  unicode: [],
})

const testData: TestData[] = [
  [
    'find',
    [signName],
    apiClient.fetchJson,
    resultStub,
    [`/signs/${encodeURIComponent(signName)}`, true],
    Promise.resolve(resultStub),
  ],
  [
    'search',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/signs?${stringify(query)}`, true],
    Promise.resolve([resultStub]),
  ],
]
describe('test word repository', () => {
  testDelegation(signsRepository, testData)
})
