
import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import WordRepository from './WordRepository'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn()
}
const wordRepository = new WordRepository(apiClient)
const wordId = '123+123'
const query = 'the king'
const word = {
  _id: wordId
}
const resultStub = {}

const testData = [
  ['find', [wordId], apiClient.fetchJson, resultStub, [`/words/${encodeURIComponent(wordId)}`, true], Promise.resolve(resultStub)],
  ['search', [query], apiClient.fetchJson, resultStub, [`/words?query=${encodeURIComponent(query)}`, true], Promise.resolve(resultStub)],
  ['searchLemma', [query], apiClient.fetchJson, resultStub, [`/words?lemma=${encodeURIComponent(query)}`, true], Promise.resolve(resultStub)],
  ['update', [word], apiClient.postJson, resultStub, [`/words/${encodeURIComponent(word._id)}`, word], Promise.resolve(resultStub)]
]

testDelegation(wordRepository, testData)
