import { testDelegation, TestData } from 'test-support/utils'
import WordService from './WordService'
import WordRepository from 'dictionary/infrastructure/WordRepository'

jest.mock('dictionary/infrastructure/WordRepository')

const resultStub = {}
const wordRepository = new (WordRepository as jest.Mock<
  jest.Mocked<WordRepository>
>)()

const wordService = new WordService(wordRepository)

const testData: TestData[] = [
  ['find', ['id'], wordRepository.find as jest.Mock, resultStub],
  ['search', ['aklu'], wordRepository.search as jest.Mock, resultStub],
  ['update', [{ _id: 'id' }], wordRepository.update as jest.Mock, resultStub],
]
describe('test word Service', () => {
  testDelegation(wordService, testData)
})
