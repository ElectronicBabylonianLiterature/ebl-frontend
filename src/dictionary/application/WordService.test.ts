import { testDelegation, TestData } from 'test-support/utils'
import WordService from './WordService'
import WordRepository from 'dictionary/infrastructure/WordRepository'

jest.mock('dictionary/infrastructure/WordRepository')

const resultStub = {}
const wordRepository = new (WordRepository as jest.Mock<
  jest.Mocked<WordRepository>
>)()

const wordService = new WordService(wordRepository)

const testData: TestData<WordService>[] = [
  new TestData('find', ['id'], wordRepository.find, resultStub),
  new TestData('findAll', [['id', 'id2']], wordRepository.findAll, resultStub),
  new TestData(
    'search',
    [{ word: 'aklu' }],
    wordRepository.search,
    resultStub,
    ['word=aklu']
  ),
  new TestData('update', [{ _id: 'id' }], wordRepository.update, resultStub),
  new TestData(
    'createProperNoun',
    ['Shamash', 'DN'],
    wordRepository.createProperNoun,
    resultStub
  ),
  new TestData('listAllWords', [], wordRepository.listAllWords, []),
]
describe('test word Service', () => {
  testDelegation(wordService, testData)
})
