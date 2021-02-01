import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import WordRepository from './WordRepository'
import ApiClient from 'http/ApiClient'

jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const wordRepository = new WordRepository(apiClient)
const wordId = '123+123'
const query = 'the king'
const word = {
  _id: wordId,
}
const resultStub = { pos: ['AJ'] }

const testData: TestData[] = [
  [
    'find',
    [wordId],
    apiClient.fetchJson,
    resultStub,
    [`/words/${encodeURIComponent(wordId)}`, true],
    Promise.resolve(resultStub),
  ],
  [
    'search',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/words?query=${encodeURIComponent(query)}`, true],
    Promise.resolve([resultStub]),
  ],
  [
    'searchLemma',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/words?lemma=${encodeURIComponent(query)}`, true],
    Promise.resolve([resultStub]),
  ],
  [
    'update',
    [word],
    apiClient.postJson,
    resultStub,
    [`/words/${encodeURIComponent(word._id)}`, word],
    Promise.resolve(resultStub),
  ],
]
describe('test word repository', () => {
  testDelegation(wordRepository, testData)
})
