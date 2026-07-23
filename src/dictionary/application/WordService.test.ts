import { testDelegation, TestData } from 'test-support/utils'
import WordService from './WordService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import Word from 'dictionary/domain/Word'

jest.mock('dictionary/infrastructure/WordRepository')

const resultStub = {}
const wordRepository = new (WordRepository as jest.Mock<
  jest.Mocked<WordRepository>
>)()

const wordService = new WordService(wordRepository)

const testData: TestData<WordService>[] = [
  new TestData('find', ['id'], wordRepository.find, resultStub, [
    'id',
    undefined,
  ]),
  new TestData('findAll', [['id', 'id2']], wordRepository.findAll, resultStub, [
    ['id', 'id2'],
    undefined,
  ]),
  new TestData(
    'search',
    [{ word: 'aklu' }],
    wordRepository.search,
    resultStub,
    ['word=aklu', undefined],
  ),
  new TestData('update', [{ _id: 'id' }], wordRepository.update, resultStub, [
    { _id: 'id' } as unknown as Word,
    undefined,
  ]),
  new TestData(
    'createProperNoun',
    ['Shamash', 'DN'],
    wordRepository.createProperNoun,
    resultStub,
    ['Shamash', 'DN', undefined],
  ),
  new TestData(
    'listAllWords',
    [],
    wordRepository.listAllWords,
    [],
    [undefined],
  ),
]
describe('test word Service', () => {
  testDelegation(wordService, testData)
})
