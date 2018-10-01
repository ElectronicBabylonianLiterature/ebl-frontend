import { testDelegation } from 'testHelpers'
import WordService from './WordService'

const resultStub = {}
const auth = {
  isAllowedToReadWords: jest.fn(),
  isAllowedToWriteWords: jest.fn()
}
const wordRepository = {
  find: jest.fn(),
  search: jest.fn(),
  update: jest.fn()
}

const wordService = new WordService(auth, wordRepository)

const testData = [
  ['find', ['id'], wordRepository.find, resultStub],
  ['search', ['aklu'], wordRepository.search, resultStub],
  ['update', [{ _id: 'id' }], wordRepository.update, resultStub],
  ['isAllowedToRead', [], auth.isAllowedToReadWords, true],
  ['isAllowedToWrite', [], auth.isAllowedToWriteWords, true]
]

testDelegation(wordService, testData)
