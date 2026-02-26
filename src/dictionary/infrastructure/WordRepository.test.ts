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

const testData: TestData<WordRepository>[] = [
  new TestData(
    'find',
    [wordId],
    apiClient.fetchJson,
    resultStub,
    [`/words/${encodeURIComponent(wordId)}`, false],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'search',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/words?query=${encodeURIComponent(query)}`, false],
    Promise.resolve([resultStub]),
  ),
  new TestData(
    'searchLemma',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/words?lemma=${encodeURIComponent(query)}`, false],
    Promise.resolve([resultStub]),
  ),
  new TestData(
    'update',
    [word],
    apiClient.postJson,
    resultStub,
    [`/words/${encodeURIComponent(word._id)}`, word],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'createProperNoun',
    ['Shamash', 'DN'],
    apiClient.postJson,
    resultStub,
    [`/words/create-proper-noun`, { lemma: 'Shamash', posTag: 'DN' }],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'listAllWords',
    [],
    apiClient.fetchJson,
    [word._id],
    ['/words/all', false],
    Promise.resolve([word._id]),
  ),
]
describe('test word repository', () => {
  testDelegation(wordRepository, testData)
})
