import { testDelegation } from 'testHelpers'
import WordService from './WordService'

const resultStub = {}
const auth = {
  applicationScopes: {
    readWords: 'read:words',
    writeWords: 'write:words'
  },
  isAllowedTo: jest.fn()
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
  ['isAllowedToRead', [], auth.isAllowedTo, true, [auth.applicationScopes.readWords]],
  ['isAllowedToWrite', [], auth.isAllowedTo, true, [auth.applicationScopes.writeWords]]
]

testDelegation(wordService, testData)
