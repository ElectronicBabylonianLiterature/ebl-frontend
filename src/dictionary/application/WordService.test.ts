import { testDelegation, TestData } from 'test-support/utils'
import WordService from 'dictionary/application/WordService'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import { wordFactory } from 'test-support/word-fixtures'

jest.mock('dictionary/infrastructure/WordRepository')

const resultStub = {}
const wordRepository = new (WordRepository as jest.Mock<
  jest.Mocked<WordRepository>
>)()

const wordService = new WordService(wordRepository)

const wordToUpdate = wordFactory.build({ _id: 'id' })

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
  new TestData('update', [wordToUpdate], wordRepository.update, resultStub, [
    wordToUpdate,
  ]),
  new TestData(
    'createProperNoun',
    ['Shamash', 'DN'],
    wordRepository.createProperNoun,
    resultStub,
    ['Shamash', 'DN'],
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
