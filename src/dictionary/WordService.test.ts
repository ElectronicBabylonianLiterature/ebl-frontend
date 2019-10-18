import { testDelegation } from 'test-helpers/utils'
import WordService from './WordService'

const resultStub = {}
const wordRepository = {
  find: jest.fn(),
  search: jest.fn(),
  update: jest.fn()
}

const wordService = new WordService(wordRepository)

const testData = [
  ['find', ['id'], wordRepository.find, resultStub],
  ['search', ['aklu'], wordRepository.search, resultStub],
  ['update', [{ _id: 'id' }], wordRepository.update, resultStub]
]

testDelegation(wordService, testData)
