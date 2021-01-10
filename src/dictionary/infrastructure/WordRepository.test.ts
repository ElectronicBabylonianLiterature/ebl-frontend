import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import WordRepository from './WordRepository'
import ApiClient from 'http/ApiClient'

const apiClient = new (ApiClient as jest.Mock<ApiClient>)()
const mockFetchJson = jest.fn()
const mockPostJson = jest.fn()
apiClient.fetchJson = mockFetchJson
apiClient.postJson = mockPostJson

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
    mockFetchJson,
    resultStub,
    [`/words/${encodeURIComponent(wordId)}`, true],
    Promise.resolve(resultStub),
  ],
  [
    'search',
    [query],
    mockFetchJson,
    [resultStub],
    [`/words?query=${encodeURIComponent(query)}`, true],
    Promise.resolve([resultStub]),
  ],
  [
    'searchLemma',
    [query],
    mockFetchJson,
    [resultStub],
    [`/words?lemma=${encodeURIComponent(query)}`, true],
    Promise.resolve([resultStub]),
  ],
  [
    'update',
    [word],
    mockPostJson,
    resultStub,
    [`/words/${encodeURIComponent(word._id)}`, word],
    Promise.resolve(resultStub),
  ],
]

testDelegation(wordRepository, testData)
